import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { ScheduleView } from "@/components/marketing/schedule-view";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata: Metadata = {
  title: "Class Schedule & Timetable",
  description:
    "Weekly class timetable at 93 Cross Fitness Gym & Spa, Faridabad — CrossFit, HIIT, Zumba, yoga, Pilates, cycling and more. Filter by day.",
  alternates: { canonical: "/schedule" },
};

export default function SchedulePage() {
  return (
    <>
      <PageHeader
        eyebrow="Timetable"
        title={<>Weekly <span className="text-volt">class schedule</span></>}
        description="25+ coached classes every week. Pick a day, find your class, and book your spot."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Schedule", href: "/schedule" }]}
      />
      <section className="container-x py-16">
        <ScheduleView />
      </section>
      <CtaBand />
    </>
  );
}
