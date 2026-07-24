"use client";

import type { ReactNode } from "react";
import { useLang } from "@/lib/langContext";

/** Shared shell for /privacy, /terms, /support — matches the app's existing
 * card visual language (rounded-2xl, ring-1, max-w-3xl reading column). */
export function LegalPage({
  titleEn,
  titleTr,
  updatedEn,
  updatedTr,
  en,
  tr,
}: {
  titleEn: string;
  titleTr: string;
  updatedEn: string;
  updatedTr: string;
  /** Both language bodies are passed as plain ReactNode (not a render-prop
   * function) because this is a Client Component rendered from a Server
   * Component page — functions can't cross that boundary as props. Only
   * the active language's tree is shown; the other never mounts. */
  en: ReactNode;
  tr: ReactNode;
}) {
  const { lang } = useLang();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="fade-up glass-card rounded-3xl p-6 shadow-lg shadow-aqua/5 sm:p-10">
        <h1 className="text-balance font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {lang === "tr" ? titleTr : titleEn}
        </h1>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          {lang === "tr" ? updatedTr : updatedEn}
        </p>
        <div className="prose-legal mt-8 flex flex-col gap-6 text-sm leading-6 text-muted-foreground [&_h2]:mt-2 [&_h2]:font-heading [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
          {lang === "tr" ? tr : en}
        </div>
      </div>
    </div>
  );
}
