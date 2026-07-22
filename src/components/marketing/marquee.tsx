const words = [
  "CrossFit",
  "HIIT",
  "Strength",
  "Yoga",
  "Zumba",
  "Pilates",
  "Cycling",
  "Spa",
  "Nutrition",
  "Personal Training",
];

export function Marquee() {
  return (
    <div className="relative flex overflow-hidden border-y border-border bg-surface/40 py-5">
      <div className="animate-marquee flex shrink-0 items-center gap-8 whitespace-nowrap">
        {[...words, ...words].map((w, i) => (
          <span
            key={i}
            className="flex items-center gap-8 font-display text-2xl uppercase tracking-tight text-muted-2 md:text-3xl"
          >
            {w}
            <span className="text-primary">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
