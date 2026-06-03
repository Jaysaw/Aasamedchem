import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { products } from "@/db/schema";
import {
  buildConversionBreakdown,
  formatInr,
  isUnitValidForDimension,
  pricePerDisplayUnit,
  stockInUnit,
  unitsForDimension,
  type Dimension,
  type DisplayUnit,
} from "@/lib/units";

const schema = z.object({
  productId: z.string().uuid(),
  quantity: z.string(),
  unit: z.enum(["g", "kg", "mL", "L", "unit"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, body.productId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const unit = body.unit as DisplayUnit;
    const dimension = product.dimension as Dimension;
    if (!isUnitValidForDimension(unit, dimension)) {
      return NextResponse.json({ error: "Invalid unit for product" }, { status: 400 });
    }

    const baseUnit = product.baseUnit as DisplayUnit;
    const breakdown = buildConversionBreakdown(
      body.quantity,
      unit,
      baseUnit,
      dimension,
      product.pricePerBaseUnit
    );

    const unitPrice = pricePerDisplayUnit(
      product.pricePerBaseUnit,
      unit,
      baseUnit
    );

    const stockByUnit = unitsForDimension(dimension).map((u) => ({
      unit: u,
      quantity: stockInUnit(product.stockQuantity, u, baseUnit),
    }));

    return NextResponse.json({
      lineTotalInr: breakdown.selectedLineTotal,
      lineTotalFormatted: breakdown.selectedLineTotalFormatted,
      unitPriceInr: unitPrice.toString(),
      unitPriceFormatted: formatInr(unitPrice),
      quantityInBase: breakdown.baseQuantity,
      quantityInBaseFormatted: breakdown.baseQuantityFormatted,
      baseUnit: product.baseUnit,
      formula: breakdown.formula,
      conversionTable: breakdown.units,
      stockByUnit,
      availableUnits: unitsForDimension(dimension),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
