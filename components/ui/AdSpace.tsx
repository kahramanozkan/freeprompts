"use client";

import { useEffect, useState } from "react";

interface AdSpaceProps {
  slot?: string;
  format?: "horizontal" | "vertical" | "rectangle";
  className?: string;
}

const publisherId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID || "ca-pub-5496537037248215"; // Use ca-pub- prefix
const slotId = process.env.NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID || "ad-slot-1";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSpace({
  slot = slotId,
  format = "horizontal",
  className = "",
}: AdSpaceProps) {
  // If environment variables are not set (or are default placeholder values), don't render ads
  const shouldRenderAd = publisherId && publisherId !== "ca-pub-5496537037248215" && slot && slot !== "ad-slot-1";

  const formatClasses = {
    horizontal: "h-24",
    vertical: "h-96",
    rectangle: "h-64",
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load AdSense script if not already loaded
    if (typeof window !== "undefined" && shouldRenderAd) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        // Ignore errors from ad blockers
        console.warn('AdSense script failed to load (likely blocked by ad blocker)');
      }
    }
  }, [shouldRenderAd]);

  if (!mounted || !shouldRenderAd) {
    return null; // Don't render anything on the server or if disabled
  }

  return (
    <div className={`${formatClasses[format]} ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-ad-test={process.env.NODE_ENV === "development" ? "on" : undefined}
      ></ins>
    </div>
  );
}