"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProduct, updateProduct } from "@/lib/actions/products";
import type { Product } from "@/db/schema";

type Props = {
  product?: Product;
  onDone?: () => void;
};

export function ProductForm({ product, onDone }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get("name")),
      sku: String(fd.get("sku")),
      description: String(fd.get("description") || ""),
      category: String(fd.get("category") || ""),
      dimension: String(fd.get("dimension")) as "weight" | "volume" | "count",
      pricePerBaseUnit: String(fd.get("pricePerBaseUnit")),
      stockQuantity: String(fd.get("stockQuantity")),
      lowStockThreshold: String(fd.get("lowStockThreshold") || "0"),
    };

    try {
      if (product) {
        await updateProduct(product.id, data);
      } else {
        await createProduct(data);
      }
      router.refresh();
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  const baseHint =
    product?.dimension === "volume"
      ? "mL"
      : product?.dimension === "count"
        ? "items"
        : "g";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={product?.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={product?.sku} required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" defaultValue={product?.description ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={product?.category ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dimension">Dimension</Label>
          <select
            id="dimension"
            name="dimension"
            defaultValue={product?.dimension ?? "weight"}
            className="flex h-10 w-full rounded-md border border-[var(--color-input)] bg-white px-3 text-sm"
            disabled={!!product}
          >
            <option value="weight">Weight (base: g)</option>
            <option value="volume">Volume (base: mL)</option>
            <option value="count">Count (base: items)</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pricePerBaseUnit">
            Price per base unit (INR/{product?.baseUnit ?? baseHint})
          </Label>
          <Input
            id="pricePerBaseUnit"
            name="pricePerBaseUnit"
            type="text"
            inputMode="decimal"
            defaultValue={product?.pricePerBaseUnit ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stockQuantity">Stock (in base units)</Label>
          <Input
            id="stockQuantity"
            name="stockQuantity"
            type="text"
            inputMode="decimal"
            defaultValue={product?.stockQuantity ?? "0"}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lowStockThreshold">Low stock threshold</Label>
          <Input
            id="lowStockThreshold"
            name="lowStockThreshold"
            type="text"
            defaultValue={product?.lowStockThreshold ?? "0"}
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading}>
        {product ? "Update product" : "Create product"}
      </Button>
    </form>
  );
}
