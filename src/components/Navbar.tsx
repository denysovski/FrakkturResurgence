import { useState, useEffect, useRef } from "react";
import { Menu, Search, User, X, Heart, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LocaleDropdown from "./LocaleDropdown";
import CartSidebar from "./CartSidebar";
import { readCart, type CartItem } from "@/lib/cart";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import logoInvert from "@/assets/frakktur-icon-invert.png";

const primaryMenuLinks = [
  { label: "T-shirts", href: "/collections/tshirts" },
  { label: "Hoodies", href: "/collections/hoodies" },
  { label: "Caps", href: "/collections/caps" },
  { label: "Belts", href: "/collections/belts" },
  { label: "Pants", href: "/collections/pants" },
  { label: "Knitwear", href: "/collections/knitwear" },
  { label: "Leather Jackets", href: "/collections/leather-jackets" },
];

const secondaryMenuLinks = [
  { label: "Login / Register", href: "/auth/login?mode=signup" },
  { label: "Frakktur Club", href: "/club" },
  { label: "About Us", href: "/about" },
  { label: "Sustainability program", href: "/sustainability" },
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
  forceBlackText?: boolean; // Force black text links on collection pages
};

export default function Navbar({
  countryOptions,
  currencyOptions,
  selectedCountry,
  selectedCurrency,
  onCountryChange,
  onCurrencyChange,
  forceBlackText = false,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readCart());
  const lastScrollY = useRef(0);
  const navigate = useNavigate();

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
    const syncCart = () => setCartItems(readCart());
    const onCartUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<CartItem[]>;
      if (Array.isArray(customEvent.detail)) {
        setCartItems(customEvent.detail);
        return;
      }
      syncCart();
    };

    window.addEventListener("frakktur:cart-updated", onCartUpdated as EventListener);
    window.addEventListener("focus", syncCart);

    return () => {
      window.removeEventListener("frakktur:cart-updated", onCartUpdated as EventListener);
      window.removeEventListener("focus", syncCart);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen && menuVisible) {
      const timeout = setTimeout(() => setMenuVisible(false), 220);
      return () => clearTimeout(timeout);
    }
  }, [menuOpen, menuVisible]);

  useEffect(() => {
    if (!searchOpen && searchVisible) {
      const timeout = setTimeout(() => setSearchVisible(false), 260);
      return () => clearTimeout(timeout);
    }
  }, [searchOpen, searchVisible]);

  const openMenu = () => {
    setMenuVisible(true);
    requestAnimationFrame(() => setMenuOpen(true));
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const openSearch = () => {
    setSearchVisible(true);
    requestAnimationFrame(() => setSearchOpen(true));
  };

  const closeSearch = () => {
    setSearchOpen(false);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    closeSearch();
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const navHasBackground = scrolled || dropdownOpen;
  const navItemColor = forceBlackText ? "text-foreground" : (navHasBackground ? "text-foreground" : "text-primary-foreground");
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          visible ? "top-0" : "-top-20"
        } ${forceBlackText || navHasBackground ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-transparent"}`}
        style={{ overflow: "visible" }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ overflow: "visible" }}>
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
              className={`h-8 md:h-9 w-auto transition-all duration-300 ${forceBlackText || navHasBackground ? "invert" : ""}`}
            />
          </Link>

          <div className={`flex items-center gap-4 ${navItemColor}`}>
            <div className="relative hidden sm:flex items-center gap-2">
              <LocaleDropdown
                type="country"
                options={countryOptions}
                selected={selectedCountry}
                onChange={onCountryChange}
                onOpenChange={setDropdownOpen}
              />
            </div>

            <div className="relative hidden sm:flex items-center gap-2">
              <LocaleDropdown
                type="currency"
                options={currencyOptions}
                selected={selectedCurrency}
                onChange={onCurrencyChange}
                onOpenChange={setDropdownOpen}
              />
            </div>

            <button
              onClick={openSearch}
              className="p-1 transition-transform duration-200 hover:scale-110"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link to="/auth/login?mode=signup" className="hidden md:block p-1 transition-transform duration-200 hover:scale-110" aria-label="Login">
              <User className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="relative p-1 transition-transform duration-200 hover:scale-110"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-foreground text-background text-[10px] leading-[18px] text-center font-medium">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </button>
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
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={closeMenu}
                  style={{ transitionDelay: `${index * 40}ms` }}
                  className={`text-sm tracking-normal normal-case font-normal hover:opacity-60 transition-all duration-200 ${
                    menuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-auto px-6 py-6 border-t border-border flex flex-col gap-3">
              {secondaryMenuLinks.map((link, index) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={closeMenu}
                  style={{ transitionDelay: `${(primaryMenuLinks.length + index) * 40}ms` }}
                  className={`text-xs tracking-normal normal-case text-muted-foreground hover:text-foreground transition-all duration-200 ${
                    menuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}

      {searchVisible && (
        <div className="fixed inset-0 z-[60]" onClick={closeSearch}>
          <div
            className={`absolute inset-0 bg-foreground/30 backdrop-blur-sm transition-opacity duration-300 ${
              searchOpen ? "opacity-100" : "opacity-0"
            }`}
          />
          <aside
            className={`absolute right-0 top-0 bottom-0 w-96 max-w-[90vw] bg-background flex flex-col transition-transform duration-300 ease-out ${
              searchOpen ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <span className="text-xs tracking-[0.15em] uppercase font-medium">Search</span>
              <button onClick={closeSearch} aria-label="Close search">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 border-b border-border">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products or categories"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  autoFocus
                />
              </form>
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

      <CartSidebar open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
