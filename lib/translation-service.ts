// Real Translation Service with Google Translate API
interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
}

interface CacheEntry {
  translation: string;
  timestamp: number;
}

class TranslationCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours

  private getKey(text: string, fromLang: string, toLang: string): string {
    return `${fromLang}-${toLang}-${text}`;
  }

  get(text: string, fromLang: string, toLang: string): string | null {
    const key = this.getKey(text, fromLang, toLang);
    const entry = this.cache.get(key);
    
    if (entry && Date.now() - entry.timestamp < this.TTL) {
      return entry.translation;
    }
    
    if (entry) {
      this.cache.delete(key);
    }
    
    return null;
  }

  set(text: string, fromLang: string, toLang: string, translation: string): void {
    const key = this.getKey(text, fromLang, toLang);
    this.cache.set(key, {
      translation,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.TTL) {
        this.cache.delete(key);
      }
    }
  }
}

class GoogleTranslateService {
  private apiKey: string;
  private cache: TranslationCache;
  private readonly baseUrl = 'https://translation.googleapis.com/language/translate/v2';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_TRANSLATE_API_KEY || '';
    this.cache = new TranslationCache();
    
    // Cleanup cache every 6 hours
    setInterval(() => {
      this.cache.cleanup();
    }, 6 * 60 * 60 * 1000);
  }

  // Map our language codes to Google Translate language codes
  private mapLanguageCode(langCode: string): string {
    const mapping: { [key: string]: string } = {
      'english': 'en',
      'spanish': 'es',
      'french': 'fr',
      'german': 'de',
      'russian': 'ru',
      'chinese': 'zh',
      'portuguese': 'pt',
      'hindi': 'hi',
      'japanese': 'ja',
      'turkish': 'tr'
    };
    
    return mapping[langCode] || langCode;
  }

  // Check if API key is configured
  private isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Main translation function
  async translateText(text: string, fromLang: string, toLang: string): Promise<string> {
    // Return original text if languages are the same
    if (fromLang === toLang) {
      return text;
    }

    // Check cache first
    const cachedTranslation = this.cache.get(text, fromLang, toLang);
    if (cachedTranslation) {
      console.log('🎯 Translation served from cache');
      return cachedTranslation;
    }

    // If not configured, return mock translation
    if (!this.isConfigured()) {
      console.log('⚠️ Translation API not configured, using fallback');
      return this.fallbackTranslation(text, toLang);
    }

    try {
      console.log(`🌍 Translating from ${fromLang} to ${toLang}`);
      
      const sourceLang = this.mapLanguageCode(fromLang);
      const targetLang = this.mapLanguageCode(toLang);

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: 'text'
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Google Translate API error:', response.status, errorData);
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data && data.data.translations && data.data.translations.length > 0) {
        const translation = data.data.translations[0].translatedText;
        
        // Cache the result
        this.cache.set(text, fromLang, toLang, translation);
        
        console.log('✅ Translation completed successfully');
        return translation;
      } else {
        throw new Error('Invalid response format from translation API');
      }

    } catch (error) {
      console.error('💥 Translation failed:', error);
      
      // Fallback to original text or mock translation
      return this.fallbackTranslation(text, toLang);
    }
  }

  // Fallback translation when API fails
  private fallbackTranslation(text: string, toLang: string): string {
    const languageNames: { [key: string]: string } = {
      'english': 'English',
      'spanish': 'Español',
      'french': 'Français',
      'german': 'Deutsch',
      'russian': 'Русский',
      'chinese': '中文',
      'portuguese': 'Português',
      'hindi': 'हिन्दी',
      'japanese': '日本語',
      'turkish': 'Türkçe'
    };

    const targetLangName = languageNames[toLang] || toLang;
    
    // Return original text with language indicator
    return `[${targetLangName}]: ${text}`;
  }

  // Batch translate multiple texts
  async batchTranslate(texts: string[], fromLang: string, toLang: string): Promise<string[]> {
    const translations = await Promise.all(
      texts.map(text => this.translateText(text, fromLang, toLang))
    );
    return translations;
  }

  // Get supported languages from API
  async getSupportedLanguages(): Promise<{ code: string; name: string }[]> {
    if (!this.isConfigured()) {
      // Return default languages if API not configured
      return [
        { code: 'english', name: 'English' },
        { code: 'spanish', name: 'Spanish' },
        { code: 'french', name: 'French' },
        { code: 'german', name: 'German' },
        { code: 'russian', name: 'Russian' },
        { code: 'chinese', name: 'Chinese' },
        { code: 'portuguese', name: 'Portuguese' },
        { code: 'hindi', name: 'Hindi' },
        { code: 'japanese', name: 'Japanese' },
        { code: 'turkish', name: 'Turkish' }
      ];
    }

    try {
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2/languages?key=${this.apiKey}&target=en`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch supported languages: ${response.status}`);
      }

      const data = await response.json();
      
      return data.data.languages.map((lang: any) => ({
        code: lang.language,
        name: lang.name
      }));
    } catch (error) {
      console.error('Failed to fetch supported languages:', error);
      // Return default languages on error
      return [
        { code: 'english', name: 'English' },
        { code: 'spanish', name: 'Spanish' },
        { code: 'french', name: 'French' },
        { code: 'german', name: 'German' },
        { code: 'russian', name: 'Russian' },
        { code: 'chinese', name: 'Chinese' },
        { code: 'portuguese', name: 'Portuguese' },
        { code: 'hindi', name: 'Hindi' },
        { code: 'japanese', name: 'Japanese' },
        { code: 'turkish', name: 'Turkish' }
      ];
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const translationService = new GoogleTranslateService();

// Export the main function for backward compatibility
export const translateText = (text: string, fromLang: string, toLang: string): Promise<string> => {
  return translationService.translateText(text, fromLang, toLang);
};

// Export additional utilities
export { GoogleTranslateService, TranslationCache };