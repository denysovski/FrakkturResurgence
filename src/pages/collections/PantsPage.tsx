import PageLayout from "@/pages/PageLayout";
import CollectionPage from "./CollectionPage";
import { withCollectionImages } from "@/lib/collectionImages";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const pantsProducts = [
  { id: "p1", name: "Classic Denim", price: "€79.00", image: product1 },
  { id: "p2", name: "Slim Fit Jeans", price: "€74.00", image: product2 },
  { id: "p3", name: "Cargo Pants", price: "€89.00", image: product3 },
  { id: "p4", name: "Black Trousers", price: "€84.00", image: product4 },
  { id: "p5", name: "Minimalist Pants", price: "€74.00", image: product1 },
  { id: "p6", name: "Street Jeans", price: "€79.00", image: product2 },
  { id: "p7", name: "Heritage Denim", price: "€89.00", image: product3 },
  { id: "p8", name: "Comfort Fit Pants", price: "€79.00", image: product4 },
  { id: "p9", name: "Urban Trousers", price: "€84.00", image: product1 },
  { id: "p10", name: "Casual Pants", price: "€74.00", image: product2 },
  { id: "p11", name: "Limited Edition Jeans", price: "€99.00", image: product3 },
  { id: "p12", name: "Premium Denim", price: "€94.00", image: product4 },
  { id: "p13", name: "Designer Pants", price: "€119.00", image: product1 },
  { id: "p14", name: "Signature Jeans", price: "€84.00", image: product2 },
  { id: "p15", name: "Tech Pants", price: "€89.00", image: product3 },
];

const PantsPage = () => {
  return (
    <PageLayout forceBlackNavbar={true}>
      <CollectionPage
        title="Pants"
        description="Premium pants collection featuring jeans, cargo pants, and trousers for every occasion."
        products={withCollectionImages("pants", pantsProducts)}
      />
    </PageLayout>
  );
};

export default PantsPage;
