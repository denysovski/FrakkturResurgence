import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import image1 from "@/assets/landing1.png";
import image2 from "@/assets/landing2.jpg";
import image3 from "@/assets/landing3.jpg";

const slides = [
  {
    image: image1,
    title: "New Collection",
    subtitle: "Redefine your wardrobe",
    desc: "Premium streetwear crafted for those who dare to stand out.",
    cta: "Shop Now",
    season: "Spring / Summer 2026",
  },
  {
    image: image2,
    title: "Graphic Tees",
    subtitle: "Bold statements, premium quality",
    desc: "Each piece tells a story — hand-finished, limited edition prints.",
    cta: "Explore",
    season: "Limited Edition",
  },
  {
    image: image3,
    title: "Street Culture",
    subtitle: "Born from the underground",
    desc: "Where art meets fashion. Designed for the fearless.",
    cta: "Discover",
    season: "Signature Series",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [textKey, setTextKey] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
    setTextKey((k) => k + 1);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    setTextKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next]);

  useEffect(() => {
    let rafId = 0;

    const onScroll = () => {
      if (rafId) {
        return;
      }

      rafId = window.requestAnimationFrame(() => {
        const progress = Math.min(Math.max(window.scrollY / Math.max(window.innerHeight, 1), 0), 1);
        setScrollProgress(progress);
        rafId = 0;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const overlayOpacity = 0.15 + scrollProgress * 0.35;

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 fade-crossfade"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={slide.image}
            alt={`${slide.title} - Frakktur luxury streetwear collection`}
            className="w-full h-full object-cover transition-transform duration-300 ease-out"
            style={{
              transform: `scale(${(i === current ? 1.1 : 1) + scrollProgress * 0.08})`,
            }}
          />
        </div>
      ))}

      <div className="overlay-dark" />
      <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: overlayOpacity }} />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/85 to-transparent z-[1]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent z-[1]" />

      {/* Season tag top-left */}
      <div className="absolute top-24 left-6 md:left-16 z-10">
        <p className="micro-text text-primary-foreground/50">{slides[current].season}</p>
      </div>

      {/* Text overlay - bottom left */}
      <div key={textKey} className="absolute bottom-16 md:bottom-24 left-6 md:left-16 z-10 max-w-lg animate-fade-in-up">
        <p className="micro-text text-primary-foreground/60 mb-3">
          {slides[current].subtitle}
        </p>
        <h2 className="text-4xl md:text-6xl font-display font-semibold tracking-wide text-primary-foreground mb-3">
          {slides[current].title}
        </h2>
        <p className="accent-text text-primary-foreground/70 mb-6 transition-all duration-700">
          {slides[current].desc}
        </p>
        <a href="#" className="btn-outline border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-foreground inline-block">
          {slides[current].cta}
        </a>
      </div>

      {/* Slide counter bottom-right */}
      <div className="absolute bottom-16 md:bottom-24 right-6 md:right-16 z-10 flex flex-col items-end gap-4">
        <p className="text-xs font-body text-primary-foreground/40 tracking-widest">
          {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </p>
        <div className="flex gap-3">
          <button onClick={prev} className="w-10 h-10 border border-primary-foreground/40 flex items-center justify-center text-primary-foreground/70 hover:text-primary-foreground hover:border-primary-foreground transition-all duration-300" aria-label="Previous slide">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={next} className="w-10 h-10 border border-primary-foreground/40 flex items-center justify-center text-primary-foreground/70 hover:text-primary-foreground hover:border-primary-foreground transition-all duration-300" aria-label="Next slide">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setTextKey((k) => k + 1); }}
            className={`h-[2px] transition-all duration-500 ${i === current ? "w-8 bg-primary-foreground" : "w-4 bg-primary-foreground/40"}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
