/**
 * Single source of truth for brand identity, NAP (Name/Address/Phone), navigation,
 * services and social links. Change the business name / contact details HERE only.
 *
 * Verification status (web-checked 2026-07-22):
 *  - Address + PIN 121007: VERIFIED — matches the Google Maps listing exactly.
 *  - Geo coordinates: VERIFIED — taken from the Google Maps place URL.
 *  - Instagram handle: VERIFIED to exist.
 *  - Phones: from owner brief (aggregators show masked lead numbers — ignore those).
 *  - Hours: Mon–Sat corroborated by 2 directories; SUNDAY UNCONFIRMED (see below).
 *  - Email: placeholder — confirm the real one.
 *  - There is a SECOND branch (Sehatpur / Sector 91, est. 2018) — this site
 *    currently represents the Sector 82 branch; DB `branches` table supports both.
 */

export const siteConfig = {
  name: "93 Cross Fitness Gym & Spa",
  shortName: "93 Cross Fitness",
  tagline: "Train Hard. Live Strong.",
  description:
    "Premium gym & spa in Sector 82, Faridabad. CrossFit, HIIT, Zumba, Yoga, Pilates, personal training, weight training, nutrition consulting and spa — with certified, motivating trainers and world-class equipment.",
  url: "https://93crossfitness.com", // update to real domain before launch
  locale: "en-IN",
  verified: false,

  contact: {
    phonePrimary: "+919990300093",
    phonePrimaryDisplay: "099903 00093",
    phoneSecondary: "+919899930093",
    phoneSecondaryDisplay: "098999 30093",
    email: "info@93crossfitness.com", // placeholder — confirm real email
    whatsapp: "919990300093",
  },

  address: {
    line1: "Gate No-3, Shriram Complex",
    line2: "opp. BPTP Park Grandeura, Bhataula Village",
    area: "Sector 82",
    city: "Faridabad",
    state: "Haryana",
    postalCode: "121007",
    country: "IN",
    // full one-line form for schema / footer
    full: "Gate No-3, Shriram Complex, opp. BPTP Park Grandeura, Bhataula Village, Sector 82, Faridabad, Haryana 121007",
    // exact place coordinates from the Google Maps listing (verified 2026-07-22)
    geo: { lat: 28.3957344, lng: 77.3554952 },
    mapsShareUrl: "https://maps.app.goo.gl/dQ1gixqKXh61kzTb8",
    mapsEmbedSrc:
      "https://www.google.com/maps?q=93+Cross+Fitness+Gym+Sector+82+Faridabad&output=embed",
  },

  // Weekly hours — Mon–Sat 5:30 AM–10 PM corroborated by two directory listings
  // (BookMyPlayer "5:30am-10pm all days", Justdial "open until 10 pm").
  // Sunday differs across sources (one says 8 AM–12 PM, one says same as weekdays)
  // — OWNER MUST CONFIRM Sunday hours before launch.
  hours: [
    { day: "Monday", open: "05:30", close: "22:00" },
    { day: "Tuesday", open: "05:30", close: "22:00" },
    { day: "Wednesday", open: "05:30", close: "22:00" },
    { day: "Thursday", open: "05:30", close: "22:00" },
    { day: "Friday", open: "05:30", close: "22:00" },
    { day: "Saturday", open: "05:30", close: "22:00" },
    { day: "Sunday", open: "08:00", close: "12:00" },
  ],

  ratings: { value: 4.8, count: 199, verified: false },

  socials: {
    instagram: "https://www.instagram.com/93crossfitness_gym/",
    instagramHandle: "@93crossfitness_gym",
    facebook: "https://www.facebook.com/",
    youtube: "https://www.youtube.com/",
  },
} as const;

export type NavItem = { label: string; href: string };

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Trainers", href: "/trainers" },
  { label: "Pricing", href: "/pricing" },
  { label: "Schedule", href: "/schedule" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Programs",
    items: [
      { label: "CrossFit", href: "/services/crossfit" },
      { label: "HIIT", href: "/services/hiit" },
      { label: "Personal Training", href: "/services/personal-training" },
      { label: "Yoga", href: "/services/yoga" },
      { label: "Zumba", href: "/services/zumba" },
      { label: "Spa", href: "/services/spa" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About Us", href: "/about" },
      { label: "Trainers", href: "/trainers" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Members",
    items: [
      { label: "Join Now", href: "/join" },
      { label: "Pricing", href: "/pricing" },
      { label: "Free Trial", href: "/join?trial=1" },
      { label: "Member Login", href: "/login" },
      { label: "Tools & Calculators", href: "/tools" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
    ],
  },
];
