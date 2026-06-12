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
  }
];
