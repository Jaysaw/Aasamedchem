import { getProducts, getCategories } from "@/lib/actions/products";
import { BuyerCatalog } from "@/components/buyer/buyer-catalog";

export default async function BuyerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; dimension?: string }>;
}) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts({
      q: params.q,
      category: params.category,
      dimension: params.dimension,
      activeOnly: true,
    }),
    getCategories(),
  ]);

  return (
    <BuyerCatalog
      products={products}
      categories={categories}
      initialFilters={{
        q: params.q ?? "",
        category: params.category ?? "",
        dimension: params.dimension ?? "",
      }}
    />
  );
}
