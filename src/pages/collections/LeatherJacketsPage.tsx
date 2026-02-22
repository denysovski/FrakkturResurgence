import PageLayout from "@/pages/PageLayout";
import CollectionPage from "./CollectionPage";
import { getCategoryData } from "@/lib/catalog";

const LeatherJacketsPage = () => {
  const category = getCategoryData("leather-jackets");

  if (!category) {
    return null;
  }

  return (
    <PageLayout forceBlackNavbar={true}>
      <CollectionPage
        categoryKey="leather-jackets"
        title={category.title}
        description={category.description}
        products={category.products}
      />
    </PageLayout>
  );
};

export default LeatherJacketsPage;
