import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

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
    google: 'google-site-verification-code',
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
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9HG703EXQQ"
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
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5496537037248215"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        {/* Google Tag Manager (head) */}
        <Script
          id="gtm-head"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-WLXGL2KP');
            `,
          }}
        />
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WLXGL2KP"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
