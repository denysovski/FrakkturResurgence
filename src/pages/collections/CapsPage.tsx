import PageLayout from "@/pages/PageLayout";
import CollectionPage from "./CollectionPage";
import { getCategoryData } from "@/lib/catalog";

const CapsPage = () => {
  const category = getCategoryData("caps");

  if (!category) {
    return null;
  }

  return (
    <PageLayout forceBlackNavbar={true}>
      <CollectionPage
        categoryKey="caps"
        title={category.title}
        description={category.description}
        products={category.products}
      />
    </PageLayout>
  );
};

export default CapsPage;
