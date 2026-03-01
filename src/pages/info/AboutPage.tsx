import PageLayout from "@/pages/PageLayout";
import SEO from "@/components/SEO";
import image1 from "@/assets/image1.jpg";
import image2 from "@/assets/image2.jpg";
import image3 from "@/assets/image3.jpg";
import image4 from "@/assets/image4.jpg";

const AboutPage = () => {
  return (
    <PageLayout forceBlackNavbar={true}>
      <SEO
        title="About Frakktur"
        description="Learn about Frakktur's story and mission. We're redefining street fashion through innovation, quality, and cultural authenticity. Discover our commitment to sustainable luxury streetwear."
        canonicalUrl="https://frakktur.com/about"
      />
      <div className="pt-32 pb-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Our Identity</p>
          <h1 className="text-4xl md:text-5xl font-light mb-4 tracking-tight">
            About Frakktur
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-3xl">
            Redefining street fashion through innovation, quality, and cultural authenticity.
          </p>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="md:col-span-2 aspect-[16/9] bg-secondary overflow-hidden rounded-sm">
              <img src={image1} alt="Frakktur design studio" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="aspect-[4/5] bg-secondary overflow-hidden rounded-sm">
              <img src={image2} alt="Frakktur detail craftsmanship" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
            <section className="lg:col-span-2">
              <h2 className="text-2xl font-light mb-4">Our Story</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Founded in 2020, Frakktur started as a small independent collective focused on one idea: premium streetwear should not sacrifice responsibility, construction, or identity. We began by developing limited runs and testing every piece in daily wear conditions before release.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today we operate as a design-led label with a clear direction. We keep silhouettes clean, details purposeful, and collections tightly curated. Every release is built around longevity, not short cycles.
              </p>
            </section>
            <aside className="border border-border rounded-sm p-6 bg-secondary/30">
              <h3 className="text-sm uppercase tracking-[0.12em] mb-4">At A Glance</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><span className="text-foreground">Founded:</span> 2020</li>
                <li><span className="text-foreground">Focus:</span> Luxury streetwear essentials</li>
                <li><span className="text-foreground">Approach:</span> Small-run production model</li>
                <li><span className="text-foreground">Values:</span> Quality, culture, accountability</li>
              </ul>
            </aside>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="border border-border rounded-sm p-6">
              <h2 className="text-2xl font-light mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To create high-quality, culturally inspired streetwear that empowers self-expression while maintaining responsible sourcing, transparent standards, and consistent product performance.
              </p>
            </div>
            <div className="border border-border rounded-sm p-6">
              <h2 className="text-2xl font-light mb-4">Design Principles</h2>
              <p className="text-muted-foreground leading-relaxed">
                We prioritize proportion, material integrity, and utility. Our garments are designed to layer easily, wear comfortably, and remain relevant beyond seasonal trends.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-light mb-5">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-border rounded-sm p-5">
                <h3 className="font-normal mb-2">Authenticity</h3>
                <p className="text-sm text-muted-foreground">We stay close to the culture that shaped us and avoid manufactured narratives.</p>
              </div>
              <div className="border border-border rounded-sm p-5">
                <h3 className="font-normal mb-2">Quality</h3>
                <p className="text-sm text-muted-foreground">Every product is reviewed for fit, durability, and finishing before release.</p>
              </div>
              <div className="border border-border rounded-sm p-5">
                <h3 className="font-normal mb-2">Sustainability</h3>
                <p className="text-sm text-muted-foreground">We reduce waste with focused collections, recycled packaging, and tighter inventory planning.</p>
              </div>
              <div className="border border-border rounded-sm p-5">
                <h3 className="font-normal mb-2">Community</h3>
                <p className="text-sm text-muted-foreground">Our audience helps shape direction through feedback, wear-testing, and real use.</p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            <div className="aspect-[5/4] bg-secondary overflow-hidden rounded-sm">
              <img src={image3} alt="Frakktur team and process" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="aspect-[5/4] bg-secondary overflow-hidden rounded-sm">
              <img src={image4} alt="Frakktur campaign visual" className="w-full h-full object-cover" loading="lazy" />
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
    </PageLayout>
  );
};

export default AboutPage;
