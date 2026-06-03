import { getBuyerOrders } from "@/lib/actions/orders";
import { BuyerOrdersList } from "@/components/buyer/buyer-orders-list";

export default async function BuyerOrdersPage() {
  const orders = await getBuyerOrders();
  return <BuyerOrdersList orders={orders} />;
}
