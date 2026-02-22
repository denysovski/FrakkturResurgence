import PageLayout from "@/pages/PageLayout";
import CollectionPage from "./CollectionPage";
import { getCategoryData } from "@/lib/catalog";

const BeltsPage = () => {
  const category = getCategoryData("belts");

  if (!category) {
    return null;
  }

  return (
    <PageLayout forceBlackNavbar={true}>
      <CollectionPage
        categoryKey="belts"
        title={category.title}
        description={category.description}
        products={category.products}
      />
    </PageLayout>
  );
};

export default BeltsPage;
