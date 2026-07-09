import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CtaLink } from "@/components/feedfix/CtaLink";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-heading text-lg font-bold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-xl bg-brand-gradient text-sm font-bold text-white shadow-md shadow-aqua/30">
            fd
          </span>
          Feed<span className="text-gradient -ml-2">Detox</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/#how" className="transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link href="/packs" className="transition-colors hover:text-foreground">
            Sample Packs
          </Link>
          <Link href="/#early-access" className="transition-colors hover:text-foreground">
            Early Access
          </Link>
        </nav>

        <Button
          size="sm"
          className="rounded-full border-0 bg-brand-gradient px-4 text-white transition-opacity hover:opacity-90"
          render={
            <CtaLink href="/#chat" ctaId="header-primary">
              Try Detox ✨
            </CtaLink>
          }
        />
      </div>
    </header>
  );
}
