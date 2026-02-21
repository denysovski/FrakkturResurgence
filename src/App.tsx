import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Collection pages
import TshirtsPage from "./pages/collections/TshirtsPage";
import HoodiesPage from "./pages/collections/HoodiesPage";
import CapsPage from "./pages/collections/CapsPage";
import HatsPage from "./pages/collections/HatsPage";
import BeltsPage from "./pages/collections/BeltsPage";
import ShoesPage from "./pages/collections/ShoesPage";
import PantsPage from "./pages/collections/PantsPage";
import KnitwearPage from "./pages/collections/KnitwearPage";
import LeatherJacketsPage from "./pages/collections/LeatherJacketsPage";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";

// Info pages
import ClubPage from "./pages/info/ClubPage";
import AboutPage from "./pages/info/AboutPage";
import SustainabilityPage from "./pages/info/SustainabilityPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Collections */}
          <Route path="/collections/tshirts" element={<TshirtsPage />} />
          <Route path="/collections/hoodies" element={<HoodiesPage />} />
          <Route path="/collections/caps" element={<CapsPage />} />
          <Route path="/collections/hats" element={<HatsPage />} />
          <Route path="/collections/belts" element={<BeltsPage />} />
          <Route path="/collections/shoes" element={<ShoesPage />} />
          <Route path="/collections/pants" element={<PantsPage />} />
          <Route path="/collections/knitwear" element={<KnitwearPage />} />
          <Route path="/collections/leather-jackets" element={<LeatherJacketsPage />} />
          
          {/* Auth */}
          <Route path="/auth/login" element={<LoginPage />} />
          
          {/* Info Pages */}
          <Route path="/club" element={<ClubPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/sustainability" element={<SustainabilityPage />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
