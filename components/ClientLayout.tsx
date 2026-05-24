"use client";

import { ReactNode, useState, Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/components/ui/AuthProvider";
import { SiteLanguageProvider, useSiteLanguage } from "@/contexts/SiteLanguageContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import LoadingBar from "@/components/ui/LoadingBar";
import NotificationBanner from "@/components/ui/NotificationBanner";
import Modal from "@/components/ui/Modal";
// Language mapping for HTML lang attribute
const getLangCode = (language: string): string => {
  const langMap: { [key: string]: string } = {
    'english': 'en',
    'turkish': 'tr',
    'russian': 'ru',
    'portuguese': 'pt',
    'hindi': 'hi'
  };
  return langMap[language] || 'en';
};

function ClientLayoutContent({ children }: { children: ReactNode }) {
  const { siteLanguage } = useSiteLanguage();
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Override window.alert
  useEffect(() => {
    const originalAlert = window.alert;

    window.alert = (message?: string) => {
      setAlertMessage(message || '');
      setShowAlertModal(true);
      // Return undefined (alert doesn't return a value)
      return undefined;
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  const handleAlertClose = () => {
    setShowAlertModal(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NotificationBanner />
      <Suspense fallback={null}>
        <LoadingBar />
      </Suspense>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <Modal
        isOpen={showAlertModal}
        onClose={handleAlertClose}
        title="Information"
        message={alertMessage}
        type="info"
        confirmText="OK"
      />
    </div>
  );
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SiteLanguageProvider>
          <ClientLayoutContent>{children}</ClientLayoutContent>
        </SiteLanguageProvider>
      </AuthProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}