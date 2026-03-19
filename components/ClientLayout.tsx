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
      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Information</h3>
            <p className="text-gray-700 mb-6">{alertMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={handleAlertClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
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