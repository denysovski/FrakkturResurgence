import PageLayout from "@/pages/PageLayout";
import CollectionPage from "./CollectionPage";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const hoodieProducts = [
  { id: "h1", name: "Essential Hoodie", price: "€89.00", image: product1 },
  { id: "h2", name: "Oversized Hoodie", price: "€99.00", image: product2 },
  { id: "h3", name: "Graphic Hoodie", price: "€89.00", image: product3 },
  { id: "h4", name: "Premium Fleece", price: "€109.00", image: product4 },
  { id: "h5", name: "Classic Black Hoodie", price: "€89.00", image: product1 },
  { id: "h6", name: "Urban Hoodie", price: "€94.00", image: product2 },
  { id: "h7", name: "Minimalist Design", price: "€89.00", image: product3 },
  { id: "h8", name: "Streetwear Hoodie", price: "€99.00", image: product4 },
  { id: "h9", name: "Tech Hoodie", price: "€104.00", image: product1 },
  { id: "h10", name: "Comfort Fit Hoodie", price: "€89.00", image: product2 },
  { id: "h11", name: "Limited Edition", price: "€119.00", image: product3 },
  { id: "h12", name: "Premium Quality", price: "€99.00", image: product4 },
  { id: "h13", name: "Signature Style", price: "€89.00", image: product1 },
  { id: "h14", name: "Casual Hoodie", price: "€94.00", image: product2 },
  { id: "h15", name: "Designer Hoodie", price: "€129.00", image: product3 },
];

const HoodiesPage = () => {
  return (
    <PageLayout forceBlackNavbar={true}>
      <CollectionPage
        title="Hoodies"
        description="Stylish and comfortable hoodies for every season. From classic designs to contemporary styles."
        products={hoodieProducts}
      />
    </PageLayout>
  );
};

export default HoodiesPage;
