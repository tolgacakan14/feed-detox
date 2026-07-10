"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { UiLang } from "@/types";

const LangContext = createContext<{ lang: UiLang; setLang: (lang: UiLang) => void } | null>(null);

/** Shares the EN/TR toggle between the hero and the marketing sections below
 * it (e.g. "How it works") so they never fall out of sync. */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<UiLang>("en");
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within a LangProvider");
  return ctx;
}
