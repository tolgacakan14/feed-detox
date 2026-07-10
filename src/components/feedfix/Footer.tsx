import Link from "next/link";

export function Footer() {
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
          <p className="mt-3 text-sm text-muted-foreground">
            Educate your feed. Train your timeline. Feed Detox gives you the creators, links,
            communities and searches to rebuild your feed — manually, on your terms.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div>
            <p className="font-medium">Product</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li><Link href="/#chat" className="hover:text-foreground">Feed Pack</Link></li>
              <li><Link href="/packs" className="hover:text-foreground">Sample Packs</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-medium">More</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li><Link href="/#how" className="hover:text-foreground">How it works</Link></li>
              <li><Link href="/#early-access" className="hover:text-foreground">Early Access</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 py-4">
        <p className="mx-auto max-w-6xl px-4 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} Feed Detox. We never connect to, access, or modify your
          social media accounts — every link opens the real platform in your own browser.
        </p>
      </div>
    </footer>
  );
}
