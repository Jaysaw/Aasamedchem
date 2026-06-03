"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Order } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateOrderStatus } from "@/lib/actions/orders";
import { formatInr } from "@/lib/units";
import { OrderDetailModal } from "@/components/orders/order-detail-modal";

type Row = {
  order: Order;
  buyerName: string;
  buyerEmail: string;
};

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "danger"> = {
  quotation: "warning",
  pending: "secondary",
  approved: "success",
  rejected: "danger",
  fulfilled: "success",
  cancelled: "danger",
};

export function AdminOrdersList({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleStatus(
    orderId: string,
    status: "approved" | "rejected" | "fulfilled" | "cancelled"
  ) {
    setLoading(orderId);
    try {
      await updateOrderStatus(orderId, status);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders &amp; quotations</h1>
        <p className="text-sm text-slate-500">
          Review units, base quantities, and INR totals for verification
        </p>
      </div>

      <div className="space-y-4">
        {rows.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              No orders yet.
            </CardContent>
          </Card>
        ) : (
          rows.map(({ order, buyerName, buyerEmail }) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="font-mono text-base">{order.orderNumber}</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Buyer: {buyerName} · {buyerEmail}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(order.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={statusVariant[order.status] ?? "secondary"}>
                    {order.status}
                  </Badge>
                  <p className="text-xl font-bold mt-2">{formatInr(order.totalInr)}</p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setDetailId(order.id)}>
                  View details
                </Button>
                {(order.status === "quotation" || order.status === "pending") && (
                  <>
                    <Button
                      size="sm"
                      disabled={loading === order.id}
                      onClick={() => handleStatus(order.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={loading === order.id}
                      onClick={() => handleStatus(order.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {order.status === "approved" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleStatus(order.id, "fulfilled")}
                  >
                    Mark fulfilled
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {detailId && (
        <OrderDetailModal orderId={detailId} onClose={() => setDetailId(null)} showBuyer />
      )}
    </div>
  );
}
