"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/ui/AuthProvider";
import { useSiteLanguage } from "@/contexts/SiteLanguageContext";
import { getTranslation } from "@/lib/translations";
import NotificationBanner from "@/components/ui/NotificationBanner";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { siteLanguage } = useSiteLanguage();

  const t = (key: string) => getTranslation(siteLanguage, key);

  // Helper function to get initials from name or email
  const getInitials = (nameOrEmail: string) => {
    if (!nameOrEmail) return 'U';

    // If it's an email, get first letter of username part
    if (nameOrEmail.includes('@')) {
      return nameOrEmail.charAt(0).toUpperCase();
    }

    // If it's a full name, get first letters of first and last name
    const parts = nameOrEmail.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    // Single name
    return nameOrEmail.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-semibold text-black">
              FreePrompts
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/prompts"
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              Discover Prompts
            </Link>
            <Link
              href="/lists"
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              Browse Lists
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  {/* Profile Avatar with Dropdown */}
                  <div className="relative group">
                    <button className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium hover:bg-gray-800 transition-colors">
                      {getInitials(user.user_metadata?.full_name || user.email || '')}
                    </button>
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                        >
                          {user.user_metadata?.full_name || user.email}
                        </Link>

                        {user.email === 'kahramanozkan@gmail.com' && (
                          <Link
                            href="/manage"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 font-medium"
                          >
                            Admin Dashboard
                          </Link>
                        )}

                        <button
                          onClick={signOut}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm bg-yellow-100 text-gray-800 hover:bg-yellow-200 transition-colors px-4 py-2 rounded-lg"
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 py-4">
            <nav className="flex flex-col space-y-3 px-4">
              <Link
                href="/prompts"
                className="text-sm text-gray-600 hover:text-black"
                onClick={() => setIsMenuOpen(false)}
              >
                Discover Prompts
              </Link>
              <Link
                href="/lists"
                className="text-sm text-gray-600 hover:text-black"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Lists
              </Link>
              {user ? (
                <>
                  <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-2 py-2 hover:bg-gray-50 rounded"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {getInitials(user.user_metadata?.full_name || user.email || '')}
                      </div>
                      <span className="text-sm text-gray-600">
                        {user.user_metadata?.full_name || user.email}
                      </span>
                    </Link>


                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="text-sm text-red-600 hover:text-red-700 text-left px-2 py-1 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
               <Link
                 href="/auth/signin"
                 className="text-sm bg-yellow-100 text-gray-800 hover:bg-yellow-200 transition-colors px-4 py-2 rounded-lg block text-center"
                 onClick={() => setIsMenuOpen(false)}
               >
                 Sign In
               </Link>
             )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}