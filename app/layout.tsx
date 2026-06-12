import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://freeprompts.store'),
  title: {
    default: "Ready to Use Free Prompts - freeprompts.store",
    template: "%s - Ready to Use Free Prompts - freeprompts.store"
  },
  description: "Discover, share, and use high-quality free AI prompts for ChatGPT, Claude, Gemini, and other AI tools. Join the largest community of prompt engineers.",
  keywords: [
    "AI prompts", "ChatGPT prompts", "AI tools", "prompt engineering",
    "artificial intelligence", "machine learning", "prompt marketplace",
    "AI content generation", "ChatGPT", "Claude", "Gemini AI"
  ],
  authors: [{ name: "FreePrompts Team" }],
  creator: "FreePrompts",
  publisher: "FreePrompts",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://freeprompts.store',
    title: "Ready to Use Free Prompts - freeprompts.store",
    description: "Discover, share, and use high-quality free AI prompts for ChatGPT, Claude, Gemini, and other AI tools.",
    siteName: 'FreePrompts',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ready to Use Free Prompts - freeprompts.store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Ready to Use Free Prompts - freeprompts.store",
    description: "Discover, share, and use high-quality free AI prompts for ChatGPT, Claude, Gemini, and other AI tools.",
    creator: '@freeprompts',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "6Dcb3UmtT0D1QbPhy3S3h11_tqn1mVZ8uAO7BIyx3yo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <NextTopLoader
          color="#000000"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #000000,0 0 5px #000000"
          zIndex={1600}
        />
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-9HG703EXQQ`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9HG703EXQQ');
          `}
        </Script>

        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_DISABLE_ADS !== "true" && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID || "ca-pub-5496537037248215"}`}
            strategy="lazyOnload"
            crossOrigin="anonymous"
          />
        )}
        {/* Google Tag Manager (head) */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <Script
            id="gtm-head"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
              `,
            }}
          />
        )}
        {/* Google Tag Manager (noscript) */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        {/* Microsoft Clarity */}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
              `,
            }}
          />
        )}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
