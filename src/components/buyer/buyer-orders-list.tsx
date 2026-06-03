"use client";

import { useState } from "react";
import type { Order } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/units";
import { OrderDetailModal } from "@/components/orders/order-detail-modal";

export function BuyerOrdersList({ orders }: { orders: Order[] }) {
  const [detailId, setDetailId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My orders &amp; quotations</h1>
        <p className="text-sm text-slate-500">
          Each line shows units ordered and quantities converted to base storage units
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No orders yet. Browse the catalog to place one.
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex flex-row justify-between">
              <div>
                <CardTitle className="font-mono text-base">{order.orderNumber}</CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(order.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="text-right">
                <Badge>{order.status}</Badge>
                <p className="text-xl font-bold mt-2">{formatInr(order.totalInr)}</p>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" onClick={() => setDetailId(order.id)}>
                View conversion details
              </Button>
            </CardContent>
          </Card>
        ))
      )}

      {detailId && (
        <OrderDetailModal orderId={detailId} onClose={() => setDetailId(null)} />
      )}
    </div>
  );
}
