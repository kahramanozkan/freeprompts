"use client";

import { useAuth } from "@/components/ui/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const adminPages = [
  {
    title: "Add Prompt",
    description: "Create new AI prompts",
    href: "/add-prompt",
    icon: "✏️"
  },
  {
    title: "Add List",
    description: "Create new prompt collections",
    href: "/add-list",
    icon: "📋"
  },
  {
    title: "Manage Prompts",
    description: "Edit and manage existing prompts",
    href: "/prompt-edit",
    icon: "📝"
  },
  {
    title: "Manage Lists",
    description: "Edit and manage existing lists",
    href: "/list-edit",
    icon: "📂"
  },
  {
    title: "Notifications",
    description: "Manage announcement banners",
    href: "/notifications",
    icon: "📢"
  }
];

export default function ManagePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
      return;
    }
    if (!loading && user && user.email !== 'kahramanozkan@gmail.com') {
      router.push('/404');
      return;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.email !== 'kahramanozkan@gmail.com') {
    // Yönlendirme zaten useEffect'te yapıldı, burada sadece spinner göster
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">Admin Dashboard</h1>
          <p className="text-xl text-gray-600">Manage your FreePrompts content and settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminPages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{page.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-black group-hover:text-gray-800">
                    {page.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {page.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}