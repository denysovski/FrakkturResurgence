import PageLayout from "@/pages/PageLayout";
import CollectionPage from "./CollectionPage";
import { withCollectionImages } from "@/lib/collectionImages";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const hatsProducts = [
  { id: "h1", name: "Wool Beanie", price: "€45.00", image: product1 },
  { id: "h2", name: "Leather Bucket Hat", price: "€89.00", image: product2 },
  { id: "h3", name: "Knit Hat", price: "€49.00", image: product3 },
  { id: "h4", name: "Wide Brim Hat", price: "€79.00", image: product4 },
  { id: "h5", name: "Minimalist Beanie", price: "€39.00", image: product1 },
  { id: "h6", name: "Premium Felt Hat", price: "€99.00", image: product2 },
  { id: "h7", name: "Street Beanie", price: "€45.00", image: product3 },
  { id: "h8", name: "Heritage Hat", price: "€84.00", image: product4 },
  { id: "h9", name: "Casual Beanie", price: "€39.00", image: product1 },
  { id: "h10", name: "Classic Hat", price: "€79.00", image: product2 },
  { id: "h11", name: "Limited Edition Beanie", price: "€59.00", image: product3 },
  { id: "h12", name: "Premium Beanie", price: "€49.00", image: product4 },
  { id: "h13", name: "Designer Hat", price: "€119.00", image: product1 },
  { id: "h14", name: "Urban Hat", price: "€89.00", image: product2 },
  { id: "h15", name: "Signature Beanie", price: "€54.00", image: product3 },
];

const HatsPage = () => {
  return (
    <PageLayout forceBlackNavbar={true}>
      <CollectionPage
        title="Hats"
        description="Timeless hat collection for every style. Explore our range of beanies, bucket hats, and wide-brim styles."
        products={withCollectionImages("hats", hatsProducts)}
      />
    </PageLayout>
  );
};

export default HatsPage;
