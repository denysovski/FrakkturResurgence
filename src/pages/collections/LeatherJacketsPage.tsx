import PageLayout from "@/pages/PageLayout";
import CollectionPage from "./CollectionPage";
import { withCollectionImages } from "@/lib/collectionImages";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const jacketsProducts = [
  { id: "j1", name: "Leather Jacket", price: "€199.00", image: product1 },
  { id: "j2", name: "Bomber Jacket", price: "€149.00", image: product2 },
  { id: "j3", name: "Denim Jacket", price: "€119.00", image: product3 },
  { id: "j4", name: "Varsity Jacket", price: "€169.00", image: product4 },
  { id: "j5", name: "Classic Leather", price: "€189.00", image: product1 },
  { id: "j6", name: "Street Jacket", price: "€139.00", image: product2 },
  { id: "j7", name: "Minimalist Jacket", price: "€129.00", image: product3 },
  { id: "j8", name: "Heritage Leather", price: "€209.00", image: product4 },
  { id: "j9", name: "Premium Jacket", price: "€159.00", image: product1 },
  { id: "j10", name: "Urban Jacket", price: "€144.00", image: product2 },
  { id: "j11", name: "Limited Edition", price: "€229.00", image: product3 },
  { id: "j12", name: "Designer Jacket", price: "€249.00", image: product4 },
  { id: "j13", name: "Signature Leather", price: "€219.00", image: product1 },
  { id: "j14", name: "Executive Jacket", price: "€179.00", image: product2 },
  { id: "j15", name: "Casual Jacket", price: "€134.00", image: product3 },
];

const LeatherJacketsPage = () => {
  return (
    <PageLayout forceBlackNavbar={true}>
      <CollectionPage
        title="Leather Jackets"
        description="Premium leather jackets collection. Iconic styles that never go out of fashion."
        products={withCollectionImages("leather-jackets", jacketsProducts)}
      />
    </PageLayout>
  );
};

export default LeatherJacketsPage;
