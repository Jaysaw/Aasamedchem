import Link from "next/link";
import { FlaskConical, ArrowRight, Shield, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="gradient-hero text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-6">
            <FlaskConical className="h-10 w-10 text-teal-200" />
            <span className="text-sm font-semibold tracking-widest uppercase text-teal-200">
              AasaMedChem
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold max-w-2xl leading-tight">
            Inventory &amp; order management for pharmaceutical supply
          </h1>
          <p className="mt-4 text-teal-100 max-w-xl text-lg">
            Three roles — Admin, Seller, and Buyer — with multi-unit ordering (g, kg, L, mL,
            items), live INR pricing, and full conversion transparency.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-white text-teal-900 hover:bg-teal-50">
              <Link href="/login">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-teal-700">
              <Shield className="h-5 w-5" />
              <CardTitle>Admin</CardTitle>
            </div>
            <CardDescription>
              Products, pricing, stock, and order approval with conversion audit.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-1">
            <p>• CRUD products &amp; base units</p>
            <p>• Approve buyer quotations</p>
            <p>• Low-stock dashboard</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-teal-700">
              <Truck className="h-5 w-5" />
              <CardTitle>Seller</CardTitle>
            </div>
            <CardDescription>
              Fulfillment — view buyer orders, verify units, mark shipped.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-1">
            <p>• Buyer order pipeline</p>
            <p>• Read-only inventory in all units</p>
            <p>• Fulfill approved orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-teal-700">
              <ShoppingBag className="h-5 w-5" />
              <CardTitle>Buyer</CardTitle>
            </div>
            <CardDescription>
              Catalog, quantity in any unit, conversion tables, cart &amp; quotations.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-1">
            <p>• Quick qty presets (kg, L, …)</p>
            <p>• Live conversion breakdown</p>
            <p>• Request quote or place order</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
