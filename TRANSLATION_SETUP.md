# Translation API Setup Guide

Bu projede gerçek translation API entegrasyonu tamamlanmıştır. Google Translate API'yi kullanarak prompt metinlerini farklı dillere çevirebilirsiniz.

## 🚀 Özellikler

- **Gerçek API Entegrasyonu**: Google Translate API kullanarak gerçek çeviriler
- **Performans Cache**: 24 saatlik cache sistemi ile hızlı performans
- **Otomatik Fallback**: API hatası durumunda orijinal metni gösterir
- **Kullanıcı Dostu UI**: Loading durumları ve çeviri göstergeleri
- **Batch Translation**: Çoklu metin çevirisi desteği

## 🔧 Kurulum

### 1. Google Translate API Key Alın

1. [Google Cloud Console](https://console.cloud.google.com/)'a gidin
2. Yeni bir proje oluşturun veya mevcut projeyi seçin
3. [Translation API](https://console.cloud.google.com/apis/library/translate.googleapis.com)'yi etkinleştirin
4. [Credentials](https://console.cloud.google.com/apis/credentials) sayfasından API key oluşturun
5. API key'i kopyalayın

### 2. Environment Variables

`.env.local` dosyanıza şu değişkeni ekleyin:

```bash
GOOGLE_TRANSLATE_API_KEY=your-google-translate-api-key
```

### 3. Projeyi Test Edin

Development sunucusunu başlatın:

```bash
npm run dev
```

Test için `/translation-test` sayfasına gidin ve translation özelliğini test edin.

## 🌍 Desteklenen Diller

- 🇺🇸 English (İngilizce)
- 🇪🇸 Spanish (İspanyolca)
- 🇫🇷 French (Fransızca)
- 🇩🇪 German (Almanca)
- 🇷🇺 Russian (Rusça)
- 🇨🇳 Chinese (Çince)
- 🇵🇹 Portuguese (Portekizce)
- 🇮🇳 Hindi (Hintçe)
- 🇯🇵 Japanese (Japonca)
- 🇹🇷 Turkish (Türkçe)

## 💻 Kullanım

### Temel Kullanım

```typescript
import { translateText } from '@/lib/translation-service';

// Bir metni Türkçe'ye çevir
const translated = await translateText('Hello world!', 'english', 'turkish');
console.log(translated); // "Merhaba dünya!"
```

### Prompt Translation (Mevcut Kullanım)

Kullanıcılar prompt detay sayfasında dil seçerek çeviri yapabilirler:

```tsx
// Bu prompt Türkçe dilinde görüntüleniyor
const handleTranslate = async (targetLanguage: string) => {
  setIsTranslating(true);
  try {
    const translatedText = await translateText(prompt.content, 'english', targetLanguage);
    setDisplayContent(translatedText);
  } catch (error) {
    console.error('Translation failed:', error);
    setDisplayContent(prompt.content); // Fallback to original
  } finally {
    setIsTranslating(false);
  }
};
```

### Batch Translation

```typescript
import { translationService } from '@/lib/translation-service';

const texts = ['Hello', 'How are you?', 'Good morning!'];
const translations = await translationService.batchTranslate(texts, 'english', 'turkish');
// ['Merhaba', 'Nasılsın?', 'Günaydın!']
```

### Cache Yönetimi

```typescript
// Cache'i temizle
translationService.clearCache();

// Cache'den gelen çeviri hızlıdır (24 saat boyunca)
const cachedTranslation = await translateText('Hello', 'english', 'turkish');
```

## 🔒 Güvenlik

- API key sadece server-side kullanılır
- İstemci tarafından hiçbir zaman API key'e erişilemez
- Translation sonuçları cache'de geçici olarak saklanır

## ⚡ Performans

- **Cache Sistemi**: 24 saatlik cache ile hızlı yanıt
- **Fallback Mekanizması**: API hatası durumunda otomatik fallback
- **Error Handling**: Kapsamlı hata yönetimi
- **Loading States**: Kullanıcı dostu yükleme durumları

## 🐛 Sorun Giderme

### API Key Hatası
```
Translation API not configured, using fallback
```
**Çözüm**: `.env.local` dosyasında `GOOGLE_TRANSLATE_API_KEY` değişkenini kontrol edin.

### Rate Limit Hatası
```
Translation API error: 429
```
**Çözüm**: Google Translate API kullanım limitlerini kontrol edin ve gerekirse kota artırın.

### Cache Sorunları
Cache'de eski çeviriler kalıyor olabilir:
```typescript
// Cache'i manuel olarak temizleyin
translationService.clearCache();
```

## 📚 API Referansı

### `translateText(text, fromLang, toLang)`

- **Parametreler**:
  - `text` (string): Çevrilecek metin
  - `fromLang` (string): Kaynak dil kodu
  - `toLang` (string): Hedef dil kodu
- **Dönen Değer**: `Promise<string>` - Çevrilmiş metin

### `batchTranslate(texts, fromLang, toLang)`

- **Parametreler**:
  - `texts` (string[]): Çevrilecek metinler dizisi
  - `fromLang` (string): Kaynak dil kodu
  - `toLang` (string): Hedef dil kodu
- **Dönen Değer**: `Promise<string[]>` - Çevrilmiş metinler dizisi

### `clearCache()`

- Cache'i tamamen temizler

## 🔄 Alternatif API'ler

İhtiyaç halinde Azure Translator veya diğer translation servislerini de desteklemek için `GoogleTranslateService` class'ını extend edebilirsiniz.

## 📝 Notlar

- API key'i güvenli bir şekilde saklayın
- Production ortamında environment variables kullanın
- Cache sistemi performansı optimize eder
- Hata durumlarında kullanıcı deneyimini korumak için fallback sistemi aktif

---

Bu özellik PromptBase projesi için geliştirilmiştir ve production ortamında kullanıma hazırdır.