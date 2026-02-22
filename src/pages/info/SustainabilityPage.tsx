import PageLayout from "@/pages/PageLayout";
import SEO from "@/components/SEO";

const SustainabilityPage = () => {
  return (
    <PageLayout forceBlackNavbar={true}>
      <SEO
        title="Sustainability Program"
        description="Frakktur's commitment to sustainable luxury streetwear. Learn how we create fashion that respects people and the planet through ethical practices."
        canonicalUrl="https://frakktur.com/sustainability"
      />
      <div className="pt-32 pb-24 px-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-light mb-4 tracking-tight">
            Sustainability Program
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            Our commitment to creating fashion that respects both people and planet.
          </p>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-light mb-4">Our Commitment</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                At Frakktur, sustainability isn't a marketing buzzword—it's woven into everything we do. From sourcing materials to packaging, we continuously evaluate our impact and make conscious choices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light mb-4">Material Sourcing</h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">•</span>
                  <span>100% organic cotton for our core t-shirt collection</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">•</span>
                  <span>Recycled polyester blends for improved durability and reduced waste</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">•</span>
                  <span>Ethically sourced leather from certified suppliers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">•</span>
                  <span>Zero-water dyes for all our coloring processes</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light mb-4">Fair Labor Practices</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We partner exclusively with factories that meet or exceed international labor standards. All our manufacturing facilities are regularly audited to ensure:
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">•</span>
                  <span>Fair wages and safe working conditions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">•</span>
                  <span>No child labor or exploitative practices</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">•</span>
                  <span>Workers' right to organize and form unions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">•</span>
                  <span>Continuous training and development programs</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light mb-4">Packaging & Logistics</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Every detail matters when it comes to reducing our carbon footprint.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">•</span>
                  <span>100% recyclable, biodegradable packaging materials</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">•</span>
                  <span>Carbon-neutral shipping options available</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">•</span>
                  <span>Consolidated shipments to minimize logistics impact</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">•</span>
                  <span>Digital receipts by default</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light mb-4">Take Back Program</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We believe in circular fashion. Our take-back program allows customers to return worn Frakktur pieces for:
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">•</span>
                  <span>Recycling into new fibers for future collections</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">•</span>
                  <span>Refurbishment and donation to community programs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-foreground mt-0.5">•</span>
                  <span>Store credit as a thank you for participating</span>
                </li>
              </ul>
            </section>

            <section className="bg-secondary/50 border border-border rounded-lg p-8">
              <h2 className="text-2xl font-light mb-4">Our 2026 Goals</h2>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Carbon Neutral:</strong> Achieve net-zero carbon emissions across all operations.
                </p>
                <p>
                  <strong className="text-foreground">Waste Reduction:</strong> Reduce manufacturing waste by 50% through more efficient processes.
                </p>
                <p>
                  <strong className="text-foreground">Supply Chain Transparency:</strong> Publish full-transparency reports on all suppliers and facilities.
                </p>
                <p>
                  <strong className="text-foreground">Community Investment:</strong> Allocate 5% of profits to community development in our manufacturing regions.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SustainabilityPage;
