// Supported currencies
export type Currency = "EUR" | "CZK" | "SKK" | "USD" | "JPY" | "CNY";

const CURRENCY_COOKIE_KEY = "frakktur_currency";
const COOKIE_EXPIRY_DAYS = 365;

export const CURRENCY_OPTIONS = {
  EUR: { code: "EUR", symbol: "€", name: "Euro", rate: 1 },
  CZK: { code: "CZK", symbol: "Kč", name: "Czech Koruna", rate: 24.3 },
  SKK: { code: "SKK", symbol: "€", name: "Slovak Euro", rate: 1 }, // Slovakia uses EUR now, but keeping for reference
  USD: { code: "USD", symbol: "$", name: "US Dollar", rate: 1.1 },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 130 },
  CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan", rate: 7.8 },
} as const;

// Cookie functions
export const getCurrencyFromCookie = (): Currency => {
  if (typeof document === "undefined") return "EUR";
  
  const cookies = document.cookie.split(";");
  const cookie = cookies.find((c) => c.trim().startsWith(CURRENCY_COOKIE_KEY + "="));
  
  if (cookie) {
    const value = cookie.split("=")[1];
    if (Object.keys(CURRENCY_OPTIONS).includes(value)) {
      return value as Currency;
    }
  }
  
  return "EUR";
};

export const setCurrencyCookie = (currency: Currency): void => {
  if (typeof document === "undefined") return;
  
  const date = new Date();
  date.setTime(date.getTime() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  
  document.cookie = `${CURRENCY_COOKIE_KEY}=${currency};${expires};path=/`;
};

// Convert price from EUR to target currency
export const convertPrice = (priceInEur: number, targetCurrency: Currency): number => {
  const rate = CURRENCY_OPTIONS[targetCurrency].rate;
  return priceInEur * rate;
};

// Format price with currency
export const formatPrice = (amount: number, currency: Currency): string => {
  const currencyInfo = CURRENCY_OPTIONS[currency];
  
  // Format with 2 decimal places
  const formatted = amount.toFixed(2);
  
  // Return symbol + amount or amount + symbol depending on currency
  if (currency === "JPY") {
    return `${currencyInfo.symbol}${Math.round(amount)}`;
  }
  
  if (currency === "USD" || currency === "CNY") {
    return `${currencyInfo.symbol}${formatted}`;
  }
  
  return `${formatted} ${currencyInfo.symbol}`;
};

// Get currency info
export const getCurrencyInfo = (currency: Currency) => {
  return CURRENCY_OPTIONS[currency];
};
