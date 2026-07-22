/**
 * Membership plans. Prices are INR placeholders — confirm real pricing with the
 * owner before launch. `id` values are reused later for Razorpay + Supabase plans.
 */
export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  /** Effective monthly price when billed on this term (for annual etc.). */
  quarterly: number;
  yearly: number;
  featured?: boolean;
  features: string[];
  cta: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Gym floor access to get you moving",
    monthly: 1499,
    quarterly: 3999,
    yearly: 13999,
    features: [
      "Full gym floor access",
      "Locker & changing rooms",
      "1 fitness assessment",
      "Access during standard hours",
    ],
    cta: "Start now",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Unlimited classes + gym — our most popular",
    monthly: 2499,
    quarterly: 6499,
    yearly: 22999,
    featured: true,
    features: [
      "Everything in Starter",
      "Unlimited group classes",
      "CrossFit, HIIT, Zumba, Yoga & more",
      "Monthly progress check-ins",
      "Guest passes (2/month)",
    ],
    cta: "Join Pro",
  },
  {
    id: "elite",
    name: "Elite",
    tagline: "Personal training + spa recovery",
    monthly: 4999,
    quarterly: 13999,
    yearly: 49999,
    features: [
      "Everything in Pro",
      "8 personal training sessions/mo",
      "Personalised nutrition plan",
      "2 spa recovery sessions/mo",
      "Priority class booking",
    ],
    cta: "Go Elite",
  },
];

export const planComparison: {
  feature: string;
  values: [string | boolean, string | boolean, string | boolean];
}[] = [
  { feature: "Gym floor access", values: [true, true, true] },
  { feature: "Group classes", values: [false, "Unlimited", "Unlimited"] },
  { feature: "Personal training", values: [false, false, "8 / month"] },
  { feature: "Nutrition plan", values: [false, "Basic", "Personalised"] },
  { feature: "Spa recovery", values: [false, false, "2 / month"] },
  { feature: "Guest passes", values: [false, "2 / month", "4 / month"] },
  { feature: "Progress check-ins", values: ["1", "Monthly", "Weekly"] },
];
