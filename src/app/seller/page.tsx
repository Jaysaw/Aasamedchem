import { getAllOrders } from "@/lib/actions/orders";
import { getProducts } from "@/lib/actions/products";
import { SellerDashboard } from "@/components/seller/seller-dashboard";

export default async function SellerDashboardPage() {
  const [orders, products] = await Promise.all([
    getAllOrders(),
    getProducts({ activeOnly: true }),
  ]);

  return <SellerDashboard orders={orders} productCount={products.length} />;
}
