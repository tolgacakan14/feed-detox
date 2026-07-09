import { ListChecks, MousePointerClick, PackageOpen } from "lucide-react";
import { translations } from "@/lib/i18n";

const ICONS = [ListChecks, PackageOpen, MousePointerClick];
const GRADIENTS = [
  "from-tealbrand to-aqua",
  "from-coral to-tangerine",
  "from-limepunch to-emerald-500",
];

export function HowItWorks() {
  // Homepage marketing section renders in English (the EN/TR toggle drives the
  // hero + Feed Pack flow, which carry language through to /results).
  const t = translations.en;
  const steps = [
    { title: t.steps[0], description: t.steps[1] },
    { title: t.steps[2], description: t.steps[3] },
    { title: t.steps[4], description: t.steps[5] },
  ];

  return (
    <section id="how" className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <span className="text-gradient text-xs font-bold uppercase tracking-[0.2em]">
            {t.howEyebrow}
          </span>
          <h2 className="mt-3 text-balance font-heading text-2xl font-semibold sm:text-3xl">
            {t.howTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-sm leading-6 text-muted-foreground">
            {t.explainer}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = ICONS[index];
            return (
              <div
                key={step.title}
                className="flex flex-col gap-3 rounded-2xl bg-card p-6 ring-1 ring-foreground/[0.08] transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-aqua/10"
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ${GRADIENTS[index]}`}
                >
                  <Icon className="size-5" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Step {index + 1}
                </p>
                <h3 className="font-heading text-base font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
