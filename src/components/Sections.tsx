import { Globe, Shield, Headphones, ArrowRight, Instagram, Camera } from "lucide-react";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const trustBadges = [
  { icon: Globe, title: "Worldwide Delivery", desc: "Fast & tracked shipping to every country" },
  { icon: Headphones, title: "24/7 Support", desc: "We're always here for you" },
  { icon: Shield, title: "Secured Buying", desc: "Encrypted & safe checkout" },
];

const productGrid = [
  { image: product1, label: "Newcomers", isMain: true },
  { image: product2, label: null, comingSoon: true },
  { image: product3, label: null, comingSoon: false },
  { image: product4, label: null, comingSoon: true },
];

const communityImages = [
  { image: hero1, user: "@streetking" },
  { image: hero2, user: "@urbangirl" },
  { image: hero3, user: "@nightrider" },
  { image: product1, user: "@darkstyle" },
  { image: product3, user: "@hoodie.life" },
  { image: product2, user: "@capgame" },
];

export default function Sections() {
  return (
    <>
      {/* TRUST BADGES - full width black */}
      <section className="bg-foreground text-background">
        <div className="grid grid-cols-3 divide-x divide-background/10">
          {trustBadges.map((badge) => (
            <div key={badge.title} className="flex flex-col items-center text-center gap-2 py-8 px-4">
              <badge.icon className="w-5 h-5 text-background/70" strokeWidth={1.5} />
              <h4 className="text-[11px] tracking-[0.15em] uppercase font-medium text-background">
                {badge.title}
              </h4>
              <p className="text-[10px] text-background/50 leading-relaxed hidden md:block">
                {badge.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT GRID - 4 images edge to edge */}
      <section className="grid grid-cols-2 md:grid-cols-4">
        {productGrid.map((item, i) => (
          <a key={i} href="#" className="group relative aspect-[3/4] overflow-hidden block">
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
      </section>

      {/* JOIN THE CLUB */}
      <section className="py-16 md:py-20 px-6 bg-secondary">
        <div className="max-w-2xl mx-auto text-center">
          <p className="micro-text text-muted-foreground mb-3">Members only</p>
          <h2 className="section-heading mb-3">Join Frakktur Club</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Register to unlock exclusive rewards, early access to drops, members-only discounts, and birthday perks.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <a href="#" className="btn-gold inline-block text-center">Create Account</a>
            <a href="#" className="btn-outline inline-block text-center">Learn More</a>
          </div>
        </div>
      </section>

      {/* COMMUNITY HALL */}
      <section className="py-16 md:py-20 px-6 bg-background">
        <div className="text-center mb-8">
          <p className="micro-text text-muted-foreground mb-2">
            <Instagram className="w-3 h-3 inline mr-1" /> Tag us @frakktur
          </p>
          <h2 className="section-heading mb-2">Community Hall</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Our community wears it best. Share your look and get featured here.
          </p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
          {communityImages.map((item, i) => (
            <a key={i} href="#" className="group relative aspect-square overflow-hidden block">
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
