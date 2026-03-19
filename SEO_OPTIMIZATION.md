# SEO Optimization Guide - PromptBase

Bu dokümantasyon PromptBase projesinde uygulanan SEO optimizasyonlarını ve kurulum adımlarını açıklamaktadır.

## 🚀 Uygulanan SEO Özellikleri

### 1. Dynamic Metadata & Meta Tags
- **Next.js 13+ App Router** ile server-side metadata generation
- **Dynamic title templates** (`%s | PromptBase` formatında)
- **Open Graph & Twitter Cards** tam desteği
- **Canonical URLs** ve duplicate content prevention
- **Multilingual support** için alternate language links

### 2. JSON-LD Structured Data
Uygulanan Schema.org markup'ları:
- `Organization` - Site bilgileri ve sosyal medya linkler
- `WebSite` - Site-wide bilgiler ve arama action
- `CreativeWork` - Prompt detay sayfaları için
- `BreadcrumbList` - Navigation yapısı
- `Article` - Prompt içerikleri için

### 3. Sitemap & Robots.txt
- **Dynamic sitemap** `/sitemap.xml` - Tüm sayfalar için otomatik generation
- **Robots.txt** - SEO bot'ları için yönlendirmeler
- **Multilingual sitemap** desteği

### 4. Image SEO Optimization
- **SEOImage component** - Core Web Vitals optimizasyonu
- **Lazy loading** ve priority loading
- **Responsive images** - Multiple sizes desteği
- **LQIP (Low Quality Image Placeholder)** - Loading performance
- **WebP/AVIF format** desteği

### 5. Breadcrumb Navigation
- **Structured data markup** - JSON-LD BreadcrumbList
- **Accessibility** - ARIA labels ve semantic HTML
- **User experience** - Kolay navigation

### 6. Performance Optimizations
- **Core Web Vitals** - LCP, CLS, FID optimizasyonu
- **Image lazy loading** - Sayfa yükleme hızı
- **Critical CSS** inlining
- **Font display optimization**

## 🔧 Kurulum ve Konfigürasyon

### Environment Variables
`.env.local` dosyanıza aşağıdaki değişkenleri ekleyin:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Google Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google Search Console Verification
GOOGLE_SITE_VERIFICATION=your-verification-code

# Translation API
GOOGLE_TRANSLATE_API_KEY=your-api-key
```

### Google Search Console Setup
1. Site sahipliğini doğrulayın
2. Sitemap'i Google Search Console'a gönderin: `https://your-domain.com/sitemap.xml`
3. URL Inspection tool ile sayfaları test edin

### Analytics Setup
Google Analytics 4 ve Google Tag Manager entegrasyonu için:
```typescript
// app/layout.tsx içine analytics code ekleyin
```

## 📊 SEO Metrics & Testing

### Core Web Vitals
- **LCP (Largest Contentful Paint)** < 2.5s
- **CLS (Cumulative Layout Shift)** < 0.1
- **FID (First Input Delay)** < 100ms

### SEO Testing Tools
- **Google PageSpeed Insights** - Performance analizi
- **Google Search Console** - Indexing ve crawling
- **Google Rich Results Test** - Structured data validation
- **Schema Markup Validator** - JSON-LD validation
- **Lighthouse** - Comprehensive audit

## 🌐 Multilingual SEO

### Hreflang Implementation
```typescript
alternates: {
  canonical: '/',
  languages: {
    'en': '/en',
    'tr': '/tr',
    'es': '/es',
    'fr': '/fr',
    'de': '/de',
    'ru': '/ru',
  },
}
```

### Sitemap Localization
Her dil için ayrı URL'ler sitemap'te otomatik olarak oluşturulur.

## 🎯 Content Strategy

### Meta Descriptions
- Her sayfa için unique, compelling descriptions
- 150-160 karakter optimum uzunluk
- Action-oriented language

### Title Optimization
- Primary keywords early
- Brand name consistency
- Length: 50-60 characters optimal

### Image Alt Text
- Descriptive, keyword-rich
- Context-aware
- Accessible için gerekli

## 🔗 Internal Linking Strategy

### Breadcrumb Implementation
```typescript
<PromptBreadcrumbs 
  promptTitle={prompt.title}
  promptId={prompt.id}
  slug={params.slug}
/>
```

### Related Content
- Prompt kategorileri arası cross-linking
- Tag-based navigation
- Related prompts suggestions

## 📱 Mobile SEO

### Responsive Design
- Mobile-first approach
- Touch-friendly navigation
- Fast mobile loading

### Mobile Page Speed
- Image optimization
- Code splitting
- Critical resource prioritization

## 🛡️ Technical SEO

### URL Structure
- SEO-friendly URLs: `/prompt/{id}/{slug}`
- Descriptive slugs
- Consistent naming convention

### Security Headers
- HSTS (HTTP Strict Transport Security)
- Content Security Policy
- X-Frame-Options

### Crawling Optimization
- robots.txt configuration
- XML sitemaps
- Structured data markup

## 📈 Monitoring & Maintenance

### Regular Audits
- Monthly SEO audits
- Performance monitoring
- Content freshness check

### Search Console Monitoring
- Index coverage
- Performance metrics
- Mobile usability
- Core Web Vitals

## 🚀 Best Practices

### Content Optimization
- Regular content updates
- Fresh prompt additions
- User engagement metrics tracking

### Technical Maintenance
- Regular dependency updates
- Performance monitoring
- Broken link checking

## 📚 Resources

### Google Documentation
- [Search Central](https://developers.google.com/search)
- [Core Web Vitals](https://web.dev/vitals/)
- [Structured Data](https://developers.google.com/search/docs/appearance/structured-data)

### Tools
- [Rich Results Test](https://search.google.com/test/rich-results)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Schema.org](https://schema.org/)

---

Bu SEO setup production ortamında kullanıma hazırdır ve düzenli bakım gerektirir.