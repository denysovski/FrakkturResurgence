import Navbar from "@/components/Navbar";
import Sections from "@/components/Sections";
import Footer from "@/components/Footer";
import { useCurrency } from "@/lib/currencyContext";
import { useI18n } from "@/lib/i18nContext";
import type { Language } from "@/lib/i18n";

const countryOptions = [
  { value: "GREAT BRITAIN", flag: "https://flagcdn.com/w40/gb.png" },
  { value: "UNITED STATES", flag: "https://flagcdn.com/w40/us.png" },
  { value: "CZECHIA", flag: "https://flagcdn.com/w40/cz.png" },
  { value: "SLOVAKIA", flag: "https://flagcdn.com/w40/sk.png" },
  { value: "GERMANY", flag: "https://flagcdn.com/w40/de.png" },
  { value: "JAPAN", flag: "https://flagcdn.com/w40/jp.png" },
  { value: "CHINA", flag: "https://flagcdn.com/w40/cn.png" },
];

const currencyOptions = ["EUR", "CZK", "USD", "JPY", "CNY"];

const countryToLanguageMap: Record<string, Language> = {
  "GREAT BRITAIN": "en",
  "UNITED STATES": "en",
  "CZECHIA": "cs",
  "SLOVAKIA": "sk",
  "GERMANY": "de",
  "JAPAN": "ja",
  "CHINA": "zh",
};

const languageToCountryMap: Record<Language, string> = {
  en: "GREAT BRITAIN",
  cs: "CZECHIA",
  sk: "SLOVAKIA",
  de: "GERMANY",
  ja: "JAPAN",
  zh: "CHINA",
};

interface PageLayoutProps {
  children: React.ReactNode;
  showSections?: boolean;
  forceBlackNavbar?: boolean; // Force black text in navbar for collection pages
}

const PageLayout = ({ children, showSections = false, forceBlackNavbar = false }: PageLayoutProps) => {
  const { language, setLanguage } = useI18n();
  const { currency, setCurrency } = useCurrency();
  const selectedCountry = languageToCountryMap[language];

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        countryOptions={countryOptions}
        currencyOptions={currencyOptions}
        selectedCountry={selectedCountry}
        selectedCurrency={currency}
        onCountryChange={(country) => setLanguage(countryToLanguageMap[country] || "en")}
        onCurrencyChange={setCurrency}
        forceBlackText={forceBlackNavbar}
      />
      
      {children}
      
      {showSections ? (
        <Sections />
      ) : null}

      <Footer />
    </div>
  );
};

export default PageLayout;
