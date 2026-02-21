import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import Sections from "@/components/Sections";
import NewsletterPopup from "@/components/NewsletterPopup";

const countryOptions = [
  { value: "GREAT BRITAIN", flag: "https://flagcdn.com/w40/gb.png" },
  { value: "UNITED STATES", flag: "https://flagcdn.com/w40/us.png" },
  { value: "CZECHIA", flag: "https://flagcdn.com/w40/cz.png" },
  { value: "SLOVAKIA", flag: "https://flagcdn.com/w40/sk.png" },
  { value: "GERMANY", flag: "https://flagcdn.com/w40/de.png" },
  { value: "JAPAN", flag: "https://flagcdn.com/w40/jp.png" },
  { value: "CHINA", flag: "https://flagcdn.com/w40/cn.png" },
];

const currencyOptions = ["GBP", "USD", "CZK", "EUR", "EUR", "JPY", "CNY"];

const Index = () => {
  const [selectedCountry, setSelectedCountry] = useState(countryOptions[0].value);
  const [selectedCurrency, setSelectedCurrency] = useState(currencyOptions[0]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        countryOptions={countryOptions}
        currencyOptions={currencyOptions}
        selectedCountry={selectedCountry}
        selectedCurrency={selectedCurrency}
        onCountryChange={setSelectedCountry}
        onCurrencyChange={setSelectedCurrency}
      />
      <HeroCarousel />
      <Sections
        countryOptions={countryOptions}
        currencyOptions={currencyOptions}
        selectedCountry={selectedCountry}
        selectedCurrency={selectedCurrency}
        onCountryChange={setSelectedCountry}
        onCurrencyChange={setSelectedCurrency}
      />
      <NewsletterPopup />
    </div>
  );
};

export default Index;
