import { useState, useEffect, useRef } from "react";
import { Menu, Search, User, X, Heart } from "lucide-react";
import { Link } from "react-router-dom";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import logoInvert from "@/assets/frakktur-icon-invert.png";

const menuLinks = [
  { label: "T-Shirts", href: "#" },
  { label: "Accessories", href: "#" },
  { label: "Hoodies", href: "#" },
];

const latestProducts = [
  { name: "Essential Tee", price: "€49.00", image: product1 },
  { name: "Stealth Cap", price: "€35.00", image: product2 },
  { name: "Graphic Hoodie", price: "€89.00", image: product3 },
  { name: "Crossbody Bag", price: "€65.00", image: product4 },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      setVisible(y < 50 || y < lastScrollY.current);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          visible ? "top-0" : "-top-20"
        } ${scrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-transparent"}`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={() => setMenuOpen(true)} className="p-1 transition-transform duration-200 hover:scale-110" aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <img
              src={logoInvert}
              alt="Frakktur"
              className={`h-8 md:h-9 w-auto transition-all duration-300 ${scrolled ? "invert" : ""}`}
            />
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(true)} className="p-1 transition-transform duration-200 hover:scale-110" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>
            <a href="#" className="p-1 transition-transform duration-200 hover:scale-110 hidden md:block" aria-label="Login">
              <User className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* LEFT MENU */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
          <nav className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background animate-slide-in-left flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <span className="text-xs tracking-[0.15em] uppercase font-medium">Menu</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col px-6 py-8 gap-6">
              {menuLinks.map((link) => (
                <a key={link.label} href={link.href} className="text-2xl tracking-[0.1em] uppercase font-light hover:opacity-60 transition-opacity duration-300">{link.label}</a>
              ))}
            </div>
            <div className="mt-auto px-6 py-8 border-t border-border flex flex-col gap-4">
              <a href="#" className="nav-link flex items-center gap-3"><User className="w-4 h-4" /> Login / Register</a>
            </div>
          </nav>
        </div>
      )}

      {/* RIGHT SEARCH */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setSearchOpen(false)}>
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
          <aside className="absolute right-0 top-0 bottom-0 w-96 max-w-[90vw] bg-background animate-slide-in-right flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <span className="text-xs tracking-[0.15em] uppercase font-medium">Search</span>
              <button onClick={() => setSearchOpen(false)} aria-label="Close search"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search products..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" autoFocus />
              </div>
            </div>
            <div className="px-6 py-3 border-b border-border">
              <button className="nav-link flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"><Heart className="w-4 h-4" /> Favourites</button>
            </div>
            <div className="px-6 py-4 flex-1 overflow-y-auto">
              <p className="micro-text text-muted-foreground mb-4">Latest Products</p>
              <div className="grid grid-cols-2 gap-3">
                {latestProducts.map((p) => (
                  <a key={p.name} href="#" className="group">
                    <div className="aspect-square overflow-hidden bg-secondary mb-2">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <p className="text-xs">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.price}</p>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
