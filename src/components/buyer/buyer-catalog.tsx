"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen } from "lucide-react";
import type { Product } from "@/db/schema";
import type { CartLine } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ProductOrderCard } from "@/components/buyer/product-order-card";
import { CartPanel } from "@/components/buyer/cart-panel";
import { placeOrder } from "@/lib/actions/orders";
import { CONVERSION_REFERENCE } from "@/lib/units";

export function BuyerCatalog({
  products,
  categories,
  initialFilters,
}: {
  products: Product[];
  categories: string[];
  initialFilters: { q: string; category: string; dimension: string };
}) {
  const router = useRouter();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [filters, setFilters] = useState(initialFilters);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  function applyFilters() {
    const p = new URLSearchParams();
    if (filters.q) p.set("q", filters.q);
    if (filters.category) p.set("category", filters.category);
    if (filters.dimension) p.set("dimension", filters.dimension);
    router.push(`/buyer?${p.toString()}`);
  }

  const addToCart = useCallback((line: CartLine) => {
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.productId === line.productId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = line;
        return next;
      }
      return [...prev, line];
    });
    setMessage(`${line.name} added — ${line.quantity} ${line.unit === "unit" ? "items" : line.unit}`);
  }, []);

  async function submit(asQuotation: boolean) {
    if (cart.length === 0) return;
    setSubmitting(true);
    setMessage("");
    try {
      const order = await placeOrder({
        lines: cart.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unit: l.unit,
        })),
        asQuotation,
      });
      setCart([]);
      setMessage(
        `${asQuotation ? "Quotation" : "Order"} ${order.orderNumber} submitted successfully`
      );
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Buyer catalog</h1>
          <p className="text-sm text-slate-500">
            Order in grams, kg, liters, mL, or item counts — see live INR totals and conversions
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowGuide(!showGuide)}>
          <BookOpen className="h-4 w-4" />
          Unit guide
        </Button>
      </div>

      {showGuide && (
        <Card className="bg-slate-50">
          <CardContent className="p-4 text-sm space-y-2">
            <p className="font-medium">How quantities are converted</p>
            <ul className="list-disc pl-5 text-slate-600 space-y-1">
              <li>Weight products are stored in <strong>grams (g)</strong> — 1 kg = 1000 g</li>
              <li>Volume products are stored in <strong>milliliters (mL)</strong> — 1 L = 1000 mL</li>
              <li>Count products use <strong>items</strong></li>
              <li>Line total = (quantity in base unit) × (INR price per base unit)</li>
            </ul>
            <p className="text-xs text-slate-500 pt-2">
              {CONVERSION_REFERENCE.map((r) => `${r.from}→${r.to}: ×${r.factor}`).join(" · ")}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search name, SKU, category…"
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              />
            </div>
            <select
              className="h-10 rounded-md border px-3 text-sm"
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border px-3 text-sm"
              value={filters.dimension}
              onChange={(e) => setFilters((f) => ({ ...f, dimension: e.target.value }))}
            >
              <option value="">All dimensions</option>
              <option value="weight">Weight (g / kg)</option>
              <option value="volume">Volume (mL / L)</option>
              <option value="count">Count (items)</option>
            </select>
            <Button onClick={applyFilters}>Filter</Button>
          </div>
        </CardContent>
      </Card>

      {message && (
        <div className="rounded-lg bg-teal-50 text-teal-900 px-4 py-3 text-sm border border-teal-100">
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <p className="text-xs text-slate-500">{products.length} products</p>
          {products.length === 0 ? (
            <p className="text-slate-500 text-center py-12">No products match your filters.</p>
          ) : (
            products.map((p) => (
              <ProductOrderCard key={p.id} product={p} onAddToCart={addToCart} />
            ))
          )}
        </div>
        <div className="lg:col-span-1">
          <CartPanel
            cart={cart}
            onRemove={(id) => setCart((c) => c.filter((l) => l.productId !== id))}
            onSubmitQuotation={() => submit(true)}
            onSubmitOrder={() => submit(false)}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
