import { useState } from "react";
import { Globe, Shield, Headphones, ArrowRight, Camera, Facebook, Instagram, Music2, Send } from "lucide-react";
import LocaleDropdown from "./LocaleDropdown";
import { Link } from "react-router-dom";
import RevealOnScroll from "./RevealOnScroll";

import image1 from "@/assets/image1.jpg";
import image2 from "@/assets/image2.jpg";
import image3 from "@/assets/image3.jpg";
import image4 from "@/assets/image4.jpg";
import image5 from "@/assets/image5.jpg";
import image6 from "@/assets/image6.jpg";
import image7 from "@/assets/image7.jpg";
import image8 from "@/assets/image8.jpg";
import tee1 from "@/assets/collections/tshirts/tee1.jpg";
import tee2 from "@/assets/collections/tshirts/tee2.jpg";
import tee3 from "@/assets/collections/tshirts/tee3.jpg";
import tee4 from "@/assets/collections/tshirts/tee4.jpg";
import tee5 from "@/assets/collections/tshirts/tee5.jpg";
import tee6 from "@/assets/collections/tshirts/tee6.jpg";
import tee7 from "@/assets/collections/tshirts/tee7.jpg";

const trustBadges = [
  { icon: Globe, title: "Worldwide Delivery", desc: "Fast & tracked shipping to every country" },
  { icon: Headphones, title: "24/7 Support", desc: "We're always here for you" },
  { icon: Shield, title: "Secured Buying", desc: "Encrypted & safe checkout" },
];

const productGrid = [
  { image: tee1, label: "Newcomers", isMain: true, href: "/collections/tshirts" },
  {
    image: tee2,
    hoverImage: tee5,
    label: null,
    comingSoon: true,
    swatches: ["bg-violet-700", "bg-black"],
    href: "/collections/tshirts",
  },
  {
    image: tee3,
    hoverImage: tee6,
    label: null,
    comingSoon: false,
    swatches: ["bg-zinc-800", "bg-neutral-200 border border-border"],
    href: "/collections/tshirts",
  },
  {
    image: tee4,
    hoverImage: tee7,
    label: null,
    comingSoon: true,
    swatches: ["bg-indigo-600", "bg-black"],
    href: "/collections/tshirts",
  },
];

const communityImages = [
  { image: image1, user: "@streetking", flag: "🇺🇸", piece: "Shadowline Utility Tee" },
  { image: image2, user: "@urbangirl", flag: "🇬🇧", piece: "Concrete Pulse Tee" },
  { image: image3, user: "@nightrider", flag: "🇯🇵", piece: "Midnight Flux Tee" },
  { image: image4, user: "@darkstyle", flag: "🇩🇪", piece: "Riptide Outbound Tee" },
  { image: image5, user: "@distopion", flag: "🇫🇷", piece: "Noir District Tee" },
  { image: image6, user: "@citycore", flag: "🇮🇹", piece: "Monza Street Tee" },
  { image: image7, user: "@streetfocus", flag: "🇳🇱", piece: "Static Drift Tee" },
  { image: image8, user: "@nightline", flag: "🇪🇸", piece: "Night Code Tee" },
];

const footerColumns = [
  {
    title: "Help and Contact",
    links: ["Distopion Club", "My Account", "Track Order", "Get Help Now", "Shipping & Delivery", "Make a Return"],
  },
  {
    title: "Company",
    links: ["About us", "Reviews", "Climate program", "Terms of service", "Shipping policy", "Refund policy", "Privacy policy"],
  },
  {
    title: "Social",
    links: ["Facebook", "Instagram", "Tiktok"],
  },
  {
    title: "Shop Collections",
    links: ["T-shirts", "Hoodies", "Caps"],
  },
];

type CountryOption = { value: string; flag: string };

type SectionsProps = {
  countryOptions: CountryOption[];
  currencyOptions: string[];
  selectedCountry: string;
  selectedCurrency: string;
  onCountryChange: (country: string) => void;
  onCurrencyChange: (currency: string) => void;
};

