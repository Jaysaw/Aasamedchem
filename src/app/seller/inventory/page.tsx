import { getProducts } from "@/lib/actions/products";
import { SellerInventoryView } from "@/components/seller/seller-inventory-view";

export default async function SellerInventoryPage() {
  const products = await getProducts({ activeOnly: true });
  return <SellerInventoryView products={products} />;
}
