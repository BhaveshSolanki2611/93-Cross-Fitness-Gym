/**
 * Blog posts for local long-tail SEO. Bodies are markdown-ish plain text
 * rendered as paragraphs. Move to Supabase CMS in a later phase.
 */
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string; // ISO
  readingTime: string;
  cover: string;
  body: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "best-gym-in-sector-82-faridabad",
    title: "How to Choose the Best Gym in Sector 82, Faridabad",
    excerpt:
      "Equipment, coaching, cleanliness and community — the five things that actually matter when picking a gym near you.",
    category: "Guides",
    author: "93 Cross Fitness Team",
    date: "2026-05-20",
    readingTime: "5 min read",
    cover: "/images/stock/blog-1.jpg",
    body: [
      "Choosing a gym is one of the most important decisions for your health — and in a busy area like Sector 82, Faridabad, you have options. Here's how to pick the one that will actually keep you coming back.",
      "1. Coaching quality. A great gym lives and dies by its trainers. Look for certified coaches who watch your form, scale workouts to your level, and genuinely care about your progress.",
      "2. Equipment and cleanliness. Well-maintained equipment and a clean, hygienic space aren't luxuries — they're the baseline for a safe, motivating workout.",
      "3. Class variety. From CrossFit and HIIT to Zumba, yoga and Pilates, variety keeps training fun and works your body in different ways.",
      "4. Community. The right crowd turns a chore into a habit. Visit at the time you'd usually train and see how the room feels.",
      "5. Value and flexibility. Transparent pricing, freeze options and free trials show a gym that's confident in its product. Come try a free session at 93 Cross Fitness and feel the difference.",
    ],
  },
  {
    slug: "crossfit-vs-hiit",
    title: "CrossFit vs HIIT: Which One Is Right for You?",
    excerpt:
      "Both burn fat and build fitness fast — but they're not the same. Here's how to choose based on your goals.",
    category: "Training",
    author: "Rohit Verma",
    date: "2026-06-02",
    readingTime: "6 min read",
    cover: "/images/stock/blog-2.jpg",
    body: [
      "CrossFit and HIIT are two of the most effective ways to get fit fast — but people often confuse them. Let's break down the difference.",
      "HIIT (High-Intensity Interval Training) alternates short bursts of maximum effort with brief recovery. It's fantastic for fat loss and cardiovascular fitness, and sessions are short — often 30 to 45 minutes.",
      "CrossFit is a broader strength and conditioning methodology combining weightlifting, gymnastics and metabolic conditioning into constantly varied, coached workouts. It builds strength, skill and community.",
      "If your priority is quick, time-efficient fat loss, HIIT is a great entry point. If you want to build all-round strength and skill in a coached, community setting, CrossFit is hard to beat.",
      "The best answer for most people? A blend — and at 93 Cross Fitness you can do both under one roof.",
    ],
  },
  {
    slug: "nutrition-basics-for-fat-loss",
    title: "Nutrition Basics for Fat Loss (That Actually Work in India)",
    excerpt:
      "Forget crash diets. Sustainable fat loss comes down to a few simple, India-friendly principles.",
    category: "Nutrition",
    author: "Divya Rao",
    date: "2026-06-18",
    readingTime: "7 min read",
    cover: "/images/stock/blog-3.jpg",
    body: [
      "You can't out-train a bad diet. But 'good nutrition' doesn't mean giving up dal, roti and the food you love. Here are the fundamentals.",
      "Prioritise protein. Aim to include a protein source — dal, paneer, eggs, chicken, curd — in every meal. Protein keeps you full and protects muscle while you lose fat.",
      "Mind your portions, not perfection. A simple plate method — half vegetables, a quarter protein, a quarter carbs — works better long-term than counting every calorie.",
      "Hydrate and sleep. Both quietly drive appetite and recovery. Most people under-do both.",
      "Be consistent, not extreme. Sustainable habits beat crash diets every time. Our nutritionists build plans around your real life — book a consultation to get started.",
    ],
  },
];

export function getPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
