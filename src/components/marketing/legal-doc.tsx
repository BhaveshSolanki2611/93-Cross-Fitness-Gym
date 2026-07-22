import { PageHeader } from "@/components/marketing/page-header";

export interface LegalSection {
  heading: string;
  body: string[];
}

export function LegalDoc({
  title,
  updated,
  sections,
  slug,
}: {
  title: string;
  updated: string;
  sections: LegalSection[];
  slug: string;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title={title}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: title, href: `/${slug}` }]}
      />
      <article className="container-x max-w-3xl py-16">
        <p className="mb-10 text-sm text-muted-2">Last updated: {updated}</p>
        <div className="flex flex-col gap-8">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="mb-3 text-xl">{s.heading}</h2>
              <div className="flex flex-col gap-3 text-muted">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </>
  );
}
