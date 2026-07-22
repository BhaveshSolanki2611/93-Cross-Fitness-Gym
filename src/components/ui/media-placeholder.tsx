import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

/**
 * Branded placeholder for imagery until real gym photos are added.
 * Drop real photos in /public/images/real and replace usages with next/image.
 */
export function MediaPlaceholder({
  label,
  icon = "Dumbbell",
  className,
  seed = 0,
}: {
  label?: string;
  icon?: string;
  className?: string;
  seed?: number;
}) {
  const hue = 60 + ((seed * 47) % 40); // subtle variation around the volt accent
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-surface-2",
        className
      )}
      style={{
        backgroundImage: `radial-gradient(120% 120% at 20% 0%, hsl(${hue} 90% 55% / 0.18), transparent 55%), radial-gradient(100% 100% at 100% 100%, hsl(${hue} 80% 50% / 0.1), transparent 50%)`,
      }}
      aria-hidden
    >
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="relative flex flex-col items-center gap-2 text-muted-2">
        <Icon name={icon} className="size-8 opacity-70" />
        {label && (
          <span className="text-[10px] font-semibold uppercase tracking-widest">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
