import { useNavigate, Link } from "react-router-dom";
import { Facebook, Instagram, Music2, Send } from "lucide-react";
import LocaleDropdown from "@/components/LocaleDropdown";
import { getStoredUser } from "@/lib/auth";

interface CountryOption {
  value: string;
  flag: string;
}

interface FooterProps {
  countryOptions: CountryOption[];
  currencyOptions: string[];
  selectedCountry: string;
  selectedCurrency: string;
  onCountryChange: (country: string) => void;
  onCurrencyChange: (currency: string) => void;
}

const Footer = ({
  countryOptions,
  currencyOptions,
  selectedCountry,
  selectedCurrency,
  onCountryChange,
  onCurrencyChange,
}: FooterProps) => {
  const navigate = useNavigate();
  const handleMyOrdersClick = () => {
    const user = getStoredUser();
    if (!user) {
      navigate("/auth/login");
      return;
    }

    navigate("/orders");
  };

  const footerColumns = [
    {
      title: "Help and Contact",
      links: [
        { label: "Distopion Club", href: "/club" },
        { label: "My orders", action: handleMyOrdersClick },
        { label: "Shipping & Delivery", href: "/sustainability" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About us", href: "/about" },
        { label: "Terms of service", href: "/terms-of-service" },
        { label: "Shipping policy", href: "/shipping-policy" },
        { label: "Refund policy", href: "/refund-policy" },
        { label: "Privacy policy", href: "/privacy-policy" },
      ],
    },
    {
      title: "Social",
      links: [
        { label: "Facebook", href: "https://facebook.com/frakktur" },
        { label: "Instagram", href: "https://instagram.com/frakktur" },
        { label: "Tiktok", href: "https://tiktok.com/@frakktur" },
      ],
    },
    {
      title: "Shop Collections",
      links: [
        { label: "T-shirts", href: "/collections/tshirts" },
        { label: "Hoodies", href: "/collections/hoodies" },
        { label: "Caps", href: "/collections/caps" },
      ],
    },
  ];

  return (
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
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Submit email"
            >
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
                <li key={link.label}>
                  {link.action ? (
                    <button
                      type="button"
                      onClick={link.action}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </button>
                  ) : link.href?.startsWith("http") ? (
                    <a href={link.href} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  )}
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
            align="left"
          />
          <LocaleDropdown
            type="currency"
            options={currencyOptions}
            selected={selectedCurrency}
            onChange={onCurrencyChange}
            position="top"
            align="left"
          />
        </div>

        <div className="flex items-center gap-5 ml-auto">
          <a
            href="https://facebook.com/frakktur"
            aria-label="Facebook"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Facebook className="w-4 h-4" />
          </a>
          <a
            href="https://instagram.com/frakktur"
            aria-label="Instagram"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a
            href="https://tiktok.com/@frakktur"
            aria-label="TikTok"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Music2 className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          © 2026 Frakktur. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/terms-of-service" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
          <Link to="/privacy-policy" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
          <Link to="/refund-policy" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">Cookies</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
