"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { siteLanguages } from '@/lib/languages';

interface SiteLanguageContextType {
  siteLanguage: string;
  setSiteLanguage: (lang: string) => void;
  isLoading: boolean;
}

const SiteLanguageContext = createContext<SiteLanguageContextType | undefined>(undefined);

export function SiteLanguageProvider({ children }: { children: ReactNode }) {
  const [siteLanguage, setSiteLanguageState] = useState('english');
  const [isLoading, setIsLoading] = useState(true);

  // Load site language from localStorage on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('siteLanguage');
      if (savedLanguage && siteLanguages.find(lang => lang.code === savedLanguage)) {
        setSiteLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading site language from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage and update language
  const setSiteLanguage = (lang: string) => {
    try {
      localStorage.setItem('siteLanguage', lang);
      setSiteLanguageState(lang);
    } catch (error) {
      console.error('Error saving site language to localStorage:', error);
      setSiteLanguageState(lang);
    }
  };

  return (
    <SiteLanguageContext.Provider value={{ siteLanguage, setSiteLanguage, isLoading }}>
      {children}
    </SiteLanguageContext.Provider>
  );
}

export function useSiteLanguage() {
  const context = useContext(SiteLanguageContext);
  if (context === undefined) {
    throw new Error('useSiteLanguage must be used within a SiteLanguageProvider');
  }
  return context;
}