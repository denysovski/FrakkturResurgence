import PageLayout from "@/pages/PageLayout";
import CollectionPage from "./CollectionPage";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const capsProducts = [
  { id: "c1", name: "Stealth Cap", price: "€35.00", image: product1 },
  { id: "c2", name: "Classic Baseball Cap", price: "€39.00", image: product2 },
  { id: "c3", name: "Urban Street Cap", price: "€42.00", image: product3 },
  { id: "c4", name: "Premium Cotton Cap", price: "€39.00", image: product4 },
  { id: "c5", name: "Logo Cap", price: "€39.00", image: product1 },
  { id: "c6", name: "Vintage Wash Cap", price: "€39.00", image: product2 },
  { id: "c7", name: "Minimalist Cap", price: "€35.00", image: product3 },
  { id: "c8", name: "Heritage Cap", price: "€44.00", image: product4 },
  { id: "c9", name: "Adjustable Cap", price: "€39.00", image: product1 },
  { id: "c10", name: "Casual Cap", price: "€35.00", image: product2 },
  { id: "c11", name: "Limited Edition Cap", price: "€49.00", image: product3 },
  { id: "c12", name: "Premium Flex Cap", price: "€42.00", image: product4 },
  { id: "c13", name: "Designer Cap", price: "€59.00", image: product1 },
  { id: "c14", name: "Snapback Cap", price: "€39.00", image: product2 },
  { id: "c15", name: "Signature Cap", price: "€44.00", image: product3 },
];

const CapsPage = () => {
  return (
    <PageLayout>
      <CollectionPage
        title="Caps"
        description="Stylish caps for any occasion. From classic designs to modern interpretations of street style."
        products={capsProducts}
      />
    </PageLayout>
  );
};

export default CapsPage;
