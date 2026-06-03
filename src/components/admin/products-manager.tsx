"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import type { Product } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductForm } from "@/components/admin/product-form";
import { deleteProduct } from "@/lib/actions/products";
import {
  formatInr,
  formatQuantity,
  fromBaseQuantity,
  pricePerDisplayUnit,
  type DisplayUnit,
} from "@/lib/units";

export function ProductsManager({ initialProducts }: { initialProducts: Product[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-slate-500">
            Base prices stored per canonical unit (g, mL, or items)
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </div>

      {(showForm || editing) && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Edit product" : "New product"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm
              product={editing ?? undefined}
              onDone={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {initialProducts.map((p) => {
          const base = p.baseUnit as DisplayUnit;
          const kgPrice =
            p.dimension === "weight"
              ? pricePerDisplayUnit(p.pricePerBaseUnit, "kg", base)
              : null;
          const LPrice =
            p.dimension === "volume"
              ? pricePerDisplayUnit(p.pricePerBaseUnit, "L", base)
              : null;

          return (
            <Card key={p.id} className={!p.isActive ? "opacity-60" : ""}>
              <CardContent className="p-6">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{p.name}</h3>
                      <Badge variant="outline">{p.sku}</Badge>
                      {!p.isActive && <Badge variant="danger">Inactive</Badge>}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{p.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {p.category && <Badge variant="secondary">{p.category}</Badge>}
                      <Badge>{p.dimension}</Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm space-y-1">
                    <p>
                      Base rate: {formatInr(p.pricePerBaseUnit)} / {base === "unit" ? "item" : base}
                    </p>
                    {kgPrice && (
                      <p className="text-slate-500">≈ {formatInr(kgPrice)} / kg</p>
                    )}
                    {LPrice && <p className="text-slate-500">≈ {formatInr(LPrice)} / L</p>}
                    <p className="font-medium">
                      Stock:{" "}
                      {formatQuantity(
                        fromBaseQuantity(p.stockQuantity, base, base),
                        base
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(p);
                      setShowForm(false);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Button>
                  {p.isActive && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        if (confirm("Deactivate this product?")) {
                          await deleteProduct(p.id);
                          window.location.reload();
                        }
                      }}
                    >
                      Deactivate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