export default function Sections({
  countryOptions,
  currencyOptions,
  selectedCountry,
  selectedCurrency,
  onCountryChange,
  onCurrencyChange,
}: SectionsProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<number, 0 | 1>>({
    1: 0,
    2: 0,
    3: 0,
  });

  return (
    <>
      {/* PRODUCT GRID - NEWCOMERS */}
      <RevealOnScroll>
      <section className="px-6 pt-10 md:px-10 md:pt-10 pb-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[5px]">
        {productGrid.map((item, i) => (
          <Link key={i} to={item.href || "#"} className="group relative h-[240px] sm:h-[360px] md:h-[460px] overflow-hidden block">
            <img
              src={item.hoverImage && selectedVariants[i] === 1 ? item.hoverImage : item.image}
              alt={item.label || "Product"}
              className={`w-full h-full object-cover transition-opacity duration-400 ${item.isMain ? "brightness-60" : "brightness-100"} ${item.hoverImage ? "group-hover:opacity-0" : ""}`}
              loading="lazy"
            />
            {item.hoverImage && (
              <img
                src={selectedVariants[i] === 1 ? item.image : item.hoverImage}
                alt="Alternate product view"
                className="absolute inset-0 w-full h-full object-cover brightness-100 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-foreground/10 group-hover:bg-foreground/20 transition-colors duration-300" />

            {/* Main card: Newcomers overlay */}
            {item.isMain && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <h3 className="text-2xl md:text-3xl font-bold tracking-normal normal-case text-primary-foreground mb-4">
                  Newcomers
                </h3>
                <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.12em] underline underline-offset-4 hover:opacity-70 transition-opacity text-primary-foreground">
                  See all
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            )}

            {/* Coming soon badge */}
            {item.comingSoon && (
              <span className="absolute top-3 left-3 bg-background text-foreground text-[9px] tracking-[0.15em] uppercase font-medium px-3 py-1 rounded-[10px]">
                Coming Soon
              </span>
            )}

            {item.swatches && (
              <div className="absolute bottom-3 right-3 flex items-center">
                <button
                  type="button"
                  aria-label="Select first color"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedVariants((prev) => ({ ...prev, [i]: 0 }));
                  }}
                  className={`relative z-10 w-5 h-5 rounded-full ${item.swatches[0]} ring-1 ring-background/70 ${
                    selectedVariants[i] === 0 ? "scale-110" : "opacity-90"
                  } transition-all`}
                />
                <button
                  type="button"
                  aria-label="Select second color"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedVariants((prev) => ({ ...prev, [i]: 1 }));
                  }}
                  className={`-ml-2 w-5 h-5 rounded-full ${item.swatches[1]} ring-1 ring-background/70 ${
                    selectedVariants[i] === 1 ? "scale-110 z-20" : "opacity-90"
                  } transition-all`}
                />
              </div>
            )}
          </Link>
        ))}
        </div>
      </section>
      </RevealOnScroll>

      {/* COMMUNITY HUB */}
      <RevealOnScroll delayMs={80}>
      <section className="py-10 md:py-14 px-6 md:px-10 bg-background">
        <div className="mb-8">
          <h2 className="section-heading normal-case tracking-normal mb-2 text-left">Community hub</h2>
          <p className="text-sm text-muted-foreground text-left">
            Tag us at @distopion to get featured on our website!
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px]">
          {communityImages.map((item, i) => (
            <a key={i} href="#" className="group relative aspect-[9/16] overflow-hidden block">
              <img
                src={item.image}
                alt={`Community ${item.user}`}
                className="w-full h-full object-cover brightness-75 transition-transform duration-500 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-colors duration-300">
                <div className="absolute bottom-3 left-3 right-3 text-primary-foreground">
                  <div className="flex items-center gap-1 mb-1">
                    <Camera className="w-3 h-3" />
                    <p className="text-[10px] tracking-wider">{item.flag} {item.user}</p>
                  </div>
                  <p className="text-[11px] leading-snug">{item.piece}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
      </RevealOnScroll>

      {/* TRUST BADGES - bigger and below newcomers */}
      <RevealOnScroll delayMs={120}>
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
      </RevealOnScroll>

      {/* JOIN FRAKKTUR CLUB */}
      <RevealOnScroll delayMs={160}>
      <section className="py-14 md:py-16 px-6 md:px-10 bg-secondary">
        <div className="max-w-3xl">
          <p className="micro-text text-muted-foreground mb-3">Members only</p>
          <h2 className="section-heading normal-case tracking-normal mb-3 text-left">Join Frakktur Club</h2>
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
      </RevealOnScroll>

      {/* FOOTER */}
      <RevealOnScroll delayMs={200}>
      <footer className="pt-10 pb-4 px-6 md:px-10 border-t border-border bg-secondary/50">
        <div className="pb-8 border-b border-border mb-8">
          <p className="text-xs text-muted-foreground mb-3">Newsletter</p>
          <form className="max-w-md" onSubmit={(e) => e.preventDefault()}>
            <label className="relative block">
              <input
                type="email"
                placeholder="E-mail address"
                className="w-full border border-border bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:border-foreground/40 transition-colors rounded-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Submit email">
                <Send className="w-4 h-4" />
              </button>
            </label>
          </form>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-16">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="text-sm font-medium mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <LocaleDropdown
              type="country"
              options={countryOptions}
              selected={selectedCountry}
              onChange={onCountryChange}
              position="top"
            />
            <LocaleDropdown
              type="currency"
              options={currencyOptions}
              selected={selectedCurrency}
              onChange={onCurrencyChange}
              position="top"
            />
          </div>

          <div className="flex items-center gap-5 ml-auto">
            <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-foreground transition-colors"><Facebook className="w-4 h-4" /></a>
            <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-foreground transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href="#" aria-label="TikTok" className="text-muted-foreground hover:text-foreground transition-colors"><Music2 className="w-4 h-4" /></a>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 Frakktur. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">Cookies</a>
          </div>
        </div>
      </footer>
      </RevealOnScroll>
    </>
  );
}
