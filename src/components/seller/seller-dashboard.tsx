import Decimal from "decimal.js";
import Link from "next/link";
import { ClipboardList, Package, Truck } from "lucide-react";
import type { Order } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/units";
import { SellerFulfillmentList } from "@/components/seller/seller-fulfillment-list";

type Row = { order: Order; buyerName: string; buyerEmail: string };

export function SellerDashboard({
  orders,
  productCount,
}: {
  orders: Row[];
  productCount: number;
}) {
  const pending = orders.filter(
    (o) => o.order.status === "pending" || o.order.status === "quotation"
  );
  const approved = orders.filter((o) => o.order.status === "approved");

  const totalValue = orders.reduce(
    (s, o) => s.plus(o.order.totalInr),
    new Decimal(0)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Seller dashboard</h1>
        <p className="text-sm text-slate-500">
          Fulfill buyer orders — verify quantities and unit conversions before shipping
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Active SKUs</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-bold">{productCount}</span>
            <Package className="h-8 w-8 text-teal-600 opacity-60" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Awaiting action</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-bold text-amber-700">{pending.length}</span>
            <ClipboardList className="h-8 w-8 text-amber-600 opacity-60" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Ready to ship</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-bold text-teal-700">{approved.length}</span>
            <Truck className="h-8 w-8 text-teal-600 opacity-60" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Order pipeline</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Total order value: {formatInr(totalValue)}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/seller/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <SellerFulfillmentList rows={orders.slice(0, 5)} />
        </CardContent>
      </Card>
    </div>
  );
}
