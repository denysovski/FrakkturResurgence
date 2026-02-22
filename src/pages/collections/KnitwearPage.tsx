import PageLayout from "@/pages/PageLayout";
import CollectionPage from "./CollectionPage";
import { getCategoryData } from "@/lib/catalog";

const KnitwearPage = () => {
  const category = getCategoryData("knitwear");

  if (!category) {
    return null;
  }

  return (
    <PageLayout forceBlackNavbar={true}>
      <CollectionPage
        categoryKey="knitwear"
        title={category.title}
        description={category.description}
        products={category.products}
      />
    </PageLayout>
  );
};

export default KnitwearPage;
