import HeroCarousel from "@/components/HeroCarousel";
import Sections from "@/components/Sections";
import NewsletterPopup from "@/components/NewsletterPopup";
import SEO from "@/components/SEO";
import PageLayout from "@/pages/PageLayout";
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

const Index = () => {
  const { language, setLanguage } = useI18n();
  const { currency, setCurrency } = useCurrency();
  const selectedCountry = languageToCountryMap[language];

  return (
    <PageLayout>
      <SEO
        title="Home"
        description="Frakktur - Luxury streetwear collection. Discover exclusive t-shirts, hoodies, caps, belts, pants, knitwear, and leather jackets. Premium quality apparel for the modern streetwear enthusiast."
        canonicalUrl="https://frakktur.com/"
      />
      <HeroCarousel />
      <Sections />
      <NewsletterPopup />
    </PageLayout>
  );
};

export default Index;
