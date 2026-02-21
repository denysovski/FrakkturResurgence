import PageLayout from "@/pages/PageLayout";
import CollectionPage from "./CollectionPage";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

// Mock products for T-shirts collection
const tshirtProducts = [
  { id: "ts1", name: "Essential White Tee", price: "€49.00", image: product1 },
  { id: "ts2", name: "Urban Black Tee", price: "€49.00", image: product2 },
  { id: "ts3", name: "Graphic Print Tee", price: "€59.00", image: product3 },
  { id: "ts4", name: "Oversized Grey Tee", price: "€54.00", image: product4 },
  { id: "ts5", name: "Minimalist Cream Tee", price: "€49.00", image: product1 },
  { id: "ts6", name: "Classic Black Tee", price: "€49.00", image: product2 },
  { id: "ts7", name: "Vintage Blue Tee", price: "€59.00", image: product3 },
  { id: "ts8", name: "Streetwear Tee", price: "€64.00", image: product4 },
  { id: "ts9", name: "Premium Cotton Tee", price: "€54.00", image: product1 },
  { id: "ts10", name: "Signature Tee", price: "€49.00", image: product2 },
  { id: "ts11", name: "Limited Edition Tee", price: "€69.00", image: product3 },
  { id: "ts12", name: "Comfort Fit Tee", price: "€49.00", image: product4 },
  { id: "ts13", name: "Designer Tee", price: "€79.00", image: product1 },
  { id: "ts14", name: "Casual Crew Tee", price: "€49.00", image: product2 },
  { id: "ts15", name: "Premium Blend Tee", price: "€59.00", image: product3 },
];

const TshirtsPage = () => {
  return (
    <PageLayout forceBlackNavbar={true}>
      <CollectionPage
        title="T-Shirts"
        description="Discover our curated collection of premium t-shirts, from classic essentials to statement pieces."
        products={tshirtProducts}
      />
    </PageLayout>
  );
};

export default TshirtsPage;
