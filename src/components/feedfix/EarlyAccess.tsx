"use client";

import { useState } from "react";
import { Check, Mail } from "lucide-react";
import { saveEmailSignup } from "@/lib/emailCapture";
import { trackEvent } from "@/lib/analytics";

export function EarlyAccess() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "done">("idle");

  async function submit() {
    const trimmed = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) return;
    await saveEmailSignup({ email: trimmed, source: "early-access" });
    trackEvent("email_submitted", { source: "early-access" });
    setStatus("done");
  }

  return (
    <section id="early-access" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-center text-white shadow-xl shadow-aqua/20 sm:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/15 blur-2xl"
        />
        <h2 className="text-balance font-heading text-2xl font-bold sm:text-3xl">
          Get early access
        </h2>
        <p className="mx-auto mt-3 max-w-md text-balance text-sm text-white/85">
          Real-time creator ranking, verified profiles and weekly Feed Pack
          refreshes are coming. Be first in line.
        </p>

        {status === "done" ? (
          <p className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5 text-sm font-semibold backdrop-blur">
            <Check className="size-4" /> You&apos;re on the list.
          </p>
        ) : (
          <div className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/60" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="you@email.com"
                aria-label="Email"
                className="h-11 w-full rounded-full border border-white/30 bg-white/15 pl-10 pr-4 text-sm text-white outline-none backdrop-blur placeholder:text-white/60 focus:border-white/60"
              />
            </div>
            <button
              type="button"
              onClick={submit}
              className="h-11 rounded-full bg-white px-6 text-sm font-bold text-tealbrand transition-transform hover:scale-105"
            >
              Join the list
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
