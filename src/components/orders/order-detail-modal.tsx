"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrderWithItems } from "@/lib/actions/orders";
import {
  formatInr,
  formatQuantity,
  fromBaseQuantity,
  type DisplayUnit,
} from "@/lib/units";

type OrderData = Awaited<ReturnType<typeof getOrderWithItems>>;

export function OrderDetailModal({
  orderId,
  onClose,
  isAdmin,
}: {
  orderId: string;
  onClose: () => void;
  isAdmin?: boolean;
}) {
  const [data, setData] = useState<OrderData>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderWithItems(orderId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-xl p-8">Loading…</div>
      </div>
    );
  }

  if (!data?.order) return null;

  const { order, items, seller } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto card-shadow">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg">{order.orderNumber}</h2>
            {isAdmin && seller && (
              <p className="text-sm text-slate-500">{seller.name} · {seller.email}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm">
            Status: <span className="font-medium">{order.status}</span> · Total:{" "}
            <span className="font-bold text-teal-800">{formatInr(order.totalInr)}</span>
          </p>
          {order.notes && (
            <p className="text-sm bg-slate-50 rounded p-3">{order.notes}</p>
          )}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="pb-2">Product</th>
                <th className="pb-2">Ordered</th>
                <th className="pb-2">In base</th>
                <th className="pb-2">Rate/base</th>
                <th className="pb-2 text-right">Line total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-3">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-slate-400">{item.productSku}</p>
                  </td>
                  <td className="py-3">
                    {formatQuantity(item.orderedQuantity, item.orderedUnit as DisplayUnit)}
                  </td>
                  <td className="py-3 text-slate-600">
                    {formatQuantity(
                      fromBaseQuantity(
                        item.quantityInBase,
                        item.productBaseUnit as DisplayUnit,
                        item.productBaseUnit as DisplayUnit
                      ),
                      item.productBaseUnit as DisplayUnit
                    )}
                  </td>
                  <td className="py-3 text-xs">
                    {formatInr(item.pricePerBaseUnit)}/
                    {item.productBaseUnit === "unit" ? "item" : item.productBaseUnit}
                  </td>
                  <td className="py-3 text-right font-medium">
                    {formatInr(item.lineTotalInr)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
