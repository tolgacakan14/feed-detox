import { Bot, MousePointerClick, PackageOpen } from "lucide-react";

const steps = [
  {
    icon: Bot,
    gradient: "from-tealbrand to-aqua",
    title: "Tell Detox Bot what you want to see",
    description: "Type any topic — Galatasaray, AI tools, streetwear. English or Turkish.",
  },
  {
    icon: PackageOpen,
    gradient: "from-coral to-tangerine",
    title: "Get the best creators, channels, communities and search links",
    description: "A personalized Feed Education Pack, grouped by platform.",
  },
  {
    icon: MousePointerClick,
    gradient: "from-limepunch to-emerald-500",
    title: "Click, follow, watch, save and mute to train your algorithm",
    description: "Your feed learns from what you engage with. We just hand you better signals.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <span className="text-gradient text-xs font-bold uppercase tracking-[0.2em]">
            How it works
          </span>
          <h2 className="mt-3 text-balance font-heading text-2xl font-semibold sm:text-3xl">
            Train your timeline in three steps
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex flex-col gap-3 rounded-2xl bg-card p-6 ring-1 ring-foreground/10 transition-shadow hover:shadow-lg hover:shadow-aqua/10"
            >
              <div
                className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${step.gradient}`}
              >
                <step.icon className="size-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Step {index + 1}
              </p>
              <h3 className="font-heading text-base font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
