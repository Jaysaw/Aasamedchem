"use client";

import { ArrowRight, Scale } from "lucide-react";
import type { DisplayUnit, Dimension } from "@/lib/units";
import { CONVERSION_REFERENCE } from "@/lib/units";

type Preview = {
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

export function UnitConversionPanel({
  preview,
  dimension,
  loading,
}: {
  preview: Preview | null;
  dimension: Dimension;
  loading?: boolean;
}) {
  const refs = CONVERSION_REFERENCE.filter((r) => {
    if (dimension === "weight") return r.from === "kg" || r.from === "g";
    if (dimension === "volume") return r.from === "L" || r.from === "mL";
    return r.from === "items";
  });

  if (loading) {
    return (
      <div className="rounded-lg border border-dashed border-teal-200 bg-teal-50/30 p-4 text-sm text-teal-800 animate-pulse">
        Calculating conversions…
      </div>
    );
  }

  if (!preview) return null;

  return (
    <div className="rounded-lg border border-teal-200 bg-gradient-to-br from-teal-50 to-slate-50 p-4 space-y-4">
      <div className="flex items-start gap-2">
        <Scale className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-teal-900">Conversion breakdown</p>
          <p className="text-xs text-teal-800 mt-1 font-mono">{preview.formula}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-md bg-white px-2 py-1 border">
          Stored as: <strong>{preview.quantityInBaseFormatted}</strong>
        </span>
        <ArrowRight className="h-4 w-4 text-teal-600" />
        <span className="rounded-md bg-teal-700 text-white px-3 py-1 font-bold">
          Total: {preview.lineTotalFormatted}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="pb-2 pr-3">Unit</th>
              <th className="pb-2 pr-3">Same order as</th>
              <th className="pb-2 pr-3">Rate (INR)</th>
              <th className="pb-2 text-right">Line total</th>
            </tr>
          </thead>
          <tbody>
            {preview.conversionTable.map((row) => (
              <tr key={row.unit} className="border-b border-teal-100/80">
                <td className="py-2 pr-3 font-medium">{row.unitLabel}</td>
                <td className="py-2 pr-3">
                  {row.quantityEquivalent} {row.unitLabel}
                </td>
                <td className="py-2 pr-3">{row.pricePerUnitFormatted}</td>
                <td className="py-2 text-right font-medium">{row.lineTotalFormatted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {preview.stockByUnit.length > 0 && (
        <div className="text-xs text-slate-600">
          <span className="font-medium">Available stock: </span>
          {preview.stockByUnit
            .map((s) => `${s.quantity} ${s.unit === "unit" ? "items" : s.unit}`)
            .join(" · ")}
        </div>
      )}

      <p className="text-[10px] text-slate-500">
        Reference: {refs.map((r) => `1 ${r.from} = ${r.factor} ${r.to}`).join(" · ")}
      </p>
    </div>
  );
}
