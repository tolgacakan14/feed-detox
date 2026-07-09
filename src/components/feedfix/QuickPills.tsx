"use client";

export const QUICK_PILLS = [
  "Galatasaray",
  "AI Tools",
  "Football",
  "Career",
  "Music",
  "Fashion",
  "No Politics",
  "Turkish",
  "English",
  "Global",
  "Niche Creators",
] as const;

export function QuickPills({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (pill: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {QUICK_PILLS.map((pill) => {
        const isActive = selected.includes(pill);
        return (
          <button
            key={pill}
            type="button"
            onClick={() => onToggle(pill)}
            aria-pressed={isActive}
            className={
              isActive
                ? "rounded-full bg-brand-gradient px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-aqua/25 transition-transform hover:scale-105"
                : "rounded-full border border-border bg-background/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:border-aqua/60 hover:text-foreground hover:shadow-md hover:shadow-aqua/20"
            }
          >
            {pill}
          </button>
        );
      })}
    </div>
  );
}
