"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/db/schema";
import type { CartLine } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  unitsForDimension,
  formatInr,
  pricePerDisplayUnit,
  type DisplayUnit,
  type Dimension,
} from "@/lib/units";

export function ProductOrderCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (line: CartLine) => void;
}) {
  const units = unitsForDimension(product.dimension as Dimension);
  const [unit, setUnit] = useState<DisplayUnit>(units[0]);
  const [quantity, setQuantity] = useState("1");
  const [preview, setPreview] = useState<{
    lineTotalFormatted: string;
    unitPriceFormatted: string;
    quantityInBase: string;
  } | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!quantity || Number(quantity) <= 0) {
        setPreview(null);
        return;
      }
      try {
        const res = await fetch("/api/calculate-price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            quantity,
            unit,
          }),
        });
        const data = await res.json();
        if (res.ok) setPreview(data);
        else setPreview(null);
      } catch {
        setPreview(null);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [product.id, quantity, unit]);

  const base = product.baseUnit as DisplayUnit;
  const displayPrice = pricePerDisplayUnit(
    product.pricePerBaseUnit,
    unit,
    base
  );

  function handleAdd() {
    onAddToCart({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      dimension: product.dimension,
      baseUnit: product.baseUnit,
      pricePerBaseUnit: product.pricePerBaseUnit,
      quantity,
      unit,
    });
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{product.sku}</p>
            <div className="flex gap-2 mt-2">
              {product.category && (
                <Badge variant="secondary">{product.category}</Badge>
              )}
              <Badge variant="outline">{product.dimension}</Badge>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="text-teal-800 font-semibold">
              {formatInr(displayPrice)} / {unit === "unit" ? "item" : unit}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Stock in base: {product.stockQuantity} {product.baseUnit === "unit" ? "items" : product.baseUnit}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Quantity</label>
            <Input
              type="text"
              inputMode="decimal"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-28"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Unit</label>
            <select
              className="h-10 rounded-md border px-3 text-sm"
              value={unit}
              onChange={(e) => setUnit(e.target.value as DisplayUnit)}
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u === "unit" ? "items" : u}
                </option>
              ))}
            </select>
          </div>
          {preview && (
            <div className="flex-1 min-w-[180px] rounded-lg bg-teal-50 px-3 py-2 text-sm">
              <p>
                Line total:{" "}
                <span className="font-bold text-teal-900">
                  {preview.lineTotalFormatted}
                </span>
              </p>
              <p className="text-xs text-teal-700 mt-0.5">
                = {preview.quantityInBase} {product.baseUnit === "unit" ? "items" : product.baseUnit} × base rate
              </p>
            </div>
          )}
          <Button onClick={handleAdd}>Add to cart</Button>
        </div>
      </CardContent>
    </Card>
  );
}
