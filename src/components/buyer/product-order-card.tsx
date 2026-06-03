"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/db/schema";
import type { CartLine } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UnitConversionPanel } from "@/components/buyer/unit-conversion-panel";
import {
  QUANTITY_PRESETS,
  unitsForDimension,
  formatInr,
  pricePerDisplayUnit,
  type DisplayUnit,
  type Dimension,
} from "@/lib/units";

type PricePreview = {
  formula: string;
  quantityInBaseFormatted: string;
  lineTotalFormatted: string;
  conversionTable: {
    unit: DisplayUnit;
    unitLabel: string;
    quantityEquivalent: string;
    pricePerUnitFormatted: string;
    lineTotalFormatted: string;
  }[];
  stockByUnit: { unit: DisplayUnit; quantity: string }[];
};

export function ProductOrderCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (line: CartLine) => void;
}) {
  const dimension = product.dimension as Dimension;
  const units = unitsForDimension(dimension);
  const [unit, setUnit] = useState<DisplayUnit>(units[0]);
  const [quantity, setQuantity] = useState("1");
  const [preview, setPreview] = useState<PricePreview | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!quantity || Number(quantity) <= 0) {
        setPreview(null);
        return;
      }
      setLoading(true);
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
        if (res.ok) {
          setPreview({
            formula: data.formula,
            quantityInBaseFormatted: data.quantityInBaseFormatted,
            lineTotalFormatted: data.lineTotalFormatted,
            conversionTable: data.conversionTable,
            stockByUnit: data.stockByUnit,
          });
        } else setPreview(null);
      } catch {
        setPreview(null);
      } finally {
        setLoading(false);
      }
    }, 280);
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

  const presets = QUANTITY_PRESETS[dimension];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-5 border-b bg-slate-50/50">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{product.sku}</p>
              {product.description && (
                <p className="text-sm text-slate-600 mt-2 max-w-xl">{product.description}</p>
              )}
              <div className="flex gap-2 mt-2">
                {product.category && (
                  <Badge variant="secondary">{product.category}</Badge>
                )}
                <Badge variant="outline">{product.dimension}</Badge>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="text-teal-800 font-semibold text-lg">
                {formatInr(displayPrice)}
              </p>
              <p className="text-xs text-slate-500">per {unit === "unit" ? "item" : unit}</p>
              <p className="text-xs text-slate-400 mt-1">
                Base: {formatInr(product.pricePerBaseUnit)} /{" "}
                {base === "unit" ? "item" : base}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-2">
              Quick quantities
            </label>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setQuantity(p.quantity);
                    setUnit(p.unit);
                  }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs hover:border-teal-400 hover:bg-teal-50 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Order quantity</label>
              <Input
                type="text"
                inputMode="decimal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-32"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Unit</label>
              <select
                className="h-10 rounded-md border px-3 text-sm min-w-[100px]"
                value={unit}
                onChange={(e) => setUnit(e.target.value as DisplayUnit)}
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u === "unit" ? "items (count)" : u}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleAdd} className="ml-auto">
              Add to cart
            </Button>
          </div>

          <UnitConversionPanel
            preview={preview}
            dimension={dimension}
            loading={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
