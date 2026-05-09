import { createContext, useContext, useState, type ReactNode } from "react";
import { getCurrencyFromCookie, setCurrencyCookie, type Currency, CURRENCY_OPTIONS } from "@/lib/currency";

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (curr: Currency) => void;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window === "undefined") return "EUR";
    return getCurrencyFromCookie();
  });

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    setCurrencyCookie(curr);
    // Dispatch event for other components to react to currency change
    window.dispatchEvent(new CustomEvent("frakktur:currency-changed", { detail: curr }));
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

// Export currency options for dropdowns
export { CURRENCY_OPTIONS };
