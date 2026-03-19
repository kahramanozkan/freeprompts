// Language definitions and flags
export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

// Prompt Language Options (10 languages)
export const promptLanguages: LanguageOption[] = [
  { code: 'english', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'spanish', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'french', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'german', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'russian', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'chinese', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'portuguese', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'hindi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'japanese', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'turkish', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' }
];

// Site Language Options (5 languages)
export const siteLanguages: LanguageOption[] = [
  { code: 'english', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'russian', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'portuguese', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'hindi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'turkish', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' }
];

// Real Translation Service Integration
export { translateText } from './translation-service';