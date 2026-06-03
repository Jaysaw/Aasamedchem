import { getAllOrders } from "@/lib/actions/orders";
import { AdminOrdersList } from "@/components/admin/admin-orders-list";

export default async function AdminOrdersPage() {
  const rows = await getAllOrders();
  return <AdminOrdersList rows={rows} />;
}
