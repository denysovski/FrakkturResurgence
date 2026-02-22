import PageLayout from "@/pages/PageLayout";
import CollectionPage from "./CollectionPage";
import { getCategoryData } from "@/lib/catalog";

const PantsPage = () => {
  const category = getCategoryData("pants");

  if (!category) {
    return null;
  }

  return (
    <PageLayout forceBlackNavbar={true}>
      <CollectionPage
        categoryKey="pants"
        title={category.title}
        description={category.description}
        products={category.products}
      />
    </PageLayout>
  );
};

export default PantsPage;
