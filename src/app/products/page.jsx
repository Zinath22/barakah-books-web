import Products from "@/components/home/Products";
import { getProducts } from "@/actions/server/product";
import { CATEGORY_VALUES } from "@/lib/books";

export const generateMetadata = async ({ searchParams }) => {
  const sp = (await searchParams) || {};
  if (sp.sort === "popular") {
    return {
      title: "বেস্টসেলার",
      description: "পাঠকদের সবচেয়ে বেশি কেনা ইসলামিক বই",
    };
  }
  return {
    title: "সব বই",
    description: "কুরআন, হাদিস, সীরাত, ফিকহ, আকীদা ও শিশুদের ইসলামিক বইয়ের সংগ্রহ",
  };
};

const ProductsPage = async ({ searchParams }) => {
  const sp = (await searchParams) || {};
  const products = await getProducts();
  const category = CATEGORY_VALUES.includes(sp.category) ? sp.category : "all";

  return (
    <Products
      key={JSON.stringify(sp)}
      products={products}
      initialCategory={category}
      initialQuery={sp.q || ""}
      initialSort={sp.sort || "newest"}
    />
  );
};

export default ProductsPage;
