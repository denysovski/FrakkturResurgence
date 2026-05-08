import PageLayout from "@/pages/PageLayout";
import SEO from "@/components/SEO";

type PolicySection = {
  title: string;
  content: string[];
};

type PolicyPageProps = {
  title: string;
  description: string;
  canonicalUrl: string;
  sections: PolicySection[];
};

export default function PolicyPage({ title, description, canonicalUrl, sections }: PolicyPageProps) {
  return (
    <PageLayout forceBlackNavbar={true}>
      <SEO title={title} description={description} canonicalUrl={canonicalUrl} />
      <div className="pt-32 pb-24 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Legal</p>
          <h1 className="text-4xl md:text-5xl font-light mb-4 tracking-tight">{title}</h1>
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl">{description}</p>

          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.title} className="border border-border rounded-sm p-6 md:p-8 bg-secondary/20">
                <h2 className="text-2xl font-light mb-4">{section.title}</h2>
                <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                  {section.content.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}