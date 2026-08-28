"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "bdih_session_id";

let cached: string | null = null;

function getSnapshot(): string {
  if (cached) return cached;
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  cached = id;
  return id;
}

function getServerSnapshot(): string | null {
  return null;
}

function subscribe() {
  // The id is generated once and never changes for the lifetime of the browser
  // storage, so there is nothing external to subscribe to.
  return () => {};
}

/**
 * A random, anonymous, client-generated id kept in localStorage purely to group
 * usage events for the admin analytics dashboard (e.g. "distinct sessions today").
 * It carries no personal information and nothing is ever sent to a third party.
 */
export function useSessionId(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
