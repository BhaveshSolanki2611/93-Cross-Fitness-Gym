/**
 * Trainer roster. Representative/inferred profiles — replace names, photos and
 * bios with the real team before launch. Photos: /images/placeholder/*.
 */
export interface Trainer {
  slug: string;
  name: string;
  role: string;
  specialties: string[];
  certifications: string[];
  bio: string;
  image: string;
  socials?: { instagram?: string };
}

export const trainers: Trainer[] = [
  {
    slug: "rohit-verma",
    name: "Rohit Verma",
    role: "Head Coach · CrossFit",
    specialties: ["CrossFit", "Olympic Lifting", "Strength"],
    certifications: ["CrossFit Level 2", "NSCA-CPT"],
    bio: "Rohit leads our CrossFit programming with 10+ years turning beginners into confident, capable athletes.",
    image: "/images/stock/trainer-rohit.jpg",
  },
  {
    slug: "sneha-kapoor",
    name: "Sneha Kapoor",
    role: "Yoga & Pilates Lead",
    specialties: ["Yoga", "Pilates", "Mobility"],
    certifications: ["RYT-500", "Mat Pilates Certified"],
    bio: "Sneha blends strength and stillness, helping members move better and stress less through mindful practice.",
    image: "/images/stock/trainer-sneha.jpg",
  },
  {
    slug: "amit-singh",
    name: "Amit Singh",
    role: "Strength & Conditioning",
    specialties: ["Weight Training", "Fat Loss", "Athletic Performance"],
    certifications: ["ACE-CPT", "Precision Nutrition L1"],
    bio: "Amit builds no-nonsense strength programs and holds you accountable to the results you came for.",
    image: "/images/stock/trainer-amit.jpg",
  },
  {
    slug: "pooja-nair",
    name: "Pooja Nair",
    role: "Group Fitness · Zumba & Dance",
    specialties: ["Zumba", "Dance Fitness", "Aerobics"],
    certifications: ["Zumba Licensed", "Group Fitness Certified"],
    bio: "Pooja's classes are the most fun 45 minutes of your day — high energy, zero judgement, all sweat.",
    image: "/images/stock/trainer-pooja.jpg",
  },
  {
    slug: "karan-mehta",
    name: "Karan Mehta",
    role: "Personal Trainer · HIIT",
    specialties: ["HIIT", "Personal Training", "Cycling"],
    certifications: ["ISSA-CPT", "Spinning Certified"],
    bio: "Karan specialises in time-efficient fat loss for busy professionals who want maximum results per minute.",
    image: "/images/stock/trainer-karan.jpg",
  },
  {
    slug: "divya-rao",
    name: "Divya Rao",
    role: "Sports Nutritionist",
    specialties: ["Nutrition", "Weight Management", "Wellness"],
    certifications: ["MSc Dietetics", "Sports Nutrition Certified"],
    bio: "Divya designs sustainable, India-friendly nutrition plans that fit real lives — not crash diets.",
    image: "/images/stock/trainer-divya.jpg",
  },
];
