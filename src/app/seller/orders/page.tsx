import { getSellerOrders } from "@/lib/actions/orders";
import { SellerOrdersList } from "@/components/seller/seller-orders-list";

export default async function SellerOrdersPage() {
  const orders = await getSellerOrders();
  return <SellerOrdersList orders={orders} />;
}
