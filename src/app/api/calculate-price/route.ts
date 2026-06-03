import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { products } from "@/db/schema";
import {
  calculateLineTotalInr,
  formatInr,
  fromBaseQuantity,
  isUnitValidForDimension,
  pricePerDisplayUnit,
  toBaseQuantity,
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
    if (!isUnitValidForDimension(unit, product.dimension)) {
      return NextResponse.json({ error: "Invalid unit for product" }, { status: 400 });
    }

    const baseUnit = product.baseUnit as DisplayUnit;
    const lineTotal = calculateLineTotalInr(
      body.quantity,
      unit,
      baseUnit,
      product.pricePerBaseUnit
    );
    const baseQty = toBaseQuantity(body.quantity, unit, baseUnit);
    const unitPrice = pricePerDisplayUnit(
      product.pricePerBaseUnit,
      unit,
      baseUnit
    );

    return NextResponse.json({
      lineTotalInr: lineTotal.toString(),
      lineTotalFormatted: formatInr(lineTotal),
      unitPriceInr: unitPrice.toString(),
      unitPriceFormatted: formatInr(unitPrice),
      quantityInBase: baseQty.toString(),
      quantityInBaseFormatted: fromBaseQuantity(
        baseQty.toString(),
        baseUnit,
        baseUnit
      ).toString(),
      baseUnit: product.baseUnit,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
