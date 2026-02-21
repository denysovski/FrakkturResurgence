import PageLayout from "@/pages/PageLayout";
import CollectionPage from "./CollectionPage";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const beltsProducts = [
  { id: "b1", name: "Leather Belt", price: "€59.00", image: product1 },
  { id: "b2", name: "Canvas Belt", price: "€44.00", image: product2 },
  { id: "b3", name: "Premium Leather Belt", price: "€79.00", image: product3 },
  { id: "b4", name: "Street Belt", price: "€49.00", image: product4 },
  { id: "b5", name: "Classic Black Belt", price: "€54.00", image: product1 },
  { id: "b6", name: "Brown Leather Belt", price: "€64.00", image: product2 },
  { id: "b7", name: "Minimalist Belt", price: "€44.00", image: product3 },
  { id: "b8", name: "Heritage Belt", price: "€69.00", image: product4 },
  { id: "b9", name: "Silver Buckle Belt", price: "€54.00", image: product1 },
  { id: "b10", name: "Casual Belt", price: "€44.00", image: product2 },
  { id: "b11", name: "Limited Edition Belt", price: "€89.00", image: product3 },
  { id: "b12", name: "Premium Belt", price: "€74.00", image: product4 },
  { id: "b13", name: "Designer Belt", price: "€99.00", image: product1 },
  { id: "b14", name: "Urban Belt", price: "€59.00", image: product2 },
  { id: "b15", name: "Signature Belt", price: "€69.00", image: product3 },
];

const BeltsPage = () => {
  return (
    <PageLayout forceBlackNavbar={true}>
      <CollectionPage
        title="Belts"
        description="Essential belts that combine style and functionality. From classic leather to contemporary designs."
        products={beltsProducts}
      />
    </PageLayout>
  );
};

export default BeltsPage;
