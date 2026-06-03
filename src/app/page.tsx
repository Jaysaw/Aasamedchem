import Link from "next/link";
import { FlaskConical, ArrowRight, Shield, ShoppingBag } from "lucide-react";
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
            Multi-unit pricing in INR, precise conversions across weight, volume, and
            count — built for admins and sellers.
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

      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-teal-700">
              <Shield className="h-5 w-5" />
              <CardTitle>Admin console</CardTitle>
            </div>
            <CardDescription>
              Manage products, stock, base pricing, and review quotations with full unit
              breakdown.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <p>• CRUD products with g, kg, L, mL, and item units</p>
            <p>• View inventory and low-stock alerts</p>
            <p>• Approve or reject seller quotations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-teal-700">
              <ShoppingBag className="h-5 w-5" />
              <CardTitle>Seller portal</CardTitle>
            </div>
            <CardDescription>
              Search catalog, order in any supported unit, and see live INR totals.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <p>• Filter by category and dimension</p>
            <p>• Real-time price from rate × quantity</p>
            <p>• Submit quotations or firm orders</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
