"use client";

import { useEffect, useState } from "react";
import Decimal from "decimal.js";
import { ShoppingCart, FileText, Send } from "lucide-react";
import type { CartLine } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateLineTotalInr,
  formatInr,
  toBaseQuantity,
  formatQuantity,
  type DisplayUnit,
} from "@/lib/units";

export function CartPanel({
  cart,
  onRemove,
  onSubmitQuotation,
  onSubmitOrder,
  submitting,
}: {
  cart: CartLine[];
  onRemove: (productId: string) => void;
  onSubmitQuotation: () => void;
  onSubmitOrder: () => void;
  submitting: boolean;
}) {
  const [total, setTotal] = useState(new Decimal(0));

  useEffect(() => {
    let t = new Decimal(0);
    for (const line of cart) {
      t = t.plus(
        calculateLineTotalInr(
          line.quantity,
          line.unit,
          line.baseUnit as DisplayUnit,
          line.pricePerBaseUnit
        )
      );
    }
    setTotal(t);
  }, [cart]);

  return (
    <Card className="sticky top-4 border-teal-100">
      <CardHeader className="bg-teal-50/50">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingCart className="h-5 w-5" />
          Your cart ({cart.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cart.length === 0 ? (
          <p className="text-sm text-slate-500">
            Add products with your chosen quantity and unit. Conversions apply at checkout.
          </p>
        ) : (
          <ul className="space-y-3 max-h-72 overflow-auto">
            {cart.map((line) => {
              const baseUnit = line.baseUnit as DisplayUnit;
              const baseQty = toBaseQuantity(line.quantity, line.unit, baseUnit);
              const lineTotal = calculateLineTotalInr(
                line.quantity,
                line.unit,
                baseUnit,
                line.pricePerBaseUnit
              );
              return (
                <li
                  key={line.productId}
                  className="text-sm border-b border-slate-100 pb-3"
                >
                  <p className="font-medium">{line.name}</p>
                  <p className="text-slate-600 mt-0.5">
                    {line.quantity} {line.unit === "unit" ? "items" : line.unit}
                  </p>
                  <p className="text-xs text-teal-700 mt-0.5">
                    → {formatQuantity(baseQty, baseUnit)} (stored)
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-semibold text-teal-800">
                      {formatInr(lineTotal)}
                    </span>
                    <button
                      type="button"
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => onRemove(line.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="border-t pt-3">
          <p className="flex justify-between font-bold text-lg">
            <span>Total (INR)</span>
            <span className="text-teal-800">{formatInr(total)}</span>
          </p>
        </div>
        <div className="space-y-2">
          <Button
            className="w-full"
            variant="outline"
            disabled={cart.length === 0 || submitting}
            onClick={onSubmitQuotation}
          >
            <FileText className="h-4 w-4" />
            Request quotation
          </Button>
          <Button
            className="w-full"
            disabled={cart.length === 0 || submitting}
            onClick={onSubmitOrder}
          >
            <Send className="h-4 w-4" />
            Place order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
