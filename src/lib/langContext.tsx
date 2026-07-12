"use client";

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";
import type { UiLang } from "@/types";

const STORAGE_KEY = "feeddetox.lang";

// Tiny external store: localStorage is the source of truth when available,
// with an in-memory fallback (private mode, storage blocked). Exposed to
// React via useSyncExternalStore, which handles the SSR → client handoff
// without hydration mismatches (server snapshot is always "en").
const listeners = new Set<() => void>();
let sessionLang: UiLang | null = null;

function getSnapshot(): UiLang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "tr" || stored === "en") return stored;
  } catch {
    // storage unavailable — fall back to the in-memory session value
  }
  return sessionLang ?? "en";
}

function setStoredLang(lang: UiLang) {
  sessionLang = lang;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // best-effort persistence only
  }
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

const LangContext = createContext<{ lang: UiLang; setLang: (lang: UiLang) => void } | null>(null);

/** Shares the EN/TR toggle across the whole shell (header, hero, marketing
 * sections, footer) and persists the choice across reloads. */
export function LangProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, () => "en" as UiLang);
  const setLang = useCallback((l: UiLang) => setStoredLang(l), []);
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within a LangProvider");
  return ctx;
}
