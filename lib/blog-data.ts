export interface BlogPostContent {
  title: string;
  excerpt: string;
  content: string; // HTML format for rendering via dangerouslySetInnerHTML
  tags: string[];
}

export interface BlogPost {
  slug: string;
  publishedAt: string;
  author: string;
  readTime: string;
  image: string;
  translations: {
    english: BlogPostContent;
    turkish: BlogPostContent;
  };
}

export const blogPosts: BlogPost[] = [
  {
    slug: "midjourney-v6-character-consistency-guide",
    publishedAt: "2026-06-12",
    author: "FreePrompts Editorial",
    readTime: "5 min read",
    image: "/blog/midjourney_guide_cover.png",
    translations: {
      english: {
        title: "Midjourney v6 Character Consistency: The Ultimate Prompting Guide",
        excerpt: "Learn how to maintain perfect character faces and styles across multiple generated scenes in Midjourney v6 using advanced parameters.",
        tags: ["Midjourney", "Image Generation", "Character Design"],
        content: `
          <p>Creating consistent characters has long been one of the biggest hurdles in AI image generation. In Midjourney v6, the introduction of the <strong>Character Reference (--cref)</strong> parameter has revolutionized this process. This comprehensive guide will show you how to generate the same character across different settings, poses, and emotions.</p>

          <h2>Understanding the --cref Parameter</h2>
          <p>The <code>--cref</code> parameter allows Midjourney to use a reference image as a template for your character's face and hair. To use it, simply copy the URL of a previously generated Midjourney image and paste it at the end of your prompt.</p>
          <pre><code>/imagine prompt: [your new scene description] --cref [image-url] --cw 100</code></pre>

          <h2>Controlling Consistency Weight (--cw)</h2>
          <p>The <strong>Character Weight (--cw)</strong> parameter controls how closely Midjourney follows the reference image. It accepts values from 0 to 100:</p>
          <ul>
            <li><strong>--cw 100 (Default):</strong> Copies the face, hair, and clothing. This is ideal when your character needs to wear the same outfit across scenes.</li>
            <li><strong>--cw 0:</strong> Focuses only on the face. This is perfect if you want your character to wear different clothes or change their hairstyle in new scenes.</li>
          </ul>

          <h2>Step-by-Step Character Creation Workflow</h2>
          <h3>Step 1: Generate the Base Character</h3>
          <p>Start by generating a clear, front-facing portrait of your character. Keep the background neutral (e.g., "studio background" or "white background") to make it easier for the AI to isolate the face. For example:</p>
          <pre><code>/imagine prompt: A cinematic portrait of a young woman with curly red hair, freckles, wearing a blue denim jacket, neutral expression, studio lighting --ar 3:2 --v 6.0</code></pre>

          <h3>Step 2: Copy the Image Link</h3>
          <p>Once you get the portrait you like, upscale it (U1, U2, etc.). Right-click on the upscaled image in Discord, click "Copy Link", or open it in a browser to copy the direct URL ending in <code>.png</code> or <code>.jpg</code>.</p>

          <h3>Step 3: Put the Character in Action</h3>
          <p>Now, write your new scene and append your reference link. Let's make her walk in the rain with a new outfit:</p>
          <pre><code>/imagine prompt: A young woman with curly red hair walking down a busy street in Tokyo under the rain, holding a red umbrella, neon lights reflection, cinematic shot --cref https://image.url/original.png --cw 0 --ar 16:9 --v 6.0</code></pre>

          <h2>Pro Tips for Perfect Character Sheets</h2>
          <p>For graphic novels or storyboards, combine <code>--cref</code> with <code>--sref</code> (Style Reference) to ensure both the character and the artistic style (color grading, brush strokes, shading) remain 100% consistent throughout your project.</p>
        `
      },
      turkish: {
        title: "Midjourney v6 Tutarlı Karakter Üretme Rehberi",
        excerpt: "Gelişmiş parametreleri kullanarak Midjourney v6'da farklı sahneler boyunca karakter yüzünü ve tarzını nasıl koruyacağınızı öğrenin.",
        tags: ["Midjourney", "Görsel Üretimi", "Karakter Tasarımı"],
        content: `
          <p>Tutarlı karakterler oluşturmak, yapay zeka görsel üretimindeki en büyük zorluklardan biri olmuştur. Midjourney v6 ile birlikte gelen <strong>Karakter Referansı (--cref)</strong> parametresi bu süreci tamamen değiştirdi. Bu rehberde, aynı karakteri farklı mekanlarda, pozlarda ve duygularda nasıl üretebileceğinizi göstereceğiz.</p>

          <h2>--cref Parametresini Anlamak</h2>
          <p><code>--cref</code> parametresi, Midjourney'nin karakterinizin yüzü ve saç modeli için referans bir resmi şablon olarak kullanmasını sağlar. Kullanmak için önceden ürettiğiniz bir görselin URL'sini kopyalayıp promptunuzun sonuna eklemeniz yeterlidir:</p>
          <pre><code>/imagine prompt: [yeni sahne açıklaması] --cref [görsel-url] --cw 100</code></pre>

          <h2>Karakter Ağırlığını Kontrol Etmek (--cw)</h2>
          <p><strong>Character Weight (--cw)</strong> parametresi, referans alınan görselin ne ölçüde taklit edileceğini belirler. 0 ile 100 arasında değer alır:</p>
          <ul>
            <li><strong>--cw 100 (Varsayılan):</strong> Yüzü, saçı ve kıyafetleri kopyalar. Karakterin sahneler arasında aynı kıyafeti giymesi gerekiyorsa idealdir.</li>
            <li><strong>--cw 0:</strong> Yalnızca yüze odaklanır. Karakterin farklı kıyafetler giymesini veya saç modelini değiştirmesini istediğinizde mükemmel sonuç verir.</li>
          </ul>

          <h2>Adım Adım Karakter Oluşturma İş Akışı</h2>
          <h3>Adım 1: Temel Karakteri Üretin</h3>
          <p>Karakterinizin net, doğrudan kameraya bakan bir portresini üreterek başlayın. Yapay zekanın yüzü kolayca ayırt edebilmesi için arka planı sade tutun (örn. "stüdyo arka planı" veya "beyaz arka plan"). Örnek prompt:</p>
          <pre><code>/imagine prompt: A cinematic portrait of a young woman with curly red hair, freckles, wearing a blue denim jacket, neutral expression, studio lighting --ar 3:2 --v 6.0</code></pre>

          <h3>Adım 2: Görsel Bağlantısını Kopyalayın</h3>
          <p>İstediğiniz portreyi elde ettiğinizde görseli büyütün (U1, U2 vb.). Discord'da görsele sağ tıklayıp "Bağlantıyı Kopyala" seçeneğini seçin. Bağlantının sonunun <code>.png</code> veya <code>.jpg</code> ile bittiğinden emin olun.</p>

          <h3>Adım 3: Karakteri Harekete Geçirin</h3>
          <p>Şimdi yeni sahnenizi yazın ve referans linkinizi ekleyin. Karakterimizi Tokyo sokaklarında yağmurda yürütelim:</p>
          <pre><code>/imagine prompt: A young woman with curly red hair walking down a busy street in Tokyo under the rain, holding a red umbrella, neon lights reflection, cinematic shot --cref https://image.url/original.png --cw 0 --ar 16:9 --v 6.0</code></pre>

          <h2>Mükemmel Karakter Sayfaları İçin İpuçları</h2>
          <p>Çizgi romanlar veya storyboard'lar için, hem karakterin hem de sanatsal stilin (renk tonu, fırça darbeleri, gölgelendirme) tüm proje boyunca %100 tutarlı kalmasını sağlamak için <code>--cref</code> parametresini <code>--sref</code> (Stil Referansı) ile birlikte kullanabilirsiniz.</p>
        `
      }
    }
  },
  {
    slug: "chatgpt-copywriting-prompt-templates",
    publishedAt: "2026-06-11",
    author: "FreePrompts Editorial",
    readTime: "4 min read",
    image: "/blog/chatgpt_copywriting_cover.png",
    translations: {
      english: {
        title: "10 ChatGPT Prompt Templates for High-Converting Copywriting",
        excerpt: "Boost your marketing results using proven copywriting formulas like AIDA and PAS tailored for ChatGPT.",
        tags: ["ChatGPT", "Copywriting", "Marketing"],
        content: `
          <p>Copywriting is about driving action. While ChatGPT is incredibly intelligent, raw prompts often generate generic, robotic marketing text. To get high-converting, persuasive copy, you need to feed ChatGPT structured frameworks. Here are some of the most effective copywriting prompt templates you can copy and use today.</p>

          <h2>1. The AIDA Framework (Attention, Interest, Desire, Action)</h2>
          <p>AIDA is the classic marketing formula designed to guide users from awareness to purchase. Use this prompt to structure landing page sections or sales emails:</p>
          <pre><code>Act as an elite copywriter. Write a product description for [Product Name] targeting [Target Audience] using the AIDA framework.
- Attention: Hook the reader with a shocking statistic or bold question.
- Interest: Detail the core benefit of our solution.
- Desire: Address common pain points and how we solve them.
- Action: Write a compelling call to action.</code></pre>

          <h2>2. The PAS Formula (Problem, Agitate, Solve)</h2>
          <p>The PAS formula is ideal for social media ads because it focuses heavily on user pain points before presenting the product as the savior:</p>
          <pre><code>Create a Facebook ad copy for [Product/Service] using the PAS formula.
1. Problem: Identify the frustrating problem [Audience] faces.
2. Agitate: Make the problem feel emotional and urgent.
3. Solve: Position [Product Name] as the ultimate, easy solution.</code></pre>

          <h2>3. Before-After-Bridge (BAB)</h2>
          <p>BAB is great for case studies, testimonials, and email marketing. It shows the reader a vision of a better future:</p>
          <pre><code>Write an email sequence hook using the Before-After-Bridge framework for [Service Name].
- Before: Describe [Audience]'s current struggle.
- After: Describe their life after using our service.
- Bridge: Show them how our service takes them from Before to After.</code></pre>

          <h2>How to Get the Best Results</h2>
          <p>For maximum effectiveness, always define the <strong>Tone of Voice</strong> (e.g., "witty", "authoritative", "empathetic") and set strict constraints (e.g., "avoid buzzwords like 'synergy', 'game-changer', or 'revolutionize'"). By restricting ChatGPT, you force it to write more natural, human-like copy.</p>
        `
      },
      turkish: {
        title: "Yüksek Dönüşümlü Metin Yazarlığı İçin 10 ChatGPT Prompt Şablonu",
        excerpt: "ChatGPT için özel olarak hazırlanmış AIDA ve PAS gibi kanıtlanmış reklam yazarlığı formülleriyle pazarlama sonuçlarınızı artırın.",
        tags: ["ChatGPT", "Metin Yazarlığı", "Pazarlama"],
        content: `
          <p>Metin yazarlığı, kullanıcıyı harekete geçirmekle ilgilidir. ChatGPT inanılmaz derecede zeki olsa da, basit yönergeler genellikle robotik ve sıradan pazarlama metinleri üretir. Yüksek dönüşüm sağlayan, ikna edici metinler elde etmek için ChatGPT'yi yapılandırılmış formüllerle beslemeniz gerekir. İşte bugün kopyalayıp kullanabileceğiniz en etkili şablonlar.</p>

          <h2>1. AIDA Formülü (Dikkat, İlgi, Arzu, Eylem)</h2>
          <p>AIDA, kullanıcıyı farkındalıktan satın almaya yönlendirmek için tasarlanmış klasik bir pazarlama formülüdür. Bu şablonu açılış sayfaları veya satış e-postaları için kullanabilirsiniz:</p>
          <pre><code>Seçkin bir reklam yazarı gibi davran. [Hedef Kitle]'yi hedefleyen [Ürün Adı] için AIDA formülünü kullanarak bir ürün açıklaması yaz.
- Dikkat (Attention): Çarpıcı bir istatistik veya cesur bir soruyla okuyucuyu yakala.
- İlgi (Interest): Çözümümüzün temel faydalarını detaylandır.
- Arzu (Desire): Ortak sorunları ve bunları nasıl çözdüğümüzü ele al.
- Eylem (Action): Etkileyici bir çağrı (CTA) yaz.</code></pre>

          <h2>2. PAS Formülü (Sorun, Ajite Et, Çoz)</h2>
          <p>PAS formülü, sosyal medya reklamları için idealdir çünkü ürününüzü kurtarıcı olarak sunmadan önce kullanıcının yaşadığı sıkıntılara odaklanır:</p>
          <pre><code>[Ürün/Hizmet] için PAS formülünü kullanarak bir Facebook reklam metni oluştur.
1. Sorun (Problem): [Kitle]'nin karşılaştığı can sıkıcı sorunu tanımla.
2. Ajite Et (Agitate): Sorunun duygusal boyutunu ve aciliyetini vurgula.
3. Çöz (Solve): [Ürün Adı]'nı nihai ve kolay çözüm olarak konumlandır.</code></pre>

          <h2>3. Before-After-Bridge (Öncesi-Sonrası-Köprü)</h2>
          <p>BAB formülü e-posta pazarlaması ve başarı hikayeleri için harikadır. Okuyucuya daha iyi bir geleceğin vizyonunu sunar:</p>
          <pre><code>[Hizmet Adı] için Öncesi-Sonrası-Köprü (BAB) formülünü kullanarak bir e-posta giriş metni yaz.
- Öncesi (Before): Kitle'nin mevcut mücadelesini açıkla.
- Sonrası (After): Hizmetimizi kullandıktan sonraki ideal yaşamlarını tanımla.
- Köprü (Bridge): Hizmetimizin onları Öncesi'nden Sonrası'na nasıl ulaştıracağını göster.</code></pre>

          <h2>En İyi Sonuçları Almak İçin İpuçları</h2>
          <p>Maksimum verim almak için her zaman **Ses Tonunu** (örn. "esprili", "otoriter", "samimi") belirtin ve katı kurallar koyun (örn. "devrimsel", "ezber bozan" gibi klişe kelimeleri kullanmaktan kaçın). ChatGPT'yi kısıtlayarak daha doğal ve insansı yazmasını sağlayabilirsiniz.</p>
        `
      }
    }
  },
  {
    slug: "visual-prompts-camera-angles-lighting",
    publishedAt: "2026-06-10",
    author: "FreePrompts Editorial",
    readTime: "4 min read",
    image: "/blog/visual_prompts_cover.png",
    translations: {
      english: {
        title: "Mastering Camera Angles, Lighting, and Art Styles in Visual Prompts",
        excerpt: "Unlock cinema-grade photography in Midjourney, Nano Banana, and GPT Image 2 by using professional camera and lighting terminology.",
        tags: ["Midjourney", "Image Prompting", "Lighting Styles"],
        content: `
          <p>When generating images with AI, writing "a beautiful photo" or "hyperrealistic" rarely yields the best results. Professional prompt engineers use the vocabulary of filmmakers and photographers. By specifying camera angles, lighting conditions, and specific art styles, you can guide visual tools like Midjourney, Nano Banana, or GPT Image 2 to create breathtaking, cinematic images.</p>

          <h2>1. Camera Angles and Shots</h2>
          <p>The perspective of the lens determines the mood of your image. Here are key terms to include in your prompts:</p>
          <ul>
            <li><strong>Low Angle Shot:</strong> Captures the subject from below. It makes characters look powerful, heroic, or imposing.</li>
            <li><strong>Extreme Close-Up (ECU):</strong> Focuses on a single detail, like eyes or textures. Great for macro photography.</li>
            <li><strong>Wide-Angle Drone Shot:</strong> Perfect for grand landscapes, cities, and vast architecture, giving a sense of scale.</li>
            <li><strong>Eye-Level Portrait:</strong> Creates a natural, conversational feel, suitable for professional avatars and human portraits.</li>
          </ul>

          <h2>2. Mastering AI Lighting</h2>
          <p>Lighting is the soul of photography. Use these specific lighting terms to dramatically change the mood of your generations:</p>
          <ul>
            <li><strong>Golden Hour Lighting:</strong> The soft, warm, orange light right before sunset. Gives a warm, nostalgic feel.</li>
            <li><strong>Cinematic Volumetric Lighting:</strong> Light beams passing through dust or fog (god rays). Adds depth and drama to interiors.</li>
            <li><strong>Cyberpunk Neon Glow:</strong> High-contrast lighting with purple, cyan, and magenta tones, reflecting on wet streets.</li>
            <li><strong>Rembrandt Lighting:</strong> A classic portrait lighting style where one side of the face is illuminated, creating a small triangle of light under the eye on the shaded side.</li>
          </ul>

          <h2>3. Art Styles and Rendering Engines</h2>
          <p>If you want a modern digital art style, naming the software or style is highly effective:</p>
          <pre><code>/imagine prompt: A futuristic astronaut standing on Mars, looking at a dust storm, volumetric lighting, digital art, Unreal Engine 5 render, 3D style --ar 16:9</code></pre>
          <p>By blending camera specifications with specific lighting terms, you transition from random AI generations to controlled, professional visual assets.</p>
        `
      },
      turkish: {
        title: "Görsel Promptlarında Kamera Açıları, Işık ve Sanat Stillerinde Uzmanlaşın",
        excerpt: "Profesyonel kamera ve ışık terimlerini kullanarak Midjourney, Nano Banana ve GPT Image 2'de sinematik kalitede görseller üretin.",
        tags: ["Midjourney", "Görsel Promptları", "Işık Stilleri"],
        content: `
          <p>Yapay zeka ile görsel üretirken sadece "harika bir fotoğraf" veya "gerçekçi" yazmak nadiren en iyi sonucu verir. Profesyonel görsel tasarımcılar, yönetmenlerin ve fotoğrafçıların dilini kullanır. Kamera açılarını, ışık koşullarını ve sanat stillerini belirterek Midjourney, Nano Banana veya GPT Image 2 gibi araçları yönlendirebilirsiniz.</p>

          <h2>1. Kamera Açıları ve Çekim Türleri</h2>
          <p>Kameranın açısı, görselinizin hissini belirler. Promptlarınıza ekleyebileceğiniz temel terimler şunlardır:</p>
          <ul>
            <li><strong>Low Angle (Alt Açı) Çekim:</strong> Konuyu aşağıdan yukarıya çeker. Karakterleri güçlü, kahramansı veya heybetli gösterir.</li>
            <li><strong>Extreme Close-Up (Aşırı Yakın Çekim):</strong> Gözler veya dokular gibi tek bir detaya odaklanır. Makro çekimler için harikadır.</li>
            <li><strong>Wide-Angle Drone Shot (Geniş Açı Drone Çekimi):</strong> Görkemli manzaralar, şehirler ve mimari yapılar için ölçek hissi verir.</li>
            <li><strong>Eye-Level Portrait (Göz Hizası Portre):</strong> Profesyonel avatarlar için uygun, doğal ve samimi bir his yaratır.</li>
          </ul>

          <h2>2. Yapay Zeka Işık Teknikleri</h2>
          <p>Işık, fotoğrafçılığın ruhudur. Görselinizin atmosferini tamamen değiştirmek için şu terimleri kullanın:</p>
          <ul>
            <li><strong>Golden Hour (Altın Saat):</strong> Gün batımından hemen önceki yumuşak, sıcak turuncu ışık. Nostaljik bir his verir.</li>
            <li><strong>Volumetric Lighting (Hacimsel Işık):</strong> Toz veya sis arasından süzülen ışık huzmeleri. İç mekanlara dramatik bir derinlik katar.</li>
            <li><strong>Neon Glow (Siberpunk Işıltısı):</strong> Islak sokaklara yansıyan mor, camgöbeği ve pembe tonlarında yüksek kontrastlı ışık.</li>
            <li><strong>Rembrandt Işıklandırması:</strong> Yüzün bir yarısının aydınlatıldığı, diğer yarısında ise gözün altında üçgen bir ışık bırakan klasik portre ışığı.</li>
          </ul>

          <h2>3. Sanat Stilleride ve İşleme Motorları</h2>
          <p>Modern bir dijital sanat stili elde etmek istiyorsanız, motor veya yazılım isimlerini belirtmek oldukça etkilidir:</p>
          <pre><code>/imagine prompt: A futuristic astronaut standing on Mars, looking at a dust storm, volumetric lighting, digital art, Unreal Engine 5 render, 3D style --ar 16:9</code></pre>
          <p>Kamera özelliklerini özel ışık terimleriyle harmanlayarak, rastgele görseller yerine kontrollü ve profesyonel tasarımlar elde edebilirsiniz.</p>
        `
      }
    }
  },
  {
    slug: "claude-artifacts-prompts-guide",
    publishedAt: "2026-06-09",
    author: "FreePrompts Editorial",
    readTime: "6 min read",
    image: "/blog/claude_artifacts_cover.png",
    translations: {
      english: {
        title: "Claude 3.5 Sonnet Artifacts prompts: How to Write Prompts to Build Interactive Apps",
        excerpt: "Discover the best Claude 3.5 Sonnet artifacts prompts to automatically generate full React pages, SVG components, and games in your browser.",
        tags: ["Claude AI", "Web Development", "Artifacts"],
        content: `
          <p>With the release of Claude 3.5 Sonnet, Anthropic introduced a game-changing feature: <strong>Artifacts</strong>. This feature allows Claude to render code, SVGs, websites, and games directly in a side panel next to the chat. However, writing generic prompts often results in half-finished scripts. To build fully functional interactive apps in seconds, you need optimized prompt structures.</p>

          <h2>Understanding Claude Artifacts</h2>
          <p>An Artifact is triggered whenever Claude generates standalone content (more than 15 lines of code) that you can preview, edit, or copy. This includes React components, HTML/CSS pages, games, or Vector graphics.</p>

          <h2>Optimized Prompt Blueprint for Claude Artifacts</h2>
          <p>To ensure Claude generates a fully working product, you should use the following structured blueprint:</p>
          <pre><code>Create a fully functional [App Name / Page Name] using React, Tailwind CSS, and Lucide React icons.
- Ensure all interactive states are fully simulated in local memory (use React useState).
- The design must be premium, dark mode base, modern glassmorphism aesthetic.
- Do not use placeholders or stub functions; write the complete code.
- Implement responsive design suitable for both desktop and mobile screens.</code></pre>

          <h2>3 Copy-Paste Prompts for Claude 3.5 Sonnet</h2>

          <h3>1. Interactive Financial Calculator & Dashboard</h3>
          <pre><code>Build an interactive loan amortization calculator React component. Include fields for loan amount, interest rate, term, and extra monthly payments. Render a beautiful responsive line chart showing debt reduction over time, and list the amortization table in a clean table format. Use Lucide icons for tabs.</code></pre>

          <h3>2. Browser-Based Pomodoro Timer & Task Manager</h3>
          <pre><code>Create a Pomodoro timer application. It should have a countdown circular visual indicator, play/pause controls, and options for short/long breaks. Combine it with a simple Kanban task board where users can add, drag, and complete tasks. Save settings in local state.</code></pre>

          <h3>3. Custom SVG Icon Generator</h3>
          <pre><code>Build a tool where I can customize geometric abstract SVG patterns. Add range slider inputs for grid size, colors, corner radius, and rotation. Preview the generated SVG in real-time, and provide an export button to copy the SVG code to clipboard.</code></pre>

          <h2>Why This Works</h2>
          <p>Claude 3.5 Sonnet excels at reasoning. By setting explicit constraints like "simulate all interactive states" and "no stub functions", you prevent the AI from lazy-loading components or writing comments like <code>// implement logic here</code>. This forces Claude to write 100% production-ready frontend code.</p>
        `
      },
      turkish: {
        title: "Claude 3.5 Sonnet Artifacts Promtları: İnteraktif Uygulamalar Geliştirme Rehberi",
        excerpt: "Tarayıcınızda otomatik olarak tam React sayfaları, SVG bileşenleri ve oyunlar oluşturmak için en iyi Claude 3.5 Sonnet Artifacts promtlarını keşfedin.",
        tags: ["Claude AI", "Web Geliştirme", "Artifacts"],
        content: `
          <p>Claude 3.5 Sonnet ile Anthropic, yapay zeka dünyasında devrim yaratan bir özellik tanıttı: <strong>Artifacts (Yapaylar)</strong>. Bu özellik, Claude'un yazdığı kodları, web sitelerini ve oyunları sohbet ekranının yanındaki bir panelde canlı olarak çalıştırmasını sağlar. Ancak basit yönergeler yazmak genellikle yarım kalmış kodlara yol açar. Birkaç saniye içinde çalışan uygulamalar geliştirmek için optimize edilmiş şablonları kullanmalısınız.</p>

          <h2>Claude Artifacts Nedir?</h2>
          <p>Claude, 15 satırdan fazla kod, SVG çizimi veya web sayfası ürettiğinde bu içerik otomatik olarak bağımsız bir Artifact olarak açılır. Burada kodun canlı önizlemesini görebilir, düzenleyebilir veya doğrudan kopyalayabilirsiniz.</p>

          <h2>Claude Artifacts İçin Optimize Edilmiş Şablon Taslağı</h2>
          <p>Claude'un eksiksiz ve çalışan bir ürün üretmesini garanti altına almak için şu yapısal şablonu kullanın:</p>
          <pre><code>React, Tailwind CSS ve Lucide React ikonlarını kullanarak tamamen çalışan bir [Uygulama Adı] oluştur.
- Tüm etkileşimli durumları (state) yerel hafızada simüle et (React useState kullan).
- Tasarım modern, karanlık mod tabanlı ve cam efekti (glassmorphism) içermelidir.
- Kodda yer tutucu veya boş fonksiyon bırakma; tüm mantığı eksiksiz yaz.
- Hem mobil hem masaüstü ekranlar için tam uyumlu (responsive) bir tasarım kullan.</code></pre>

          <h2>Kullanıma Hazır 3 Claude 3.5 Sonnet Hazır Şablonu</h2>

          <h3>1. İnteraktif Finansal Hesaplama Aracı ve Grafik</h3>
          <pre><code>Kullanıcıların kredi tutarı, faiz oranı, vade ve ek ödeme miktarını girebileceği bir konut kredisi hesaplama React bileşeni oluştur. Zaman içindeki borç azalışını gösteren şık bir çizgi grafik ekle ve tüm ödeme planını detaylı bir tablo halinde listele. Sekmeler için Lucide ikonları kullan.</code></pre>

          <h3>2. Pomodoro Zamanlayıcı & Kanban Görev Panosu</h3>
          <pre><code>Görsel bir geri sayım dairesi içeren Pomodoro zamanlayıcı uygulaması yap. Oynat, durdur ve mola sürelerini ayarlama butonları ekle. Zamanlayıcının hemen altına, kullanıcıların görev ekleyip tamamlandı yapabileceği basit bir Kanban panosu entegre et.</code></pre>

          <h3>3. Özelleştirilebilir SVG Geometrik Desen Üretici</h3>
          <pre><code>Soyut geometrik SVG desenleri tasarlayabileceğim interaktif bir araç oluştur. Izgara boyutu, renkler, köşe yuvarlaklığı ve döndürme gibi parametreler için slider girişleri ekle. Üretilen deseni canlı önizle ve SVG kodunu kopyalama butonu koy.</code></pre>

          <h2>Neden Bu Şablonları Kullanmalıyız?</h2>
          <p>Claude 3.5 Sonnet, kod yazmada en yüksek başarı oranına sahip modeldir. "Yer tutucu bırakma" ve "tüm mantığı eksiksiz yaz" gibi kısıtlamalar koyarak, yapay zekanın <code>// buraya kod gelecek</code> şeklinde yorum bırakmasını engeller, doğrudan çalışan bir kod bloğu elde edersiniz.</p>
        `
      }
    }
  },
  {
    slug: "midjourney-v6-grid-split-pan-techniques",
    publishedAt: "2026-06-08",
    author: "FreePrompts Editorial",
    readTime: "5 min read",
    image: "/blog/midjourney_split_cover.png",
    translations: {
      english: {
        title: "Midjourney v6 Grid Split & Pan Techniques for Perfect Compositions",
        excerpt: "Learn how to expand your canvases, split grids, and steer visual direction in Midjourney v6 using pan buttons and zoom controls.",
        tags: ["Midjourney", "Visual Art", "Composition"],
        content: `
          <p>Generating a beautiful image in Midjourney v6 is easy, but getting the composition exactly right is a science. Sometimes, your subject is cropped too tightly, or you want to expand the scene to the left or right without losing the core details. This is where <strong>Pan</strong>, <strong>Zoom</strong>, and <strong>Vary (Region)</strong> parameters come in. Let's master these advanced canvas controls.</p>

          <h2>1. Steering the Camera with Pan (Arrows)</h2>
          <p>Once you upscale an image in Midjourney, you will see four directional arrow buttons (Left, Right, Up, Down). Clicking these triggers the Pan function, expanding your canvas in that direction:</p>
          <ul>
            <li><strong>How it works:</strong> Midjourney keeps your original image intact and uses the prompt keywords to generate new matching environments in the selected direction.</li>
            <li><strong>Steering:</strong> When you click Pan, you can change the prompt text for the newly added area. For example, if you pan right, you can add "a vintage car parked on the street" to populate only the new space.</li>
          </ul>

          <h2>2. Outpainting with Custom Zoom</h2>
          <p>Zoom Out buttons (1.5x and 2.0x) allow you to pull the camera back. The <strong>Custom Zoom (--zoom)</strong> feature gives you precise control over the scaling factor and aspect ratio simultaneously:</p>
          <pre><code>/imagine prompt: [original prompt] --zoom 1.5 --ar 16:9</code></pre>
          <p>Use Zoom to place a tightly cropped character portrait into a cinematic landscape backdrop without warping their facial features.</p>

          <h2>3. Grid Splitting & Framing Prompts</h2>
          <p>Want to generate split panels, comic strips, or side-by-side comparisons? You can force Midjourney to split the canvas grid internally by using specific framing keywords:</p>
          <ul>
            <li><strong>Triptych / Diptych:</strong> Divides the image into three or two distinct vertical frames (ideal for concept art and landscapes).</li>
            <li><strong>2-panel comic strip:</strong> Generates a storyboard look showing two consecutive scenes.</li>
            <li><strong>Side-by-side comparison:</strong> Perfect for showing a character from the front and back (turnaround sheets).</li>
          </ul>
          <pre><code>/imagine prompt: A triptych concept art of a futuristic cyber city, neon lighting, split into 3 vertical panels, cinematic illustration --ar 16:9 --v 6.0</code></pre>

          <h2>Practical Composition Workflow</h2>
          <p>Generate a central character portrait first. Upscale the image, use <strong>Pan Left</strong> or <strong>Pan Right</strong> to build the setting, and then apply <strong>Custom Zoom</strong> to pull the camera back to create a complete landscape painting. This modular workflow gives you complete creative direction.</p>
        `
      },
      turkish: {
        title: "Midjourney v6 Pan ve Görsel Kaydırma Teknikleri ile Mükemmel Kompozisyonlar",
        excerpt: "Kamera kaydırma yön tuşlarını ve yakınlaştırma kontrollerini kullanarak Midjourney v6'da sahnelerinizi nasıl genişleteceğinizi öğrenin.",
        tags: ["Midjourney", "Görsel Tasarım", "Kompozisyon"],
        content: `
          <p>Midjourney v6'da kaliteli bir görsel üretmek kolaydır ancak kompozisyonu tam olarak yönetmek ayrı bir uzmanlık gerektirir. Bazen görseliniz çok dar bir çerçevede kalır veya orijinal detayları bozmadan sahneyi sola veya sağa doğru uzatmak istersiniz. Bu rehberde **Pan (Yön Kaydırma)**, **Zoom (Uzaklaştırma)** ve **Görsel Bölme** tekniklerini inceleyeceğiz.</p>

          <h2>1. Pan Yön Tuşları ile Kamerayı Kaydırmak</h2>
          <p>Midjourney'de bir görseli büyüttüğünüzde (Upscale), görselin altında yön okları (Sol, Sağ, Yukarı, Aşağı) belirir. Bu oklar Pan özelliğini tetikler:</p>
          <ul>
            <li><strong>Nasıl Çalışır:</strong> Midjourney mevcut görselinizi korur ve seçtiğiniz yön boyunca sahneye uyumlu yeni alanlar üretir.</li>
            <li><strong>Prompt Yönlendirme:</strong> Yön okuna bastığınızda promptu değiştirebilirsiniz. Örneğin sağa doğru kaydırırken promptun sonuna "a parked car" yazarak sadece yeni açılan alanda bir araba belirmesini sağlayabilirsiniz.</li>
          </ul>

          <h2>2. Özel Uzaklaştırma (Custom Zoom)</h2>
          <p>Görseli 1.5x veya 2.0x oranında geriye çekebileceğiniz gibi, **Custom Zoom** seçeneği ile hem uzaklaşma miktarını hem de en boy oranını aynı anda değiştirebilirsiniz:</p>
          <pre><code>/imagine prompt: [orijinal prompt] --zoom 1.7 --ar 16:9</code></pre>
          <p>Portre olarak ürettiğiniz bir karakteri, yüz hatlarını bozmadan geniş bir sinematik manzaranın içine yerleştirmek için Zoom en ideal yöntemdir.</p>

          <h2>3. Görsel Bölme (Split Grid) Yöntemi</h2>
          <p>Yapay zekanın tek seferde yan yana iki veya üç farklı panel üretmesini istiyorsanız, promptunuza kompozisyon terimleri eklemelisiniz:</p>
          <ul>
            <li><strong>Triptych / Diptych:</strong> Görseli dikey olarak 3 veya 2 panele böler. Konsept sanatı için harikadır.</li>
            <li><strong>Side-by-side comparison:</strong> Karakterin hem ön hem de arka görünümünü yan yana tasarlamak için kullanılır (Karakter paftası).</li>
          </ul>
          <pre><code>/imagine prompt: A triptych concept art of a futuristic cyber city, neon lighting, split into 3 vertical panels, cinematic illustration --ar 16:9 --v 6.0</code></pre>

          <h2>Örnek İş Akışı</h2>
          <p>Önce portre odaklı bir görsel üretin. Ardından **Pan Right** veya **Pan Left** tuşlarıyla sahnenin arka planını genişletin. Son olarak **Custom Zoom** uygulayarak kamerayı geriye çekip resmi tamamlayın. Bu adımlar görsel üzerindeki kontrolünüzü maksimuma çıkaracaktır.</p>
        `
      }
    }
  },
  {
    slug: "stable-diffusion-prompt-weights-negative-list",
    publishedAt: "2026-06-07",
    author: "FreePrompts Editorial",
    readTime: "5 min read",
    image: "/blog/stable_diffusion_weights_cover.png",
    translations: {
      english: {
        title: "Stable Diffusion Prompt Weights & Negative Prompt Guide",
        excerpt: "Master prompt weighting, bracket syntax, and the ultimate negative prompt list to generate flawless Stable Diffusion images.",
        tags: ["Stable Diffusion", "Prompt Weights", "Negative Prompts"],
        content: `
          <p>Unlike Midjourney, which interprets natural language, Stable Diffusion (especially SDXL and SD 1.5/2.1 models) relies heavily on mathematical syntax. If you don't assign prompt weights or specify a proper negative prompt list, your output will often contain visual glitches, distorted limbs, and low-quality textures. Here is how to master Stable Diffusion prompt math.</p>

          <h2>1. Understanding Prompt Weighting Syntax</h2>
          <p>Prompt weights tell Stable Diffusion which words are most important. The default weight of any word is 1.0. You can increase or decrease this using brackets:</p>
          <ul>
            <li><strong>Parentheses ( ):</strong> Increases the attention weight of the enclosed word by a factor of 1.1.
              <ul>
                <li><code>(castle)</code> = weight 1.1</li>
                <li><code>((castle))</code> = weight 1.21</li>
              </ul>
            </li>
            <li><strong>Brackets [ ]:</strong> Decreases the attention weight of the enclosed word by a factor of 0.9.
              <ul>
                <li><code>[castle]</code> = weight 0.9</li>
              </ul>
            </li>
            <li><strong>Numeric weights (Recommended):</strong> You can specify exact weights inside parentheses followed by a colon and the decimal value:
              <ul>
                <li><code>(castle:1.3)</code> = increases importance by 30%.</li>
                <li><code>(foggy weather:0.85)</code> = dampens fog effect by 15%.</li>
              </ul>
            </li>
          </ul>

          <h2>2. The Ultimate Negative Prompt List</h2>
          <p>Negative prompts are words you want Stable Diffusion to actively avoid. A strong negative prompt is critical to prevent anatomically incorrect fingers, blurry faces, and bad lighting. Copy-paste this standard negative list for photo-realistic renders:</p>
          <pre><code>(deformed, distorted, disfigured:1.3), poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation, extra fingers, mutated hands, bad proportions, lowres, bad quality, worst quality, artifact, signature, watermark, username</code></pre>

          <h2>3. Balancing Positive vs. Negative Weights</h2>
          <p>If you set your positive weights too high (e.g., above 1.5), the image will look "burned" or oversaturated (artifacts). Keep weights between 1.1 and 1.3 for best results. Always place the most critical subject at the very beginning of the prompt box, as Stable Diffusion assigns higher priority to the first 75 tokens.</p>
        `
      },
      turkish: {
        title: "Stable Diffusion Prompt Ağırlıkları ve Negatif Prompt Yazım Kılavuzu",
        excerpt: "Kusursuz Stable Diffusion görselleri üretmek için prompt ağırlıklandırmayı, parantez sözdizimini ve en güncel negatif prompt listesini öğrenin.",
        tags: ["Stable Diffusion", "Prompt Ağırlıkları", "Negatif Promptlar"],
        content: `
          <p>Doğal dili yorumlayan Midjourney'nin aksine, Stable Diffusion (özellikle SDXL, SD 1.5/2.1 modelleri) matematiksel bir sözdizimine güvenir. Eğer kelime ağırlıkları belirlemez veya doğru bir negatif prompt listesi kullanmazsanız, görsellerinizde bozuk uzuvlar, bulanıklık ve kalitesiz dokular oluşur. Bu rehberde Stable Diffusion'ın prompt matematiğini inceleyeceğiz.</p>

          <h2>1. Kelime Ağırlığı (Weighting) Sözdizimi</h2>
          <p>Stable Diffusion'da her kelimenin varsayılan gücü 1.0'dır. Bu gücü parantezler yardımıyla artırıp azaltabilirsiniz:</p>
          <ul>
            <li><strong>Parantez ( ):</strong> Parantez içine alınan kelimenin ağırlığını %10 (1.1 kat) artırır.
              <ul>
                <li><code>(castle)</code> = 1.1 ağırlık</li>
                <li><code>((castle))</code> = 1.21 ağırlık</li>
              </ul>
            </li>
            <li><strong>Köşeli Parantez [ ]:</strong> Kelimenin ağırlığını %10 (0.9 kat) azaltır.
              <ul>
                <li><code>[castle]</code> = 0.9 ağırlık</li>
              </ul>
            </li>
            <li><strong>Sayısal Ağırlık Belirtme (Önerilen):</strong> Parantez içinde iki nokta üst üste koyarak tam sayısal değer yazabilirsiniz:
              <ul>
                <li><code>(castle:1.3)</code> = Şatoyu %30 daha belirgin yapar.</li>
                <li><code>(foggy:0.8)</code> = Sisi %20 azaltır.</li>
              </ul>
            </li>
          </ul>

          <h2>2. Profesyonel Negatif Prompt Listesi</h2>
          <p>Negatif promptlar, yapay zekanın görselde kesinlikle **üretmemesini** istediğiniz unsurlardır. Bozuk parmaklar ve kalitesiz ışığı engellemek için şu listeyi kopyalayıp kullanabilirsiniz:</p>
          <pre><code>(deformed, distorted, disfigured:1.3), poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation, extra fingers, mutated hands, bad proportions, lowres, bad quality, worst quality, artifact, signature, watermark, username</code></pre>

          <h2>3. Ağırlıkları Dengede Tutmak</h2>
          <p>Pozitif ağırlıkları çok yüksek (örn. 1.5 üstü) tutarsanız görsel "yanmış" veya aşırı doygun görünür (artefakt). Kelime ağırlıklarını 1.1 ile 1.3 arasında tutmak en dengeli sonucu verir. Ayrıca en önemli konuyu her zaman promptun başına yazın, çünkü Stable Diffusion ilk 75 kelimeye en yüksek önceliği verir.</p>
        `
      }
    }
  },
  {
    slug: "ai-logo-design-prompts-vector-style",
    publishedAt: "2026-06-06",
    author: "FreePrompts Editorial",
    readTime: "4 min read",
    image: "/blog/ai_logo_design_cover.png",
    translations: {
      english: {
        title: "AI Logo Design Prompts: Copy-Paste Templates for Vector Style Branding",
        excerpt: "Learn how to write precise AI prompts for logos and corporate branding using clean, flat vector terms in Midjourney and DALL-E.",
        tags: ["Logo Design", "Branding", "Vector Art"],
        content: `
          <p>AI image generators are fantastic at creating complex art, but they struggle with simplicity. When you ask for a "logo", the AI often outputs busy 3D objects with text errors. To get clean, modern, flat vector-style logos suitable for branding, you need to use specific design vocabulary. Here is your AI logo design prompt guide.</p>

          <h2>1. Essential Keywords for Flat Logo Design</h2>
          <p>To prevent the AI from generating busy shading and realistic textures, always include these design terms in your prompts:</p>
          <ul>
            <li><code>Flat vector logo</code> / <code>Minimalist design</code></li>
            <li><code>2D geometry</code> / <code>Clean line art</code></li>
            <li><code>Corporate branding asset</code></li>
            <li><code>Solid background</code> / <code>Isolated on white background</code></li>
          </ul>

          <h2>2. Copy-Paste Logo Design Templates</h2>

          <h3>Geometric Tech Logo (Midjourney v6)</h3>
          <pre><code>A flat vector logo of a geometric abstract bird in flight, minimalist style, 2D design, sharp angles, primary colors, isolated on white background, corporate branding --no realistic shadows, 3d, gradient --ar 1:1 --v 6.0</code></pre>

          <h3>Line-Art Coffee Brand Mascot</h3>
          <pre><code>Minimalist clean line-art logo of a smiling coffee cup character, retro vintage style, solid brown lines, cream background, circular border emblem style, flat vector --ar 1:1</code></pre>

          <h3>Modern Real Estate Monogram</h3>
          <pre><code>A flat minimalist monogram logo featuring the letters 'H' and 'O' merged with a house outline, modern architecture icon, dark blue and gold color scheme, isolated on white background, vector logo file --v 6.0</code></pre>

          <h2>3. Pro Tips: Using --no Parameter (Negative Prompting)</h2>
          <p>In Midjourney, using the negative prompt parameter <code>--no</code> is critical for logos. Always append <code>--no realistic photo, shadows, 3d rendering, gradients, text, letters</code> to ensure your logo is flat and ready for vectorization in Illustrator.</p>
        `
      },
      turkish: {
        title: "Yapay Zeka ile Logo Tasarımı: Vektörel Hazır Şablonlar",
        excerpt: "Temiz ve düz vektör terimlerini kullanarak Midjourney ve DALL-E ile kurumsal marka logoları üretme rehberi.",
        tags: ["Logo Tasarımı", "Markalaşma", "Vektör Sanatı"],
        content: `
          <p>Yapay zeka görsel üreticileri karmaşık sanatsal görsellerde harikadır ancak sadelikte zorlanırlar. Sadece "logo" yazdığınızda, yapay zeka genellikle karmaşık, 3 boyutlu ve üzerinde hatalı yazılar olan tasarımlar sunar. Temiz, vektörel kullanıma uygun düz (flat) logolar üretmek için doğru tasarım kelimelerini kullanmalısınız.</p>

          <h2>1. Vektörel Logo Tasarımı İçin Temel Kelimeler</h2>
          <p>Yapay zekanın gölgelendirmeli ve gerçekçi dokular üretmesini engellemek için promptlarınıza şu terimleri ekleyin:</p>
          <ul>
            <li><code>Flat vector logo</code> (Düz vektör logo)</li>
            <li><code>Minimalist design</code> (Minimalist tasarım)</li>
            <li><code>Clean line art</code> (Temiz çizgi sanatı)</li>
            <li><code>Isolated on white background</code> (Beyaz arka planda izole edilmiş)</li>
          </ul>

          <h2>2. Kullanıma Hazır Hazır Logo Promptları</h2>

          <h3>Geometrik Teknoloji Logosu (Midjourney v6)</h3>
          <pre><code>A flat vector logo of a geometric abstract bird in flight, minimalist style, 2D design, sharp angles, primary colors, isolated on white background, corporate branding --no realistic shadows, 3d, gradient --ar 1:1 --v 6.0</code></pre>

          <h3>Kahve Markası Çizgisel Maskot Logosu</h3>
          <pre><code>Minimalist clean line-art logo of a smiling coffee cup character, retro vintage style, solid brown lines, cream background, circular border emblem style, flat vector --ar 1:1</code></pre>

          <h3>Modern Emlak Monogram Logosu</h3>
          <pre><code>A flat minimalist monogram logo featuring the letters 'H' and 'O' merged with a house outline, modern architecture icon, dark blue and gold color scheme, isolated on white background, vector logo file --v 6.0</code></pre>

          <h2>3. İpucu: Negatif Parametreleri Kullanmak (--no)</h2>
          <p>Midjourney'de logolar için negatif <code>--no</code> parametresini kullanmak hayatidir. Logonun düz olması ve Illustrator'da kolayca vektöre çevrilebilmesi için promptun sonuna mutlaka <code>--no realistic photo, shadows, 3d rendering, gradients, text, letters</code> ekleyin.</p>
        `
      }
    }
  },
  {
    slug: "chatgpt-pdf-analysis-summarization-prompts",
    publishedAt: "2026-06-05",
    author: "FreePrompts Editorial",
    readTime: "4 min read",
    image: "/blog/chatgpt_pdf_analysis_cover.png",
    translations: {
      english: {
        title: "ChatGPT Prompts for PDF Analysis: How to Summarize Long Documents",
        excerpt: "Learn how to write effective prompts to summarize financial reports, research papers, and PDFs without losing key details.",
        tags: ["ChatGPT", "Document Analysis", "Productivity"],
        content: `
          <p>Analyzing long PDFs (such as financial statements, medical studies, or legal contracts) is one of ChatGPT's most powerful capabilities. However, simply uploading a document and typing "summarize this" often leads to generic summaries that miss critical figures or context. To get high-utility, accurate summaries, you need to structure your analysis prompts.</p>

          <h2>1. The Role-Based Extraction Prompt</h2>
          <p>Define a role for ChatGPT to focus its analysis on the most important metrics. For example, if you are analyzing a business report:</p>
          <pre><code>Act as an expert financial analyst. Analyze this PDF and extract the following:
- Key financial metrics (Revenue, Operating Margin, Year-on-Year growth).
- 3 major risks identified by the company.
- Future outlook statements.
Format the output in a clean markdown table.</code></pre>

          <h2>2. The 'Explain Like I'm 5' (ELI5) Research Summarizer</h2>
          <p>Perfect for reading complex academic or medical papers. This prompt breaks down technical jargon into accessible language:</p>
          <pre><code>Analyze the attached research paper. Generate a summary containing:
1. Core thesis: What is the main discovery?
2. Methodology: How did they test it (briefly)?
3. Non-technical summary: Explain the main finding using simple terms (ELI5 style).
4. Key takeaways: 3 bullet points.</code></pre>

          <h2>3. The Executive Summary Prompt</h2>
          <p>When you have a 50+ page document and only need the absolute essentials, use a hierarchical summarization prompt:</p>
          <pre><code>Read this PDF and write a structured executive summary.
- Start with a single-sentence overview of the document's purpose.
- List the top 5 decisions or action points mentioned.
- Provide a summary of the conclusions in 3 sentences.</code></pre>

          <h2>Important: Prevent AI Hallucinations</h2>
          <p>To ensure ChatGPT does not invent details not present in the PDF, always append this critical constraint: <strong>"Only base your answers on the provided document. If the document does not contain information to answer a question, explicitly state 'not found in document' instead of guessing."</strong></p>
        `
      },
      turkish: {
        title: "ChatGPT ile PDF Analizi: Uzun Belgeleri Özetleme Teknikleri",
        excerpt: "Finansal raporları, akademik makaleleri ve PDF belgelerini detayları kaybetmeden özetlemek için etkili prompt şablonlarını kullanın.",
        tags: ["ChatGPT", "Belge Analizi", "Verimlilik"],
        content: `
          <p>Uzun PDF belgelerini (finansal tablolar, hukuki sözleşmeler, akademik makaleler) analiz etmek ChatGPT'nin en güçlü yönlerinden biridir. Ancak sadece "bunu özetle" yazmak, genellikle kritik bilgileri kaçıran yüzeysel özetlerle sonuçlanır. Doğru ve yüksek faydalı çıktılar almak için analitik promptlar yazmalısınız.</p>

          <h2>1. Rol Odaklı Metrik Çıkarma Promptu</h2>
          <p>ChatGPT'ye bir uzman rolü vererek analiz hedefini daraltın. Örneğin bir şirket faaliyet raporu için:</p>
          <pre><code>Uzman bir finansal analist gibi davran. Bu PDF'i analiz et ve şunları çıkar:
- Temel finansal göstergeler (Gelir, Faaliyet Marjı, Yıllık büyüme).
- Şirket tarafından belirtilen 3 ana risk.
- Geleceğe yönelik öngörüler.
Çıktıyı temiz bir markdown tablosu halinde formatla.</code></pre>

          <h2>2. Akademik Makaleler İçin Sadeleştirme (ELI5) Şablonu</h2>
          <p>Karmaşık teknik terimler barındıran bilimsel yazıları okumak için idealdir. Konuyu basit bir dille açıklar:</p>
          <pre><code>Ekli makaleyi analiz et. Şu başlıkları içeren bir özet oluştur:
1. Ana Tez: Temel keşif nedir?
2. Metot: Testi nasıl yaptılar (kısaca)?
3. Basit Anlatım: Ana bulguyu teknik olmayan terimlerle açıkla.
4. Önemli Çıkarımlar: 3 maddelik liste.</code></pre>

          <h2>3. Yönetici Özeti (Executive Summary) Şablonu</h2>
          <p>50 sayfadan uzun belgelerdeki en can alıcı noktaları yakalamak için hiyerarşik özet şablonunu kullanın:</p>
          <pre><code>Bu PDF belgesini oku ve yapılandırılmış bir yönetici özeti yaz.
- Belgenin amacını özetleyen tek bir cümle ile başla.
- Belgede adı geçen en önemli 5 karar veya aksiyon noktasını listele.
- Sonuç kısmını 3 cümlede özetle.</code></pre>

          <h2>Önemli: Yanılsamaları (Hallucination) Önlemek</h2>
          <p>Yapay zekanın PDF'te olmayan bilgileri uydurmasını engellemek için promptunuzun sonuna mutlaka şu kısıtlamayı ekleyin: <strong>"Yalnızca sağlanan belgedeki bilgilere dayanarak yanıt ver. Eğer belgede bir sorunun cevabı yoksa, tahmin yürütmek yerine açıkça 'belgede bulunamadı' ifadesini kullan."</strong></p>
        `
      }
    }
  },
  {
    slug: "gemini-nano-local-prompt-engineering",
    publishedAt: "2026-06-04",
    author: "FreePrompts Editorial",
    readTime: "4 min read",
    image: "/blog/gemini_nano_local_cover.png",
    translations: {
      english: {
        title: "Google Gemini Nano: Prompt Engineering Guide for Local On-Device Models",
        excerpt: "Learn how to write optimized low-token prompts for Google Gemini Nano to run AI tasks locally on Android and Chrome browser.",
        tags: ["Gemini Nano", "Local AI", "Prompt Engineering"],
        content: `
          <p>Google Gemini Nano is the most efficient AI model designed to run locally on mobile hardware (such as Android devices) and directly inside Chrome browsers. Because local models have smaller parameter counts (around 1.8B to 3B parameters) and limited processing memory compared to cloud models like Gemini Advanced, standard long-winded prompts will fail. You need to adapt your prompt engineering for local AI constraints.</p>

          <h2>1. Keep Prompts Short and Token-Efficient</h2>
          <p>Gemini Nano operates on your device's memory. To avoid performance lag, keep instructions extremely concise. Eliminate polite filler words and get straight to the point.</p>
          <ul>
            <li><strong>Bad (High tokens):</strong> "Hello! Could you please look at this sentence and write a very brief summary of what it means in one simple sentence, thank you!"</li>
            <li><strong>Good (Low tokens):</strong> "Summarize this text in 1 sentence:"</li>
          </ul>

          <h2>2. Use Few-Shot Prompting (Examples)</h2>
          <p>Small local models struggle with abstract reasoning. The single most effective way to guide Gemini Nano is by providing 1 or 2 examples of the input and desired output (Few-shot prompting):</p>
          <pre><code>Classify customer sentiment as Positive or Negative.
Input: "The delivery arrived early and the product is great!"
Output: Positive
Input: "The app keeps crashing on startup."
Output: Negative
Input: "It works okay but is a bit slow."
Output:</code></pre>

          <h2>3. Enforce Strict Output Formatting</h2>
          <p>Local models tend to ramble if not restricted. If you need a specific output format, specify it explicitly at the end of the prompt:</p>
          <pre><code>Correct the grammar of this text. Output ONLY the corrected text. Do not write intros or explanations.
Text: "She don't like going to store."</code></pre>

          <h2>Summary: The Golden Rules for Gemini Nano</h2>
          <p>Focus on simple, single-step tasks (grammar correction, translation, sentiment analysis, simple entity extraction). Do not ask local models to write 1000-word essays or debug complex algorithms. By matching your task complexity to the hardware's capabilities, you unlock lightning-fast, offline AI utilities.</p>
        `
      },
      turkish: {
        title: "Google Gemini Nano: Cihaz İçi Yerel Modeller İçin Prompt Mühendisliği",
        excerpt: "Android ve Chrome tarayıcısında çalışan Google Gemini Nano modelinden maksimum performans almak için düşük tokenli prompt yazma teknikleri.",
        tags: ["Gemini Nano", "Yerel Yapay Zeka", "Prompt Yazımı"],
        content: `
          <p>Google Gemini Nano, Android cihazlarda ve doğrudan Chrome tarayıcılarında çalışmak üzere tasarlanmış, cihaz içi (on-device) en verimli yapay zeka modelidir. Yerel modeller, bulutta çalışan büyük modellere (Gemini Advanced, GPT-4) kıyasla daha küçük parametre boyutuna (1.8B - 3B) sahip olduğundan, uzun ve karmaşık promptlar performans kaybına yol açar. Prompt mühendisliğinizi yerel model kısıtlamalarına göre uyarlamalısınız.</p>

          <h2>1. Promptları Kısa ve Token Dostu Tutun</h2>
          <p>Gemini Nano, cihazınızın RAM belleği üzerinde çalışır. Bellek dar boğazını önlemek için talimatları olabildiğince kısa tutun. Kibarlık veya dolaylı anlatımlardan kaçının, doğrudan emre odaklanın.</p>
          <ul>
            <li><strong>Kötü (Yüksek token kullanımı):</strong> "Merhaba! Lütfen bu paragrafı inceleyip benim için en önemli noktaları tek bir cümleyle özetleyebilir misiniz, çok teşekkürler."</li>
            <li><strong>İyi (Düşük token kullanımı):</strong> "Metni tek bir cümlede özetle:"</li>
          </ul>

          <h2>2. Örneklendirme (Few-Shot Prompting) Kullanın</h2>
          <p>Küçük modeller soyut akıl yürütmede zorlanırlar. Gemini Nano'yu yönlendirmenin en etkili yolu, ona ne istediğinize dair 1 veya 2 örnek sunmaktır:</p>
          <pre><code>Müşteri yorumunu Olumlu veya Olumsuz olarak sınıflandır.
Girdi: "Ürün zamanında ulaştı ve gayet kaliteli."
Çıktı: Olumlu
Girdi: "Uygulama açılır açılmaz çöküyor."
Çıktı: Olumsuz
Girdi: "Ürün idare eder ama kargo yavaştı."
Çıktı:</code></pre>

          <h2>3. Katı Çıktı Formatları Tanımlayın</h2>
          <p>Yerel modeller kısıtlanmadıklarında gereksiz açıklamalar yazma eğilimindedir. Sadece hedef çıktıyı almak için promptun sonuna sınırlayıcı ekleyin:</p>
          <pre><code>Bu cümlenin dilbilgisini düzelt. SADECE düzeltilmiş cümleyi yaz. Giriş veya açıklama ekleme.
Cümle: "Gidicez dediler ama gitmediler."</code></pre>

          <h2>Gemini Nano İçin Altın Kurallar</h2>
          <p>Yerel modelleri dilbilgisi düzeltme, çeviri, duygu analizi ve kısa özet çıkarma gibi tek adımlı, hafif görevler için kullanın. Nano'dan 1000 kelimelik makale yazmasını istemek verimsiz olacaktır. Görev karmaşıklığını yerel donanım sınırlarına göre ayarlayarak çevrim dışı ve ışık hızında yapay zeka deneyimi elde edebilirsiniz.</p>
        `
      }
    }
  },
  {
    slug: "gpt-4o-multimodal-prompting-guide",
    publishedAt: "2026-06-19",
    author: "FreePrompts Editorial",
    readTime: "5 min read",
    image: "/blog/gpt_multimodal_cover.png",
    translations: {
      english: {
        title: "GPT-4o and Beyond: How to Write Prompts for the Latest Multimodal AI Models",
        excerpt: "Discover how to write optimized prompts that combine text, images, and voice for Next-Gen multimodal models like GPT-4o.",
        tags: ["GPT-4o", "Multimodal", "Prompt Engineering"],
        content: `
          <p>With the launch of multimodal AI models like GPT-4o, prompt engineering has evolved from writing simple text commands to designing inputs that combine images, audio, and text. Because multimodal models process different types of media in a single shared neural network, they can understand relationships between visual elements and spoken words far better than previous systems. Here is how to write high-performance multimodal prompts.</p>

          <h2>1. Vision Prompting: Guide the Focus</h2>
          <p>When uploading an image to GPT-4o for analysis, do not just ask "what is this?" Instead, give the AI a clear role and establish spatial cues:</p>
          <ul>
            <li><strong>Define the Zone:</strong> "Analyze the dashboard in the top-right corner of the image..."</li>
            <li><strong>Specify the Task:</strong> "Identify any anomalies in the user retention graph, focusing on the sharp drop in May."</li>
            <li><strong>Provide Context:</strong> "This is a wireframe for a mobile banking app. List 3 usability issues regarding button placement."</li>
          </ul>

          <h2>2. Voice and Audio Prompting: Tone and Structure</h2>
          <p>GPT-4o natively accepts audio inputs. When dictating prompts, remember that the AI captures vocal inflections, pauses, and accentuation. To structure complex audio prompts:</p>
          <pre><code>State your main goal first -> Explain the context verbally -> Ask the AI to repeat the core requirements back to you to check understanding.</code></pre>
          <p>Example: "Act as my public speaking coach. I will read a short pitch. Listen to my tone, pace, and energy, and give me constructive feedback on my confidence level."</p>

          <h2>3. Cross-Modal Reference (Combining Visuals and Text)</h2>
          <p>One of GPT-4o's greatest strengths is cross-referencing text files with images. You can upload a PDF design document and a screenshot of your website, then prompt:</p>
          <pre><code>Compare the layout of the homepage in screenshot.png with the layout guidelines defined on page 4 of design_guide.pdf. List any deviations in font size and padding.</code></pre>

          <h2>Pro Tip: Keep Media Token-Efficient</h2>
          <p>Images consume a significant number of tokens (typically 85 to 258 tokens depending on resolution). Crop out unnecessary background elements and compress your images before uploading. This saves tokens, reduces latency, and keeps the AI focused on the critical details of your task.</p>
        `
      },
      turkish: {
        title: "GPT-4o ve Ötesi: Yeni Multimodal Yapay Zeka Modelleri İçin Prompt Yazım Kılavuzu",
        excerpt: "GPT-4o gibi yeni nesil multimodal modeller için metin, görsel ve ses girdilerini birleştiren optimize edilmiş prompt yazma teknikleri.",
        tags: ["GPT-4o", "Multimodal", "Prompt Yazımı"],
        content: `
          <p>GPT-4o gibi multimodal yapay zeka modellerinin hayatımıza girmesiyle birlikte, prompt mühendisliği sadece metin yazmaktan çıkıp ses, görsel ve metin girdilerini bir arada kullanmaya evrildi. Multimodal modeller farklı veri türlerini ortak bir sinir ağında işlediği için, görsel öğeler ile kelimeler arasındaki ilişkileri eski sistemlere göre çok daha iyi anlarlar. İşte yüksek performanslı multimodal prompt yazma teknikleri.</p>

          <h2>1. Görsel (Vision) Promptları Yazma: Odağı Yönlendirin</h2>
          <p>GPT-4o'ya analiz için bir görsel yüklediğinizde sadece "Bu nedir?" diye sormayın. Bunun yerine yapay zekaya bir rol verin ve görseldeki belirli alanları işaret edin:</p>
          <ul>
            <li><strong>Bölgeyi Tanımlayın:</strong> "Görselin sağ üst köşesindeki grafik panelini incele..."</li>
            <li><strong>Görevi Netleştirin:</strong> "Kullanıcı tutundurma (retention) grafiğindeki anomalileri tespit et, özellikle Mayıs ayındaki sert düşüşe odaklan."</li>
            <li><strong>Bağlam Sunun:</strong> "Bu bir mobil bankacılık uygulamasının arayüz taslağıdır. Buton yerleşimleri açısından 3 adet kullanılabilirlik sorunu listele."</li>
          </ul>

          <h2>2. Sesli (Voice) Promptlar: Tonlama ve Yapılandırma</h2>
          <p>GPT-4o ses girdilerini doğal olarak kabul eder. Promptları dikte ederken, yapay zekanın ses tonunuzu, duraksamalarınızı ve vurgularınızı yakaladığını unutmayın. Sesli promptları şu sırada yapılandırın:</p>
          <pre><code>Önce ana hedefi belirtin -> Bağlamı sesli olarak açıklayın -> Doğru anladığından emin olmak için yapay zekadan temel gereksinimleri özetlemesini isteyin.</code></pre>

          <h2>3. Çapraz Model Referansı (Görsel ve Metni Birleştirme)</h2>
          <p>GPT-4o'nun en güçlü yanlarından biri, bir metin belgesi ile bir görseli çapraz referanslayabilmesidir. Örneğin, bir tasarım rehberi PDF'i ile web sitenizin ekran görüntüsünü yükleyip şu promptu yazabilirsiniz:</p>
          <pre><code>Ekran görüntüsündeki anasayfa yerleşimi ile tasarim_rehberi.pdf belgesinin 4. sayfasındaki kuralları karşılaştır. Yazı tipi boyutu ve boşluk (padding) sapmalarını listele.</code></pre>

          <h2>İpucu: Görselleri Optimize Edin</h2>
          <p>Görseller çözünürlüklerine göre ciddi miktarda token harcar (genellikle 85 ila 258 token arası). Analiz hızını artırmak ve gereksiz token tüketimini önlemek için görselleri yüklemeden önce kırpın ve sıkıştırın. Bu, yapay zekanın sadece hedefe odaklanmasını sağlayacaktır.</p>
        `
      }
    }
  },
  {
    slug: "midjourney-dalle3-text-typography-prompts",
    publishedAt: "2026-06-18",
    author: "FreePrompts Editorial",
    readTime: "4 min read",
    image: "/blog/typography_text_cover.png",
    translations: {
      english: {
        title: "How to Render Clean Text and Typography in Midjourney v6 and DALL-E 3",
        excerpt: "Master the prompt syntax required to generate correct, unglitched text inside AI images for banners, posters, and social media.",
        tags: ["Midjourney", "DALL-E 3", "Typography"],
        content: `
          <p>Historically, generating readable text inside AI-generated images was almost impossible. AI models would yield strange, alien-like glyphs. However, Midjourney v6 and DALL-E 3 have introduced robust text-rendering capabilities. By learning the specific syntax and framing methods, you can design professional posters, logo mockups, and social media banners with crisp, readable text.</p>

          <h2>1. Midjourney v6 Text Rendering Syntax</h2>
          <p>In Midjourney v6, to print text, you must enclose the target words in **double quotation marks** <code>"like this"</code>. You must also specify where the text should go:</p>
          <pre><code>/imagine prompt: A neon sign on a brick wall at night glowing with the text "OPEN 24 HOURS" in cyan light, cyberpunk aesthetic --v 6.0</code></pre>
          <p>To get clean fonts, combine the text with terms like <code>bold sans-serif font</code>, <code>retro script typography</code>, or <code>minimalist logo text</code>.</p>

          <h2>2. DALL-E 3 Text Rendering</h2>
          <p>DALL-E 3 (available in ChatGPT Plus) is exceptionally good at text integration because of its advanced language comprehension. Simply describe the text as part of the scene description:</p>
          <pre><code>A photo of a classic wooden street sign that reads "DESTINATION SUCCESS". The background is a sunny path leading into a forest.</code></pre>

          <h2>3. Troubleshooting AI Typography Errors</h2>
          <p>Even with new models, AI still occasionally misspells words or adds extra letters. Here is how to fix it:</p>
          <ul>
            <li><strong>Use Negative Prompts:</strong> In Midjourney, append <code>--no gibberish, spelling errors, multiple letters, distorted text</code> to the end of your prompt.</li>
            <li><strong>Vary Region (Inpainting):</strong> If the image is perfect but one letter is wrong, select the text area using the Vary (Region) tool and re-prompt with the exact text in quotes.</li>
            <li><strong>Isolate Text:</strong> Ask the AI to place the text on a plain, solid background. This makes it extremely easy to clean up or replace using Canva or Photoshop.</li>
          </ul>

          <h2>Summary: Keep It Short</h2>
          <p>The shorter the text, the higher the success rate. Attempting to write a full paragraph in Midjourney will fail. Stick to 1 to 4 words for optimal, glitch-free typography rendering.</p>
        `
      },
      turkish: {
        title: "Midjourney v6 ve DALL-E 3 ile Görsellerde Kusursuz Yazı Yazdırma Teknikleri",
        excerpt: "Banner, poster ve sosyal medya tasarımlarınız için yapay zeka görsellerinin içine hatasız ve net yazılar yazdırma teknikleri.",
        tags: ["Midjourney", "DALL-E 3", "Tipografi"],
        content: `
          <p>Yapay zeka ile görsel üretiminin ilk dönemlerinde, görsellere okunabilir metinler eklemek neredeyse imkansızdı. Modeller anlamsız, uzay dili benzeri semboller üretirdi. Ancak Midjourney v6 ve DALL-E 3 bu durumu kökten değiştirdi. Doğru sözdizimini (syntax) kullanarak afişler, logolar ve sosyal medya bannerları için net ve okunabilir metinler tasarlayabilirsiniz.</p>

          <h2>1. Midjourney v6 Yazı Yazdırma Sözdizimi</h2>
          <p>Midjourney v6'da görselin içine yazı yazdırmak için yazılacak kelimeleri mutlaka **çift tırnak içinde** <code>"bu şekilde"</code> belirtmelisiniz. Ayrıca yazının nerede yer alacağını da tarif etmelisiniz:</p>
          <pre><code>/imagine prompt: A neon sign on a brick wall at night glowing with the text "OPEN 24 HOURS" in cyan light, cyberpunk aesthetic --v 6.0</code></pre>
          <p>Temiz yazı tipleri elde etmek için promptunuza <code>bold sans-serif font</code>, <code>retro script typography</code> veya <code>clean flat font</code> gibi terimler ekleyin.</p>

          <h2>2. DALL-E 3 ile Yazı Yazdırma</h2>
          <p>DALL-E 3 (ChatGPT Plus içinde yer alan), gelişmiş dil modeli sayesinde metin yerleştirmede son derece başarılıdır. Sahneyi betimlerken yazıyı doğal bir şekilde tanımlamanız yeterlidir:</p>
          <pre><code>A photo of a classic wooden street sign that reads "DESTINATION SUCCESS". The background is a sunny path leading into a forest.</code></pre>

          <h2>3. Yapay Zekadaki Tipografi Hatalarını Giderme</h2>
          <p>Modeller gelişmiş olsa da bazen harfleri karıştırabilir veya fazla harf ekleyebilir. Bu hataları düzeltmek için şu yolları izleyebilirsiniz:</p>
          <ul>
            <li><strong>Negatif Prompt Kullanın:</strong> Midjourney'de promptun sonuna <code>--no gibberish, spelling errors, distorted text</code> ekleyin.</li>
            <li><strong>Bölgesel Varyasyon (Vary Region):</strong> Görsel mükemmel ama sadece bir harf hatalıysa, o harfin olduğu alanı seçip çift tırnak içinde kelimenin doğrusunu yazarak tekrar üretin.</li>
            <li><strong>Kısa Metinler Seçin:</strong> Yazı ne kadar kısa olursa başarı oranı o kadar yüksek olur. Görsele 1-3 kelimelik kısa metinler yazdırmaya odaklanın.</li>
          </ul>
        `
      }
    }
  },
  {
    slug: "advanced-prompt-chaining-workflows-guide",
    publishedAt: "2026-06-17",
    author: "FreePrompts Editorial",
    readTime: "5 min read",
    image: "/blog/prompt_chain_cover.png",
    translations: {
      english: {
        title: "Advanced Prompt Chaining: How to Break Complex Tasks into Multi-Step AI Workflows",
        excerpt: "Learn how to design prompt chains where the output of one model becomes the input of another, creating robust automated systems.",
        tags: ["Prompt Chaining", "AI Workflows", "Automation"],
        content: `
          <p>When users are disappointed with AI outputs, it is usually because they asked the AI to do too much at once. Asking a model to "research a topic, write a 1000-word article, format it in HTML, and generate meta tags" in a single prompt yields mediocre, generic results. To achieve elite performance, you must use <strong>Prompt Chaining</strong>—breaking a complex task into smaller sub-tasks where the output of one prompt serves as the input for the next.</p>

          <h2>What is Prompt Chaining?</h2>
          <p>Prompt Chaining is a modular workflow design. Instead of generating a product in one go, you guide the AI step-by-step. This mirrors how human professionals work: planning, drafting, reviewing, and formatting are distinct phases.</p>

          <h2>The 4-Step Article Writing Chain</h2>

          <h3>Step 1: Outline Generation</h3>
          <p>First, prompt the AI to build the structural skeleton of your project:</p>
          <pre><code>Prompt 1: Create a detailed heading outline for an article about [Topic]. Include 5 main sections and sub-bullets for each.</code></pre>

          <h3>Step 2: Section-by-Section Drafting</h3>
          <p>Pass the generated outline back to the model and ask it to write only one specific section at a time. This prevents the AI from rushing or running out of memory:</p>
          <pre><code>Prompt 2: Write a detailed 300-word content body for Section 1 of this outline: [Insert Outline Section 1]. Use an informative tone.</code></pre>

          <h3>Step 3: Editing and SEO Optimization</h3>
          <p>Combine the generated drafts and prompt a clean editing pass:</p>
          <pre><code>Prompt 3: Act as a senior editor. Review this article for flow and readability. Additionally, naturally integrate the following keywords: [Insert Keywords].</code></pre>

          <h3>Step 4: Meta Tag Generation</h3>
          <p>Finally, generate metadata for SEO based on the finalized article content:</p>
          <pre><code>Prompt 4: Based on the finished article below, generate an optimized SEO meta description under 150 characters and select 5 relevant tags. [Insert Article]</code></pre>

          <h2>Why Prompt Chaining is Superior</h2>
          <p>By focusing the LLM's attention on a single narrow task, you dramatically improve quality. Chaining also allows you to insert human review steps between links in the chain, ensuring absolute control over the final product before it is finalized or published.</p>
        `
      },
      turkish: {
        title: "İleri Düzey Prompt Zincirleme: Karmaşık Görevleri Çok Adımlı Yapay Zeka İş Akışlarına Bölme",
        excerpt: "Bir yapay zeka modelinin çıktısını diğerinin girdisi yaparak karmaşık işleri otomatize etmenizi sağlayan prompt zincirleme teknikleri.",
        tags: ["Prompt Zincirleme", "Yapay Zeka İş Akışları", "Otomasyon"],
        content: `
          <p>Yapay zeka çıktılarının kalitesiz olmasının en büyük sebebi, tek seferde çok fazla şey istenmesidir. Bir modele "konuyu araştır, 1000 kelimelik makale yaz, bunu HTML olarak biçimlendir ve SEO etiketlerini oluştur" demek sıradan ve yüzeysel bir metne yol açar. Profesyonel sonuçlar elde etmek için **Prompt Zincirleme (Prompt Chaining)** yöntemini kullanmalısınız. Yani, karmaşık bir görevi, birinin çıktısı diğerinin girdisi olacak şekilde küçük adımlara bölmelisiniz.</p>

          <h2>Prompt Zincirleme Nedir?</h2>
          <p>Prompt zincirleme, modüler bir iş akışıdır. Ürünü tek seferde üretmek yerine yapay zekayı adım adım yönlendirirsiniz. Bu süreç, insanların çalışma şeklini taklit eder: araştırma, taslak oluşturma, düzenleme ve biçimlendirme ayrı aşamalardır.</p>

          <h2>Örnek: 4 Adımlı Makale Yazım Zinciri</h2>

          <h3>Adım 1: Taslak (Outline) Oluşturma</h3>
          <p>İlk adımda yapay zekaya projenin iskeletini oluşturun:</p>
          <pre><code>Prompt 1: [Konu] hakkında yazılacak bir makale için detaylı bir başlık taslağı oluştur. 5 ana bölüm ve alt maddelerini içersin.</code></pre>

          <h3>Adım 2: Bölüm Bölüm İçerik Yazımı</h3>
          <p>Taslağı yapay zekaya geri verip, her seferinde sadece tek bir bölümü yazmasını isteyin. Bu sayede model acele etmeden, uzun ve detaylı paragraflar oluşturur:</p>
          <pre><code>Prompt 2: Bu taslağın 1. Bölümü için 300 kelimelik detaylı bir metin yaz: [Taslağın 1. Bölümü]. Bilgilendirici bir ton kullan.</code></pre>

          <h3>Adım 3: Düzenleme ve SEO Optimizasyonu</h3>
          <p>Bölümleri birleştirin ve yapay zekaya bir editör gözüyle inceletin:</p>
          <pre><code>Prompt 3: Editör gibi davran. Bu makaleyi akıcılık ve okunabilirlik açısından gözden geçir. Ayrıca şu anahtar kelimeleri metne doğal olarak entegre et: [Anahtar Kelimeler].</code></pre>

          <h3>Adım 4: Meta Veri Üretimi</h3>
          <p>Son olarak, tamamlanmış metne dayanarak SEO etiketlerini hazırlatın:</p>
          <pre><code>Prompt 4: Aşağıdaki tamamlanmış makaleye dayanarak, 150 karakteri geçmeyen bir SEO meta açıklaması ve 5 etiket üret: [Makale Metni]</code></pre>

          <h2>Neden Prompt Zincirleme?</h2>
          <p>Yapay zekanın odak noktasını daraltarak, her adımda en yüksek performansı alırsınız. Ayrıca adımlar arasına kendi incelemenizi de katarak nihai ürün üzerindeki kontrolünüzü artırabilirsiniz.</p>
        `
      }
    }
  }
];

