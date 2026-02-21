import { useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CountryOption {
  value: string;
  flag: string;
}

interface LocaleDropdownProps {
  type: "country" | "currency";
  options: (CountryOption | string)[];
  selected: string;
  onChange: (value: string) => void;
  countryOptions?: CountryOption[]; // Only needed for currency dropdown to show flags
}

const LocaleDropdown = ({
  type,
  options,
  selected,
  onChange,
  countryOptions,
}: LocaleDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isCountryType = type === "country";
  const isCountryMode = isCountryType && Array.isArray(options) && options.length > 0 && "flag" in options[0];

  const getSelectedCountryOption = (value: string): CountryOption | undefined => {
    if (!isCountryMode) return undefined;
    return (options as CountryOption[]).find((opt) => opt.value === value);
  };

  const selectedCountryOption = isCountryMode ? getSelectedCountryOption(selected) : undefined;

  return (
    <div ref={menuRef} className="relative flex items-center gap-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-70 transition-opacity"
        aria-label={`Open ${type} menu`}
      >
        {isCountryMode && selectedCountryOption && (
          <img
            src={selectedCountryOption.flag}
            alt={selectedCountryOption.value}
            className="h-5 w-7 object-cover rounded-sm"
          />
        )}
        {!isCountryMode && <span className="text-sm">{selected}</span>}
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      <div
        className={`absolute top-full right-0 mt-3 ${isCountryMode ? "w-60" : "w-44"} bg-background text-foreground border border-border shadow-sm z-[70] transition-all duration-200 origin-top-right ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-1 pointer-events-none"
        }`}
      >
        {isCountryMode &&
          (options as CountryOption[]).map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary transition-colors text-xs tracking-[0.08em]"
            >
              <span className="flex items-center gap-2">
                <img src={option.flag} alt={option.value} className="h-4 w-6 object-cover rounded-sm" />
                {option.value}
              </span>
              {selected === option.value && <span>✓</span>}
            </button>
          ))}

        {!isCountryMode &&
          (options as string[]).map((option, index) => (
            <button
              key={`${option}-${index}`}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary transition-colors text-sm"
            >
              <span>{option}</span>
              {selected === option && <span>✓</span>}
            </button>
          ))}
      </div>
    </div>
  );
};

export default LocaleDropdown;
