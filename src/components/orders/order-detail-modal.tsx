"use client";

import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrderWithItems } from "@/lib/actions/orders";
import {
  formatInr,
  formatQuantity,
  unitLabel,
  type DisplayUnit,
} from "@/lib/units";

type OrderData = Awaited<ReturnType<typeof getOrderWithItems>>;

export function OrderDetailModal({
  orderId,
  onClose,
  showBuyer,
}: {
  orderId: string;
  onClose: () => void;
  showBuyer?: boolean;
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

  const { order, items, buyer } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto card-shadow">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="font-bold text-lg">{order.orderNumber}</h2>
            {showBuyer && buyer && (
              <p className="text-sm text-slate-500">
                Buyer: {buyer.name} · {buyer.email}
              </p>
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
                <th className="pb-2">Buyer ordered</th>
                <th className="pb-2">Converted (base)</th>
                <th className="pb-2">Rate / base</th>
                <th className="pb-2 text-right">INR</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const orderedUnit = item.orderedUnit as DisplayUnit;
                const baseUnit = item.productBaseUnit as DisplayUnit;
                return (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-3">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-slate-400">{item.productSku}</p>
                    </td>
                    <td className="py-3">
                      {formatQuantity(item.orderedQuantity, orderedUnit)}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1 text-teal-800">
                        <span className="text-slate-400 text-xs">
                          {item.orderedQuantity} {unitLabel(orderedUnit)}
                        </span>
                        <ArrowRight className="h-3 w-3 shrink-0" />
                        <span className="font-medium">
                          {formatQuantity(item.quantityInBase, baseUnit)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-xs whitespace-nowrap">
                      {formatInr(item.pricePerBaseUnit)}/
                      {baseUnit === "unit" ? "item" : baseUnit}
                    </td>
                    <td className="py-3 text-right font-medium">
                      {formatInr(item.lineTotalInr)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-slate-500 border-t pt-3">
            Line total = quantity in base unit × price per base unit (INR). Conversions:
            kg↔g and L↔mL use factor 1000.
          </p>
        </div>
      </div>
    </div>
  );
}
