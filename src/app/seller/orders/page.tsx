import { getAllOrders } from "@/lib/actions/orders";
import { SellerFulfillmentList } from "@/components/seller/seller-fulfillment-list";

export default async function SellerOrdersPage() {
  const rows = await getAllOrders();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Buyer orders</h1>
        <p className="text-sm text-slate-500">
          Review ordered units vs base storage quantities. Admin approves quotations; you fulfill approved orders.
        </p>
      </div>
      <SellerFulfillmentList rows={rows} />
    </div>
  );
}
