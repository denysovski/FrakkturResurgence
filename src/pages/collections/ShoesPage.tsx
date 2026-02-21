import PageLayout from "@/pages/PageLayout";
import CollectionPage from "./CollectionPage";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const shoesProducts = [
  { id: "s1", name: "Classic Sneaker", price: "€99.00", image: product1 },
  { id: "s2", name: "High Top Sneaker", price: "€114.00", image: product2 },
  { id: "s3", name: "Street Runner", price: "€109.00", image: product3 },
  { id: "s4", name: "Premium Leather", price: "€139.00", image: product4 },
  { id: "s5", name: "Minimalist Shoe", price: "€94.00", image: product1 },
  { id: "s6", name: "Athletic Sneaker", price: "€104.00", image: product2 },
  { id: "s7", name: "Casual Shoe", price: "€89.00", image: product3 },
  { id: "s8", name: "Heritage Sneaker", price: "€119.00", image: product4 },
  { id: "s9", name: "Low Top Runner", price: "€99.00", image: product1 },
  { id: "s10", name: "Urban Sneaker", price: "€104.00", image: product2 },
  { id: "s11", name: "Limited Edition", price: "€144.00", image: product3 },
  { id: "s12", name: "Premium Runner", price: "€124.00", image: product4 },
  { id: "s13", name: "Designer Sneaker", price: "€159.00", image: product1 },
  { id: "s14", name: "Signature Shoe", price: "€109.00", image: product2 },
  { id: "s15", name: "Comfort Sneaker", price: "€99.00", image: product3 },
];

const ShoesPage = () => {
  return (
    <PageLayout>
      <CollectionPage
        title="Shoes"
        description="Step into style with our premium shoe collection. Discover sneakers and shoes designed for every moment."
        products={shoesProducts}
      />
    </PageLayout>
  );
};

export default ShoesPage;
