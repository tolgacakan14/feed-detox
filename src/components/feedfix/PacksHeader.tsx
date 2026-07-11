"use client";

import { useLang } from "@/lib/langContext";
import { translations } from "@/lib/i18n";

/** Localized heading for the /packs page — the page itself stays a server
 * component (it exports metadata), only the visible copy is client-side. */
export function PacksHeader() {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <div className="mb-10 text-center">
      <span className="text-gradient text-xs font-bold uppercase tracking-[0.2em]">
        {t.packsEyebrow}
      </span>
      <h1 className="mt-3 text-balance font-heading text-3xl font-semibold sm:text-4xl">
        {t.packsPageTitle}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-balance text-muted-foreground">
        {t.packsPageDesc}
      </p>
    </div>
  );
}
