import { useState, useEffect, useRef } from "react";
import { Menu, Search, User, X, Heart, ShoppingCart, ChevronUp, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import logoInvert from "@/assets/frakktur-icon-invert.png";

const primaryMenuLinks = [
  { label: "T-shirts", href: "#" },
  { label: "Accessories", href: "#" },
  { label: "Hoodies", href: "#" },
  { label: "Caps", href: "#" },
  { label: "Hats", href: "#" },
  { label: "Belts", href: "#" },
  { label: "Shoes", href: "#" },
  { label: "Pants", href: "#" },
  { label: "Knitwear", href: "#" },
  { label: "Leather Jackets", href: "#" },
];

const secondaryMenuLinks = [
  { label: "Frakktur Club", href: "#" },
  { label: "About Us", href: "#" },
  { label: "Sustainability program", href: "#" },
];

const latestProducts = [
  { name: "Essential Tee", price: "€49.00", image: product1 },
  { name: "Stealth Cap", price: "€35.00", image: product2 },
  { name: "Graphic Hoodie", price: "€89.00", image: product3 },
  { name: "Crossbody Bag", price: "€65.00", image: product4 },
];

type CountryOption = { value: string; flag: string };

type NavbarProps = {
  countryOptions: CountryOption[];
  currencyOptions: string[];
  selectedCountry: string;
  selectedCurrency: string;
  onCountryChange: (country: string) => void;
  onCurrencyChange: (currency: string) => void;
};

export default function Navbar({
  countryOptions,
  currencyOptions,
  selectedCountry,
  selectedCurrency,
  onCountryChange,
  onCurrencyChange,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const countryMenuRef = useRef<HTMLDivElement | null>(null);
  const currencyMenuRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!menuOpen && menuVisible) {
      const timeout = setTimeout(() => setMenuVisible(false), 220);
      return () => clearTimeout(timeout);
    }
  }, [menuOpen, menuVisible]);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (countryMenuRef.current && !countryMenuRef.current.contains(target)) setCountryMenuOpen(false);
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(target)) setCurrencyMenuOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const openMenu = () => {
    setMenuVisible(true);
    requestAnimationFrame(() => setMenuOpen(true));
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const dropdownOpen = countryMenuOpen || currencyMenuOpen;
  const navHasBackground = scrolled || dropdownOpen;
  const navItemColor = navHasBackground ? "text-foreground" : "text-primary-foreground";

  const selectedCountryOption = countryOptions.find((country) => country.value === selectedCountry) || countryOptions[0];

  const toggleCountryMenu = () => {
    setCurrencyMenuOpen(false);
    setCountryMenuOpen((prev) => !prev);
  };

  const toggleCurrencyMenu = () => {
    setCountryMenuOpen(false);
    setCurrencyMenuOpen((prev) => !prev);
  };

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          visible ? "top-0" : "-top-20"
        } ${navHasBackground ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-transparent"}`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={openMenu}
            className={`p-1 transition-transform duration-200 hover:scale-110 ${navItemColor}`}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <img
              src={logoInvert}
              alt="Frakktur"
              className={`h-8 md:h-9 w-auto transition-all duration-300 ${navHasBackground ? "invert" : ""}`}
            />
          </Link>

          <div className={`flex items-center gap-4 ${navItemColor}`}>
            <div ref={countryMenuRef} className="relative hidden sm:flex items-center gap-2">
              <button
                onClick={toggleCountryMenu}
                className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                aria-label="Open countries menu"
              >
                <img src={selectedCountryOption.flag} alt={selectedCountryOption.value} className="h-5 w-7 object-cover rounded-sm" />
                {countryMenuOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <div
                className={`absolute top-full right-0 mt-3 w-60 bg-background text-foreground border border-border shadow-sm z-[70] transition-all duration-200 origin-top-right ${
                  countryMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
                }`}
              >
                  {countryOptions.map((country) => (
                    <button
                      key={country.value}
                      onClick={() => {
                        onCountryChange(country.value);
                        setCountryMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary transition-colors text-xs tracking-[0.08em]"
                    >
                      <span className="flex items-center gap-2">
                        <img src={country.flag} alt={country.value} className="h-4 w-6 object-cover rounded-sm" />
                        {country.value}
                      </span>
                      {selectedCountry === country.value && <span>✓</span>}
                    </button>
                  ))}
              </div>
            </div>

            <div ref={currencyMenuRef} className="relative hidden sm:flex items-center gap-2">
              <button
                onClick={toggleCurrencyMenu}
                className="flex items-center gap-1 text-sm hover:opacity-70 transition-opacity"
                aria-label="Open currencies menu"
              >
                <span>{selectedCurrency}</span>
                {currencyMenuOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <div
                className={`absolute top-full right-0 mt-3 w-44 bg-background text-foreground border border-border shadow-sm z-[70] transition-all duration-200 origin-top-right ${
                  currencyMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
                }`}
              >
                  {currencyOptions.map((currency, index) => (
                    <button
                      key={`${currency}-${index}`}
                      onClick={() => {
                        onCurrencyChange(currency);
                        setCurrencyMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary transition-colors text-xs tracking-[0.08em]"
                    >
                      <span>{currency}</span>
                      {selectedCurrency === currency && <span>✓</span>}
                    </button>
                  ))}
              </div>
            </div>

            <button
              onClick={() => setSearchOpen(true)}
              className="p-1 transition-transform duration-200 hover:scale-110"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <a href="#" className="hidden md:block p-1 transition-transform duration-200 hover:scale-110" aria-label="Login">
              <User className="w-5 h-5" />
            </a>

            <a href="#" className="p-1 transition-transform duration-200 hover:scale-110" aria-label="Shopping cart">
              <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </header>

      {menuVisible && (
        <div className="fixed inset-0 z-[60]" onClick={closeMenu}>
          <div
            className={`absolute inset-0 bg-foreground/30 backdrop-blur-sm transition-opacity duration-200 ${
              menuOpen ? "opacity-100" : "opacity-0"
            }`}
          />
          <nav
            className={`absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background flex flex-col transition-transform duration-200 ease-out ${
              menuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <span className="text-xs tracking-[0.15em] uppercase font-medium">Menu</span>
              <button onClick={closeMenu} aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col px-6 py-8 gap-4">
              {primaryMenuLinks.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  style={{ transitionDelay: `${index * 40}ms` }}
                  className={`text-sm tracking-normal normal-case font-normal hover:opacity-60 transition-all duration-200 ${
                    menuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mt-auto px-6 py-6 border-t border-border flex flex-col gap-3">
              {secondaryMenuLinks.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  style={{ transitionDelay: `${(primaryMenuLinks.length + index) * 40}ms` }}
                  className={`text-xs tracking-normal normal-case text-muted-foreground hover:text-foreground transition-all duration-200 ${
                    menuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>
        </div>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setSearchOpen(false)}>
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
          <aside
            className="absolute right-0 top-0 bottom-0 w-96 max-w-[90vw] bg-background animate-slide-in-right flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <span className="text-xs tracking-[0.15em] uppercase font-medium">Search</span>
              <button onClick={() => setSearchOpen(false)} aria-label="Close search">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
            </div>
            <div className="px-6 py-3 border-b border-border">
              <button className="nav-link flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Heart className="w-4 h-4" /> Favourites
              </button>
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
