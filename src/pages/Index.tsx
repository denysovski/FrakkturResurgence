import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import Sections from "@/components/Sections";
import NewsletterPopup from "@/components/NewsletterPopup";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroCarousel />
      <Sections />
      <NewsletterPopup />
    </div>
  );
};

export default Index;
