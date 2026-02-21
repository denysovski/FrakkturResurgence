import { Globe, Shield, Headphones, ArrowRight, Camera } from "lucide-react";

import product1 from "@/assets/product-1.jpg";
import product4 from "@/assets/product-4.jpg";
import image1 from "@/assets/image1.png";
import image2 from "@/assets/image2.jpg";
import image3 from "@/assets/image3.png";

const trustBadges = [
  { icon: Globe, title: "Worldwide Delivery", desc: "Fast & tracked shipping to every country" },
  { icon: Headphones, title: "24/7 Support", desc: "We're always here for you" },
  { icon: Shield, title: "Secured Buying", desc: "Encrypted & safe checkout" },
];

const productGrid = [
  { image: image1, label: "Newcomers", isMain: true },
  { image: image2, label: null, comingSoon: true },
  { image: image3, label: null, comingSoon: false },
  { image: product4, label: null, comingSoon: true },
];

const communityImages = [
  { image: image1, user: "@streetking" },
  { image: image2, user: "@urbangirl" },
  { image: image3, user: "@nightrider" },
  { image: product1, user: "@darkstyle" },
];

export default function Sections() {
  return (
    <>
      {/* PRODUCT GRID - NEWCOMERS */}
      <section className="px-6 pt-10 md:px-10 md:pt-10 pb-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px]">
        {productGrid.map((item, i) => (
          <a key={i} href="#" className="group relative h-[240px] sm:h-[360px] md:h-[460px] overflow-hidden block">
            <img
              src={item.image}
              alt={item.label || "Product"}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-foreground/10 group-hover:bg-foreground/20 transition-colors duration-300" />

            {/* Main card: Newcomers overlay */}
            {item.isMain && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <h3 className="text-2xl md:text-3xl font-bold tracking-wide uppercase text-primary-foreground mb-4">
                  Newcomers
                </h3>
                <span className="btn-outline border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-foreground text-[10px]">
                  See all
                </span>
              </div>
            )}

            {/* Coming soon badge */}
            {item.comingSoon && (
              <span className="absolute top-3 left-3 bg-foreground text-background text-[9px] tracking-[0.15em] uppercase font-medium px-3 py-1">
                Coming Soon
              </span>
            )}
          </a>
        ))}
        </div>
      </section>

      {/* COMMUNITY HUB */}
      <section className="py-10 md:py-14 px-6 md:px-10 bg-background">
        <div className="mb-8">
          <h2 className="section-heading mb-2 text-left">Community hub</h2>
          <p className="text-sm text-muted-foreground text-left">
            Tag us at @distopion to get featured on our website!
          </p>
        </div>
        <div className="grid grid-cols-2 gap-[10px]">
          {communityImages.map((item, i) => (
            <a key={i} href="#" className="group relative aspect-[9/16] overflow-hidden block">
              <img
                src={item.image}
                alt={`Community ${item.user}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                  <Camera className="w-4 h-4 text-primary-foreground mx-auto mb-1" />
                  <p className="text-[10px] text-primary-foreground tracking-wider">{item.user}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* TRUST BADGES - bigger and below newcomers */}
      <section className="bg-foreground text-background py-10 md:py-14 px-6 md:px-10">
        <div className="grid md:grid-cols-3 gap-[10px]">
          {trustBadges.map((badge) => (
            <div key={badge.title} className="flex flex-col items-center text-center gap-3 py-8 px-6 border border-background/15">
              <badge.icon className="w-7 h-7 text-background/80" strokeWidth={1.5} />
              <h4 className="text-xs tracking-[0.15em] uppercase font-medium text-background">
                {badge.title}
              </h4>
              <p className="text-xs text-background/60 leading-relaxed max-w-xs">
                {badge.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* JOIN FRAKKTUR CLUB */}
      <section className="py-14 md:py-16 px-6 md:px-10 bg-secondary">
        <div className="max-w-3xl">
          <p className="micro-text text-muted-foreground mb-3">Members only</p>
          <h2 className="section-heading mb-3 text-left">Join Frakktur Club</h2>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed text-left">
            Register, earn points & rewards on all purchases. Redeem exclusive offers and discounts.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 mt-6 text-sm uppercase tracking-[0.12em] underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            Sign up
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-12 md:py-16 px-6 bg-foreground text-background">
        <div className="max-w-xl mx-auto text-center">
          <h3 className="section-heading text-xl md:text-2xl mb-2 text-background">Stay in the Loop</h3>
          <p className="text-sm text-background/50 mb-5">
            New drops, exclusive offers, and stories — straight to your inbox.
          </p>
          <form className="flex max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 border border-background/20 px-4 py-3 text-sm outline-none bg-transparent text-background placeholder:text-background/40 focus:border-background/50 transition-colors"
            />
            <button type="submit" className="bg-background text-foreground px-6 py-3 text-xs tracking-[0.15em] uppercase font-medium hover:opacity-80 transition-opacity">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-border bg-background">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <h3 className="text-lg font-bold tracking-[0.15em] uppercase">Frakktur</h3>
          <div className="flex gap-8">
            <a href="#" className="nav-link text-muted-foreground hover:text-foreground transition-colors">T-Shirts</a>
            <a href="#" className="nav-link text-muted-foreground hover:text-foreground transition-colors">Accessories</a>
            <a href="#" className="nav-link text-muted-foreground hover:text-foreground transition-colors">Hoodies</a>
          </div>
          <div className="flex gap-6">
            <a href="#" className="micro-text text-muted-foreground/60 hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="micro-text text-muted-foreground/60 hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="micro-text text-muted-foreground/60 hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
        <p className="text-center micro-text text-muted-foreground/40 mt-6">© 2026 Frakktur. All rights reserved.</p>
      </footer>
    </>
  );
}
