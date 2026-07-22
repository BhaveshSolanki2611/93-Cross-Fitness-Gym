/**
 * Service / program catalog. Drives the Services listing, per-service pages,
 * homepage overview and schedule filters. Content is inferred to industry
 * standard where the owner brief was silent — refine copy before launch.
 */

export type ServiceCategory = "training" | "classes" | "wellness";

export interface Service {
  slug: string;
  name: string;
  tagline: string;
  /** Lucide icon name — resolved in the UI. */
  icon: string;
  category: ServiceCategory;
  summary: string;
  description: string;
  highlights: string[];
  /** Placeholder image path; swap with real gym photos under /images/real. */
  image: string;
  featured?: boolean;
}

export const services: Service[] = [
  {
    slug: "crossfit",
    name: "CrossFit",
    tagline: "Constantly varied, high-intensity functional training",
    icon: "Dumbbell",
    category: "training",
    summary:
      "Coach-led WODs that build real-world strength, stamina and grit in a community that pushes you further.",
    description:
      "Our CrossFit box blends olympic lifting, gymnastics and metabolic conditioning into scalable daily workouts. Every session is coached, every movement is scaled to your level, and every rep is tracked so you see measurable progress.",
    highlights: ["Certified CrossFit coaches", "Scaled for all levels", "Daily programmed WODs", "Strong community"],
    image: "/images/stock/crossfit.jpg",
    featured: true,
  },
  {
    slug: "hiit",
    name: "HIIT",
    tagline: "Maximum burn in minimum time",
    icon: "Flame",
    category: "classes",
    summary:
      "Short, explosive intervals that torch calories and boost your metabolism for hours after you leave.",
    description:
      "High-Intensity Interval Training alternates all-out effort with brief recovery to maximise fat loss and cardiovascular fitness. Perfect for busy schedules — big results in 30–45 minutes.",
    highlights: ["30–45 min sessions", "Afterburn effect", "Beginner to advanced", "No equipment needed"],
    image: "/images/stock/hiit.jpg",
    featured: true,
  },
  {
    slug: "personal-training",
    name: "Personal Training",
    tagline: "One-on-one coaching built around you",
    icon: "UserCheck",
    category: "training",
    summary:
      "A dedicated certified trainer, a plan tailored to your goals, and accountability that gets you there faster.",
    description:
      "Whether your goal is fat loss, muscle gain, strength or rehab, your personal trainer designs a custom program, corrects your form in real time, and adapts as you progress.",
    highlights: ["Custom program", "Form correction", "Nutrition guidance", "Flexible scheduling"],
    image: "/images/stock/personal-training.jpg",
    featured: true,
  },
  {
    slug: "weight-training",
    name: "Weight Training",
    tagline: "Build strength on world-class equipment",
    icon: "Weight",
    category: "training",
    summary:
      "A fully-equipped strength floor with free weights, machines and platforms for every lift.",
    description:
      "From your first dumbbell to a heavy barbell squat, our strength floor is maintained to the highest standard with progressive programming support from the floor team.",
    highlights: ["Free weights & machines", "Lifting platforms", "Spotting support", "Progressive programs"],
    image: "/images/stock/weight-training.jpg",
  },
  {
    slug: "zumba",
    name: "Zumba",
    tagline: "Dance your way fit",
    icon: "Music",
    category: "classes",
    summary: "High-energy Latin-inspired dance workouts that feel like a party and burn like a workout.",
    description:
      "Zumba fuses dance and aerobics into an infectiously fun class. No dance experience needed — just show up and move.",
    highlights: ["High-energy fun", "Full-body cardio", "All ages welcome", "Certified instructors"],
    image: "/images/stock/zumba.jpg",
  },
  {
    slug: "yoga",
    name: "Yoga",
    tagline: "Strength, flexibility and calm",
    icon: "Flower2",
    category: "wellness",
    summary: "Guided yoga to improve mobility, core strength and mental clarity for every experience level.",
    description:
      "Our yoga sessions balance dynamic flows with restorative practice, improving flexibility, posture and stress resilience.",
    highlights: ["Vinyasa & Hatha", "Breath & mobility work", "Stress relief", "All levels"],
    image: "/images/stock/yoga.jpg",
  },
  {
    slug: "pilates",
    name: "Pilates",
    tagline: "Core control and lean strength",
    icon: "Activity",
    category: "wellness",
    summary: "Low-impact, high-control training that sculpts a strong core and improves posture.",
    description:
      "Pilates targets deep stabilising muscles for better posture, balance and injury resilience — ideal alongside strength or as a standalone practice.",
    highlights: ["Core-focused", "Low impact", "Posture & balance", "Rehab friendly"],
    image: "/images/stock/pilates.jpg",
  },
  {
    slug: "aerobics",
    name: "Aerobics",
    tagline: "Classic cardio conditioning",
    icon: "HeartPulse",
    category: "classes",
    summary: "Choreographed cardio classes that build endurance and keep your heart healthy.",
    description:
      "Energetic group aerobics improves cardiovascular health, coordination and stamina in a motivating class setting.",
    highlights: ["Cardio endurance", "Group energy", "Beginner friendly", "Heart health"],
    image: "/images/stock/aerobics.jpg",
  },
  {
    slug: "dance-fitness",
    name: "Dance Fitness",
    tagline: "Move to the music, lose the calories",
    icon: "PartyPopper",
    category: "classes",
    summary: "Choreographed dance workouts across styles that make fitness feel like fun.",
    description:
      "Dance fitness blends multiple dance styles into a joyful, sweat-inducing workout that builds coordination and cardio.",
    highlights: ["Multiple styles", "Cardio burn", "Coordination", "No experience needed"],
    image: "/images/stock/dance-fitness.jpg",
  },
  {
    slug: "cycling",
    name: "Cycling",
    tagline: "Ride to the rhythm",
    icon: "Bike",
    category: "classes",
    summary: "Indoor cycling classes that deliver a powerful low-impact cardio and leg workout.",
    description:
      "Studio cycling combines interval training with music-driven motivation for an intense yet joint-friendly cardio session.",
    highlights: ["Low impact", "Interval-based", "Leg & core power", "Energising music"],
    image: "/images/stock/cycling.jpg",
  },
  {
    slug: "nutrition-consulting",
    name: "Nutrition Consulting",
    tagline: "Fuel your transformation",
    icon: "Apple",
    category: "wellness",
    summary: "Personalised diet plans and expert guidance to match your training with the right nutrition.",
    description:
      "Our nutritionists build sustainable, India-friendly meal plans tailored to your goals, preferences and lifestyle — because results are made in the kitchen too.",
    highlights: ["Personalised plans", "Sustainable habits", "Goal-based macros", "Ongoing support"],
    image: "/images/stock/nutrition.jpg",
  },
  {
    slug: "spa",
    name: "Spa & Recovery",
    tagline: "Recover, relax, restore",
    icon: "Sparkles",
    category: "wellness",
    summary: "Massage and spa services to speed recovery, ease soreness and help you feel your best.",
    description:
      "Complement your training with our spa and recovery services — designed to reduce muscle tension, improve circulation and support long-term wellbeing.",
    highlights: ["Sports massage", "Muscle recovery", "Relaxation therapy", "Wellbeing focus"],
    image: "/images/stock/spa.jpg",
    featured: true,
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
