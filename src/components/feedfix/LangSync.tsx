"use client";

import { useEffect } from "react";
import { useLang } from "@/lib/langContext";
import type { UiLang } from "@/types";

/** Renders nothing — syncs the global header/footer language to the Feed
 * Pack's own language on /results, so a Turkish pack gets a Turkish shell. */
export function LangSync({ lang }: { lang: UiLang }) {
  const { lang: current, setLang } = useLang();
  useEffect(() => {
    if (current !== lang) setLang(lang);
  }, [lang, current, setLang]);
  return null;
}
