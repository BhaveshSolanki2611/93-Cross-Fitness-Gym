/** Weekly class timetable (sample). Editable later via admin CMS. */
export type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export const days: Day[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export interface ClassSlot {
  day: Day;
  start: string; // "06:00"
  end: string;
  title: string;
  serviceSlug: string;
  trainer: string;
  intensity: "Low" | "Medium" | "High";
}

export const schedule: ClassSlot[] = [
  { day: "Monday", start: "06:00", end: "07:00", title: "CrossFit WOD", serviceSlug: "crossfit", trainer: "Rohit Verma", intensity: "High" },
  { day: "Monday", start: "07:30", end: "08:15", title: "HIIT Burn", serviceSlug: "hiit", trainer: "Karan Mehta", intensity: "High" },
  { day: "Monday", start: "18:00", end: "19:00", title: "Power Yoga", serviceSlug: "yoga", trainer: "Sneha Kapoor", intensity: "Medium" },
  { day: "Monday", start: "19:15", end: "20:00", title: "Zumba", serviceSlug: "zumba", trainer: "Pooja Nair", intensity: "Medium" },

  { day: "Tuesday", start: "06:00", end: "07:00", title: "Strength Foundations", serviceSlug: "weight-training", trainer: "Amit Singh", intensity: "Medium" },
  { day: "Tuesday", start: "07:30", end: "08:15", title: "Spin Cycle", serviceSlug: "cycling", trainer: "Karan Mehta", intensity: "High" },
  { day: "Tuesday", start: "18:00", end: "18:45", title: "Aerobics", serviceSlug: "aerobics", trainer: "Pooja Nair", intensity: "Medium" },
  { day: "Tuesday", start: "19:00", end: "20:00", title: "Pilates Core", serviceSlug: "pilates", trainer: "Sneha Kapoor", intensity: "Low" },

  { day: "Wednesday", start: "06:00", end: "07:00", title: "CrossFit WOD", serviceSlug: "crossfit", trainer: "Rohit Verma", intensity: "High" },
  { day: "Wednesday", start: "18:00", end: "18:45", title: "HIIT Express", serviceSlug: "hiit", trainer: "Karan Mehta", intensity: "High" },
  { day: "Wednesday", start: "19:00", end: "20:00", title: "Dance Fitness", serviceSlug: "dance-fitness", trainer: "Pooja Nair", intensity: "Medium" },

  { day: "Thursday", start: "06:00", end: "07:00", title: "Olympic Lifting", serviceSlug: "weight-training", trainer: "Rohit Verma", intensity: "High" },
  { day: "Thursday", start: "07:30", end: "08:15", title: "Vinyasa Flow", serviceSlug: "yoga", trainer: "Sneha Kapoor", intensity: "Medium" },
  { day: "Thursday", start: "18:30", end: "19:15", title: "Zumba", serviceSlug: "zumba", trainer: "Pooja Nair", intensity: "Medium" },

  { day: "Friday", start: "06:00", end: "07:00", title: "CrossFit WOD", serviceSlug: "crossfit", trainer: "Rohit Verma", intensity: "High" },
  { day: "Friday", start: "18:00", end: "18:45", title: "HIIT Burn", serviceSlug: "hiit", trainer: "Karan Mehta", intensity: "High" },
  { day: "Friday", start: "19:00", end: "20:00", title: "Power Yoga", serviceSlug: "yoga", trainer: "Sneha Kapoor", intensity: "Medium" },

  { day: "Saturday", start: "08:00", end: "09:00", title: "Weekend Warrior CrossFit", serviceSlug: "crossfit", trainer: "Amit Singh", intensity: "High" },
  { day: "Saturday", start: "10:00", end: "11:00", title: "Community Zumba", serviceSlug: "zumba", trainer: "Pooja Nair", intensity: "Medium" },
  { day: "Saturday", start: "17:00", end: "18:00", title: "Recovery Yoga", serviceSlug: "yoga", trainer: "Sneha Kapoor", intensity: "Low" },

  { day: "Sunday", start: "09:00", end: "10:00", title: "Open Gym + Mobility", serviceSlug: "weight-training", trainer: "Amit Singh", intensity: "Low" },
];
