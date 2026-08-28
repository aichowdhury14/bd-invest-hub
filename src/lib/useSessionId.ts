"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "bdih_session_id";

/**
 * A random, anonymous, client-generated id kept in localStorage purely to group
 * usage events for the admin analytics dashboard (e.g. "distinct sessions today").
 * It carries no personal information and nothing is ever sent to a third party.
 */
export function useSessionId(): string | null {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    setSessionId(id);
  }, []);

  return sessionId;
}
