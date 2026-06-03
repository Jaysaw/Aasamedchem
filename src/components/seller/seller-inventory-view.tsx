import type { Product } from "@/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatInr,
  formatQuantity,
  fromBaseQuantity,
  pricePerDisplayUnit,
  unitsForDimension,
  type DisplayUnit,
  type Dimension,
} from "@/lib/units";

export function SellerInventoryView({ products }: { products: Product[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory (read-only)</h1>
        <p className="text-sm text-slate-500">
          Stock and rates in base units with equivalents in all orderable units
        </p>
      </div>

      <div className="grid gap-4">
        {products.map((p) => {
          const base = p.baseUnit as DisplayUnit;
          const dim = p.dimension as Dimension;
          const altUnits = unitsForDimension(dim).filter((u) => u !== base);

          return (
            <Card key={p.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="text-xs font-mono text-slate-500">{p.sku}</p>
                    <div className="flex gap-2 mt-2">
                      {p.category && <Badge variant="secondary">{p.category}</Badge>}
                      <Badge variant="outline">{p.dimension}</Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium text-teal-800">
                      Stock: {formatQuantity(fromBaseQuantity(p.stockQuantity, base, base), base)}
                    </p>
                    <p className="text-slate-500">
                      Rate: {formatInr(p.pricePerBaseUnit)} / {base === "unit" ? "item" : base}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  {altUnits.map((u) => (
                    <div key={u} className="rounded bg-slate-50 px-3 py-2">
                      <span className="font-medium">{u === "unit" ? "items" : u}: </span>
                      {formatQuantity(
                        fromBaseQuantity(p.stockQuantity, u, base),
                        u
                      )}{" "}
                      · {formatInr(pricePerDisplayUnit(p.pricePerBaseUnit, u, base))} each
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
