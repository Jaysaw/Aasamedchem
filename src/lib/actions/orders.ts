"use server";

import { revalidatePath } from "next/cache";
import { eq, desc, and, sql } from "drizzle-orm";
import Decimal from "decimal.js";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems, products, users } from "@/db/schema";
import { generateOrderNumber } from "@/lib/order-number";
import {
  calculateLineTotalInr,
  isUnitValidForDimension,
  toBaseQuantity,
  type DisplayUnit,
} from "@/lib/units";

const lineSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.string().regex(/^\d+(\.\d+)?$/),
  unit: z.enum(["g", "kg", "mL", "L", "unit"]),
});

const placeOrderSchema = z.object({
  lines: z.array(lineSchema).min(1),
  notes: z.string().optional(),
  asQuotation: z.boolean().optional(),
});

function revalidateOrderPaths() {
  revalidatePath("/buyer");
  revalidatePath("/buyer/orders");
  revalidatePath("/seller");
  revalidatePath("/seller/orders");
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function placeOrder(input: z.infer<typeof placeOrderSchema>) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "buyer") {
    throw new Error("Only buyers can place orders");
  }

  const parsed = placeOrderSchema.parse(input);
  let total = new Decimal(0);
  const itemRows: (typeof orderItems.$inferInsert)[] = [];

  for (const line of parsed.lines) {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, line.productId), eq(products.isActive, true)))
      .limit(1);

    if (!product) throw new Error(`Product not found: ${line.productId}`);

    const unit = line.unit as DisplayUnit;
    if (!isUnitValidForDimension(unit, product.dimension)) {
      throw new Error(`Unit ${unit} invalid for ${product.name}`);
    }

    const qty = new Decimal(line.quantity);
    if (qty.lte(0)) throw new Error("Quantity must be positive");

    const baseQty = toBaseQuantity(
      line.quantity,
      unit,
      product.baseUnit as DisplayUnit
    );

    const stock = new Decimal(product.stockQuantity);
    if (baseQty.gt(stock)) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    const lineTotal = calculateLineTotalInr(
      line.quantity,
      unit,
      product.baseUnit as DisplayUnit,
      product.pricePerBaseUnit
    );
    total = total.plus(lineTotal);

    itemRows.push({
      orderId: "",
      productId: product.id,
      orderedQuantity: line.quantity,
      orderedUnit: unit,
      quantityInBase: baseQty.toString(),
      pricePerBaseUnit: product.pricePerBaseUnit,
      lineTotalInr: lineTotal.toDecimalPlaces(4, Decimal.ROUND_HALF_UP).toString(),
      productName: product.name,
      productSku: product.sku,
      productBaseUnit: product.baseUnit,
    });
  }

  const orderNumber = generateOrderNumber();
  const status = parsed.asQuotation ? "quotation" : "pending";

  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      buyerId: session.user.id,
      status,
      totalInr: total.toDecimalPlaces(4, Decimal.ROUND_HALF_UP).toString(),
      notes: parsed.notes ?? null,
    })
    .returning();

  await db.insert(orderItems).values(
    itemRows.map((row) => ({ ...row, orderId: order.id }))
  );

  if (!parsed.asQuotation) {
    for (const row of itemRows) {
      await db
        .update(products)
        .set({
          stockQuantity: sql`${products.stockQuantity} - ${row.quantityInBase}::numeric`,
          updatedAt: new Date(),
        })
        .where(eq(products.id, row.productId));
    }
  }

  revalidateOrderPaths();
  return order;
}

export async function getAllOrders() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (session.user.role !== "admin" && session.user.role !== "seller") {
    throw new Error("Unauthorized");
  }

  return db
    .select({
      order: orders,
      buyerName: users.name,
      buyerEmail: users.email,
    })
    .from(orders)
    .innerJoin(users, eq(orders.buyerId, users.id))
    .orderBy(desc(orders.createdAt));
}

export async function getBuyerOrders() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "buyer") {
    throw new Error("Unauthorized");
  }

  return db
    .select()
    .from(orders)
    .where(eq(orders.buyerId, session.user.id))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderWithItems(orderId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return null;

  const role = session.user.role;
  if (
    role === "buyer" &&
    order.buyerId !== session.user.id
  ) {
    throw new Error("Unauthorized");
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  let buyer = null;
  if (role === "admin" || role === "seller") {
    const [u] = await db.select().from(users).where(eq(users.id, order.buyerId)).limit(1);
    buyer = u ?? null;
  }

  return { order, items, buyer };
}

export async function updateOrderStatus(
  orderId: string,
  status: "approved" | "rejected" | "fulfilled" | "cancelled" | "pending"
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const role = session.user.role;

  if (status === "fulfilled" && role === "seller") {
    const [updated] = await db
      .update(orders)
      .set({ status: "fulfilled", updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    revalidateOrderPaths();
    return updated;
  }

  if (role !== "admin") throw new Error("Only admin can approve or reject orders");

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error("Order not found");

  if (status === "approved" && order.status === "quotation") {
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    for (const item of items) {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);
      if (!product) continue;

      const stock = new Decimal(product.stockQuantity);
      const needed = new Decimal(item.quantityInBase);
      if (needed.gt(stock)) {
        throw new Error(`Cannot approve: insufficient stock for ${item.productName}`);
      }

      await db
        .update(products)
        .set({
          stockQuantity: sql`${products.stockQuantity} - ${item.quantityInBase}::numeric`,
          updatedAt: new Date(),
        })
        .where(eq(products.id, item.productId));
    }
  }

  const [updated] = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning();

  revalidateOrderPaths();
  return updated;
}
