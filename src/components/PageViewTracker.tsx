"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSessionId } from "@/lib/useSessionId";
import { trackPageView } from "@/lib/analytics";

export function PageViewTracker() {
  const pathname = usePathname();
  const sessionId = useSessionId();

  useEffect(() => {
    if (!sessionId || !pathname) return;
    if (pathname.startsWith("/admin")) return;
    trackPageView(pathname, sessionId, document.referrer || undefined);
  }, [pathname, sessionId]);

  return null;
}
