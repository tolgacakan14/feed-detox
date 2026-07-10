"use client";

import Link from "next/link";
import { useLang } from "@/lib/langContext";
import { translations } from "@/lib/i18n";

export function Footer() {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5 font-heading text-lg font-bold tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand-gradient text-xs font-bold text-white">
              fd
            </span>
            Feed<span className="text-gradient -ml-2">Detox</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t.footerTagline}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div>
            <p className="font-medium">{t.footerProductCol}</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li><Link href="/#chat" className="hover:text-foreground">Feed Pack</Link></li>
              <li><Link href="/packs" className="hover:text-foreground">{t.navPacks}</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-medium">{t.footerMoreCol}</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li><Link href="/#how" className="hover:text-foreground">{t.navHow}</Link></li>
              <li><Link href="/#early-access" className="hover:text-foreground">{t.navEarly}</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 py-4">
        <p className="mx-auto max-w-6xl px-4 text-xs text-muted-foreground sm:px-6">
          {t.footerLegal.replace("{y}", String(new Date().getFullYear()))}
        </p>
      </div>
    </footer>
  );
}
