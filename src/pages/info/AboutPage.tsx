import PageLayout from "@/pages/PageLayout";

const AboutPage = () => {
  return (
    <PageLayout forceBlackNavbar={true}>
      <div className="pt-32 pb-24 px-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-light mb-4 tracking-tight">
            About Frakktur
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            Redefining street fashion through innovation, quality, and cultural authenticity.
          </p>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-light mb-4">Our Story</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Founded in 2020, Frakktur emerged from a vision to revolutionize urban fashion. We believed that street fashion shouldn't compromise on quality or sustainability. What started as a small collective of designers has evolved into a global movement.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, Frakktur stands for authenticity, craftsmanship, and a deep respect for the culture that inspired us. Every piece we create tells a story, and every customer becomes part of our journey.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To create high-quality, culturally inspired streetwear that empowers individuals to express their unique identity while maintaining ethical and sustainable practices throughout our supply chain.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light mb-4">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-normal mb-2">Authenticity</h3>
                  <p className="text-sm text-muted-foreground">
                    We stay true to our roots and the street culture that inspires our designs.
                  </p>
                </div>
                <div>
                  <h3 className="font-normal mb-2">Quality</h3>
                  <p className="text-sm text-muted-foreground">
                    Every piece is crafted with meticulous attention to detail and durability.
                  </p>
                </div>
                <div>
                  <h3 className="font-normal mb-2">Sustainability</h3>
                  <p className="text-sm text-muted-foreground">
                    We're committed to minimizing our environmental impact at every step.
                  </p>
                </div>
                <div>
                  <h3 className="font-normal mb-2">Community</h3>
                  <p className="text-sm text-muted-foreground">
                    Our customers aren't just buyers—they're collaborators in our movement.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-secondary/50 border border-border rounded-lg p-8">
              <h2 className="text-2xl font-light mb-4">Connect With Us</h2>
              <p className="text-muted-foreground mb-6">
                Have questions or want to collaborate? We'd love to hear from you.
              </p>
              <div className="space-y-3 text-sm">
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:hello@frakktur.com" className="hover:opacity-70 transition-opacity">
                    hello@frakktur.com
                  </a>
                </p>
                <p>
                  <strong>Instagram:</strong>{" "}
                  <a href="#" className="hover:opacity-70 transition-opacity">
                    @frakktur
                  </a>
                </p>
                <p>
                  <strong>Discord:</strong>{" "}
                  <a href="#" className="hover:opacity-70 transition-opacity">
                    Join our community
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AboutPage;
