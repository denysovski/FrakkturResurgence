import { useState, useEffect } from "react";
import { X } from "lucide-react";
import frakkturLogo from "@/assets/frakktur-logo.png";

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("newsletter_dismissed");
    if (dismissed) return;
    const timer = setTimeout(() => setOpen(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("newsletter_dismissed", "true");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(handleClose, 2000);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center" onClick={handleClose}>
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />
      <div
        className="relative bg-background w-[90vw] max-w-md p-10 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            <div className="flex justify-center mb-8">
              <img src={frakkturLogo} alt="Frakktur" className="h-16 md:h-20 w-auto" />
            </div>
            <h3 className="section-heading text-2xl md:text-3xl mb-2">Get 10% Off</h3>
            <p className="text-sm text-muted-foreground font-body mb-6">
              Subscribe to our newsletter and receive 10% off your first order. Stay updated with new drops and exclusive offers.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-border px-4 py-3 text-sm font-body outline-none focus:border-foreground transition-colors bg-transparent"
              />
              <button type="submit" className="btn-primary w-full">
                Subscribe & Get 10% Off
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="flex justify-center mb-6">
              <img src={frakkturLogo} alt="Frakktur" className="h-16 md:h-20 w-auto" />
            </div>
            <h3 className="section-heading text-2xl mb-2">Welcome!</h3>
            <p className="text-sm text-muted-foreground font-body">
              Check your email for your exclusive 10% discount code.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
