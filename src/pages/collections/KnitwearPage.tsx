import PageLayout from "@/pages/PageLayout";
import CollectionPage from "./CollectionPage";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const knitwearProducts = [
  { id: "k1", name: "Wool Sweater", price: "€89.00", image: product1 },
  { id: "k2", name: "Cable Knit", price: "€94.00", image: product2 },
  { id: "k3", name: "Merino Wool", price: "€99.00", image: product3 },
  { id: "k4", name: "Oversized Knit", price: "€104.00", image: product4 },
  { id: "k5", name: "Turtleneck", price: "€79.00", image: product1 },
  { id: "k6", name: "V-Neck Sweater", price: "€84.00", image: product2 },
  { id: "k7", name: "Minimalist Knit", price: "€89.00", image: product3 },
  { id: "k8", name: "Heritage Sweater", price: "€99.00", image: product4 },
  { id: "k9", name: "Cardigan Sweater", price: "€94.00", image: product1 },
  { id: "k10", name: "Casual Knit", price: "€79.00", image: product2 },
  { id: "k11", name: "Limited Edition", price: "€119.00", image: product3 },
  { id: "k12", name: "Premium Wool", price: "€109.00", image: product4 },
  { id: "k13", name: "Designer Sweater", price: "€139.00", image: product1 },
  { id: "k14", name: "Urban Knit", price: "€94.00", image: product2 },
  { id: "k15", name: "Signature Sweater", price: "€99.00", image: product3 },
];

const KnitwearPage = () => {
  return (
    <PageLayout forceBlackNavbar={true}>
      <CollectionPage
        title="Knitwear"
        description="Cozy and stylish knitwear collection. From wool sweaters to cable knits for every season."
        products={knitwearProducts}
      />
    </PageLayout>
  );
};

export default KnitwearPage;
