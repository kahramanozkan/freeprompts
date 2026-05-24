"use client";

import { useEffect, useState } from "react";

interface AdSpaceProps {
  slot?: string;
  format?: "horizontal" | "vertical" | "rectangle";
  className?: string;
}

const publisherId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID || "";
const desktopSlotId = process.env.NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID_DESKTOP || process.env.NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID || "";
const mobileSlotId = process.env.NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID_MOBILE || desktopSlotId;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSpace({
  slot,
  format = "horizontal",
  className = "",
}: AdSpaceProps) {
  const formatClasses = {
    horizontal: "h-24",
    vertical: "h-96",
    rectangle: "h-64",
  };

  const [mounted, setMounted] = useState(false);
  const [activeSlot, setActiveSlot] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      const slotToUse = slot || (isMobile ? mobileSlotId : desktopSlotId);
      setActiveSlot(slotToUse);
    }
  }, [slot]);

  // Check if ads should render (only after mount to avoid hydration issues)
  const shouldRenderAd = mounted && publisherId && publisherId.startsWith("ca-pub-") && activeSlot && activeSlot !== "ad-slot-1";

  useEffect(() => {
    if (shouldRenderAd && typeof window !== "undefined") {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // Ignore errors from ad blockers
      }
    }
  }, [shouldRenderAd, activeSlot]);

  // Always render the same container div for consistent server/client HTML
  return (
    <div className={`${formatClasses[format]} ${className}`}>
      {shouldRenderAd && (
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={publisherId}
          data-ad-slot={activeSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
          data-ad-test={process.env.NODE_ENV === "development" ? "on" : undefined}
        ></ins>
      )}
    </div>
  );
}