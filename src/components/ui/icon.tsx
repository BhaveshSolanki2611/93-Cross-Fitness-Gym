import {
  Dumbbell,
  Flame,
  UserCheck,
  Weight,
  Music,
  Flower2,
  Activity,
  HeartPulse,
  PartyPopper,
  Bike,
  Apple,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Dumbbell,
  Flame,
  UserCheck,
  Weight,
  Music,
  Flower2,
  Activity,
  HeartPulse,
  PartyPopper,
  Bike,
  Apple,
  Sparkles,
};

export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Cmp = iconMap[name] ?? Dumbbell;
  return <Cmp className={className} aria-hidden />;
}
