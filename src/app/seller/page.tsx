import { getProducts, getCategories } from "@/lib/actions/products";
import { SellerCatalog } from "@/components/seller/seller-catalog";

export default async function SellerPage({
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
    <SellerCatalog
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
