"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notificationsApi } from "@/lib/supabase-queries";

type Notification = {
  id: string;
  title: string;
  message: string;
  link_text?: string | null;
  link_url?: string | null;
  icon?: string | null;
  is_active: boolean;
  activate_start: string | null;
  activate_end: string | null;
  background_color: string | null;
  created_at: string;
  updated_at: string;
};

export default function NotificationBanner() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const loadNotification = async () => {
      try {
        // Add timeout to prevent hanging request
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 5000) // 5 seconds timeout
        );
        const dataPromise = notificationsApi.getActive();
        const data = await Promise.race([dataPromise, timeoutPromise]);
        
        if (data) {
          // Check if this notification has been dismissed
          const dismissedIds = JSON.parse(localStorage.getItem('dismissed_notification_ids') || '[]');
          if (dismissedIds.includes(data.id)) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }
        } else {
          // No active notification or timeout, ensure visibility is false
          setIsVisible(false);
        }
        setNotification(data as Notification);
      } catch (error) {
        console.error('Error loading notification:', error);
        setIsVisible(false);
        setNotification(null);
      }
    };

    loadNotification();

    // Poll every 5 minutes to update notification status
    const interval = setInterval(loadNotification, 300000);
    return () => clearInterval(interval);
  }, []);

  if (!notification || !isVisible) {
    return null;
  }

  // Determine background color
  const bgColor = notification.background_color || '#3B82F6';
  const textColor = 'white'; // assume light background

  return (
    <div
      className="h-12 flex items-center relative"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* SPONSORED text left */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <span className="text-[10px] text-black opacity-30">SPONSORED</span>
      </div>

      {/* Advertise Here text right */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <a
          href="mailto:freepromptsmail@gmail.com"
          className="text-[10px] text-black opacity-30 hover:opacity-50 transition-opacity"
          target="_blank"
          rel="noopener noreferrer"
        >
          Advertise Here
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {notification.icon && (
              <span className="text-xl">{notification.icon}</span>
            )}
            <div>
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {notification.link_text && notification.link_url && (
              <a
                href={notification.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium underline hover:no-underline"
              >
                {notification.link_text}
              </a>
            )}

            <button
              onClick={() => {
                setIsVisible(false);
                if (notification) {
                  const dismissedIds = JSON.parse(localStorage.getItem('dismissed_notification_ids') || '[]');
                  if (!dismissedIds.includes(notification.id)) {
                    dismissedIds.push(notification.id);
                    localStorage.setItem('dismissed_notification_ids', JSON.stringify(dismissedIds));
                  }
                }
              }}
              className="text-white hover:text-gray-200 p-1"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}