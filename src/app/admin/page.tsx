import Decimal from "decimal.js";
import { eq, sql } from "drizzle-orm";
import { Package, ClipboardList, AlertTriangle, IndianRupee } from "lucide-react";
import { db } from "@/db";
import { products, orders } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatInr, formatQuantity, fromBaseQuantity, type DisplayUnit } from "@/lib/units";

export default async function AdminDashboardPage() {
  const allProducts = await db.select().from(products).where(eq(products.isActive, true));
  const recentOrders = await db.select().from(orders).orderBy(sql`${orders.createdAt} DESC`).limit(5);

  const lowStock = allProducts.filter((p) =>
    new Decimal(p.stockQuantity).lte(new Decimal(p.lowStockThreshold))
  );

  const pendingCount = recentOrders.filter(
    (o) => o.status === "pending" || o.status === "quotation"
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-[var(--color-muted-foreground)]">
          Overview of inventory, orders, and alerts
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active products</CardTitle>
            <Package className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{allProducts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Open orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Low stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-700">{lowStock.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Recent order value</CardTitle>
            <IndianRupee className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatInr(
                recentOrders.reduce((s, o) => s.plus(o.totalInr), new Decimal(0))
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-amber-900">Low stock alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between text-sm">
                  <span className="font-medium">{p.name}</span>
                  <span>
                    {formatQuantity(
                      fromBaseQuantity(p.stockQuantity, p.baseUnit as DisplayUnit, p.baseUnit as DisplayUnit),
                      p.baseUnit as DisplayUnit
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="pb-2 pr-4">Order #</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Total</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-mono text-xs">{o.orderNumber}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={o.status === "approved" ? "success" : "secondary"}>
                          {o.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">{formatInr(o.totalInr)}</td>
                      <td className="py-3 text-slate-500">
                        {new Date(o.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
