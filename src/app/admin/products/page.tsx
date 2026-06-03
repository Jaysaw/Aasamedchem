import { getProducts } from "@/lib/actions/products";
import { ProductsManager } from "@/components/admin/products-manager";

export default async function AdminProductsPage() {
  const products = await getProducts({ activeOnly: false });
  return <ProductsManager initialProducts={products} />;
}
