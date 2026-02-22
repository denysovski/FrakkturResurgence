import { useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CountryOption {
  value: string;
  flag: string;
}

interface Position {
  top: number;
  left?: number;
  right?: number;
  translateY?: string;
}

interface LocaleDropdownProps {
  type: "country" | "currency";
  options: (CountryOption | string)[];
  selected: string;
  onChange: (value: string) => void;
  countryOptions?: CountryOption[]; // Only needed for currency dropdown to show flags
  position?: "top" | "bottom"; // Position of dropdown menu
  onOpenChange?: (isOpen: boolean) => void; // Notify parent when dropdown opens/closes
  align?: "left" | "right"; // Alignment of dropdown menu
}

const LocaleDropdown = ({
  type,
  options,
  selected,
  onChange,
  countryOptions,
  position = "bottom",
  onOpenChange,
  align = "right",
}: LocaleDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<Position>({ top: 0 });
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target) && buttonRef.current && !buttonRef.current.contains(target)) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onOpenChange]);

  useEffect(() => {
    if (!isOpen || !buttonRef.current) {
      return;
    }

    const updatePosition = () => {
      if (!buttonRef.current) {
        return;
      }

      const rect = buttonRef.current.getBoundingClientRect();
      const newPos: Position = {
        top: position === "top" ? rect.top - 8 : rect.bottom + 8,
        translateY: position === "top" ? "-100%" : "0",
      };

      if (align === "left") {
        newPos.left = rect.left;
      } else {
        newPos.right = window.innerWidth - rect.right;
      }

      setDropdownPos(newPos);
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, align, position]);

  const isCountryType = type === "country";
  const isCountryMode = isCountryType && Array.isArray(options) && options.length > 0 && "flag" in options[0];

  const getSelectedCountryOption = (value: string): CountryOption | undefined => {
    if (!isCountryMode) return undefined;
    return (options as CountryOption[]).find((opt) => opt.value === value);
  };

  const selectedCountryOption = isCountryMode ? getSelectedCountryOption(selected) : undefined;

  return (
    <div ref={menuRef} className="relative flex items-center gap-2" style={{ zIndex: "auto" }}>
      <button
        ref={buttonRef}
        onClick={() => {
          const newState = !isOpen;
          setIsOpen(newState);
          onOpenChange?.(newState);
        }}
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

      {isOpen && (
        <div
          className={`fixed ${isCountryMode ? "w-60" : "w-44"} bg-background text-foreground border border-border shadow-lg z-[9999] rounded-sm`}
          style={{
            top: `${dropdownPos.top}px`,
            left: dropdownPos.left !== undefined ? `${dropdownPos.left}px` : "auto",
            right: dropdownPos.right !== undefined ? `${dropdownPos.right}px` : "auto",
            transform: `translateY(${dropdownPos.translateY || "0"})`,
          }}
        >
        {isCountryMode &&
          (options as CountryOption[]).map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
                onOpenChange?.(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary transition-colors text-xs tracking-[0.08em] border-b border-border last:border-b-0"
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
                onOpenChange?.(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary transition-colors text-sm border-b border-border last:border-b-0"
            >
              <span>{option}</span>
              {selected === option && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocaleDropdown;
