/**
 * Paraphrased testimonials reflecting real review THEMES (certified/motivating
 * trainers, clean facility, class variety, helpful staff, good value).
 * These are representative composites — replace with consented real quotes when available.
 */
export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    name: "Priya S.",
    role: "Member · 1 year",
    quote:
      "The trainers are genuinely certified and so motivating. They corrected my form from day one and I've never felt stronger.",
    rating: 5,
  },
  {
    name: "Rahul M.",
    role: "CrossFit member",
    quote:
      "Cleanest gym in Sector 82 by far. Equipment is always well maintained and the CrossFit community keeps me showing up.",
    rating: 5,
  },
  {
    name: "Aisha K.",
    role: "Zumba & Yoga",
    quote:
      "Love the variety of classes — Zumba, yoga, aerobics, there's always something. The instructors bring so much energy.",
    rating: 5,
  },
  {
    name: "Vikram T.",
    role: "Member · 8 months",
    quote:
      "Reception staff are super helpful and the whole place feels premium. Honestly great value for the money.",
    rating: 5,
  },
  {
    name: "Neha R.",
    role: "Personal training",
    quote:
      "My personal trainer built a plan around my goals and the nutrition guidance made all the difference. Down 9 kg!",
    rating: 5,
  },
  {
    name: "Arjun P.",
    role: "Weight training",
    quote:
      "Spacious strength floor, great machines, and the spa afterwards is the perfect recovery. Highly recommend.",
    rating: 5,
  },
];
