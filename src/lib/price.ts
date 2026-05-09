import { convertPrice, formatPrice, type Currency } from "@/lib/currency";

export const parseEurPrice = (price: string): number => {
  const numeric = Number.parseFloat(price.replace(/[^\d.]/g, ""));
  return Number.isNaN(numeric) ? 0 : numeric;
};

export const formatLocalizedPrice = (price: string, currency: Currency): string => {
  const eurValue = parseEurPrice(price);
  const convertedValue = convertPrice(eurValue, currency);
  return formatPrice(convertedValue, currency);
};
