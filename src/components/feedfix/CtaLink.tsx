"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * A Next.js Link that fires a `cta_click` analytics event when clicked.
 * Designed to be passed to a Button's `render` prop, so it forwards every
 * prop (className, etc.) it receives onto the underlying Link.
 */
type CtaLinkProps = ComponentProps<typeof Link> & {
  ctaId: string;
};

export function CtaLink({ ctaId, onClick, children, ...props }: CtaLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        trackEvent("cta_click", { ctaId });
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
