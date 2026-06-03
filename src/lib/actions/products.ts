"use server";

import { revalidatePath } from "next/cache";
import { eq, and, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { products } from "@/db/schema";
import {
  BASE_UNIT_BY_DIMENSION,
  type Dimension,
  type DisplayUnit,
} from "@/lib/units";

const productSchema = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().min(1).max(64),
  description: z.string().optional(),
  category: z.string().optional(),
  dimension: z.enum(["weight", "volume", "count"]),
  pricePerBaseUnit: z.string().regex(/^\d+(\.\d+)?$/),
  stockQuantity: z.string().regex(/^\d+(\.\d+)?$/),
  lowStockThreshold: z.string().regex(/^\d+(\.\d+)?$/).optional(),
});

export async function getProducts(filters?: {
  q?: string;
  category?: string;
  dimension?: string;
  activeOnly?: boolean;
}) {
  const conditions = [];

  if (filters?.q) {
    const term = `%${filters.q}%`;
    conditions.push(
      or(
        ilike(products.name, term),
        ilike(products.sku, term),
        ilike(products.category, term)
      )!
    );
  }
  if (filters?.category) {
    conditions.push(eq(products.category, filters.category));
  }
  if (filters?.dimension) {
    conditions.push(
      eq(products.dimension, filters.dimension as "weight" | "volume" | "count")
    );
  }
  if (filters?.activeOnly !== false) {
    conditions.push(eq(products.isActive, true));
  }

  return db
    .select()
    .from(products)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(products.name);
}

export async function getProductById(id: string) {
  const [p] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return p ?? null;
}

export async function getCategories() {
  const rows = await db
    .selectDistinct({ category: products.category })
    .from(products)
    .where(sql`${products.category} IS NOT NULL`);
  return rows.map((r) => r.category).filter(Boolean) as string[];
}

export async function createProduct(data: z.infer<typeof productSchema>) {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("Unauthorized");

  const parsed = productSchema.parse(data);
  const baseUnit = BASE_UNIT_BY_DIMENSION[parsed.dimension as Dimension] as DisplayUnit;

  const [created] = await db
    .insert(products)
    .values({
      name: parsed.name,
      sku: parsed.sku.toUpperCase(),
      description: parsed.description ?? null,
      category: parsed.category ?? null,
      dimension: parsed.dimension,
      baseUnit,
      pricePerBaseUnit: parsed.pricePerBaseUnit,
      stockQuantity: parsed.stockQuantity,
      lowStockThreshold: parsed.lowStockThreshold ?? "0",
    })
    .returning();

  revalidatePath("/admin/products");
  revalidatePath("/seller");
  return created;
}

export async function updateProduct(
  id: string,
  data: Partial<z.infer<typeof productSchema>> & { isActive?: boolean }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("Unauthorized");

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (data.name) updates.name = data.name;
  if (data.sku) updates.sku = data.sku.toUpperCase();
  if (data.description !== undefined) updates.description = data.description;
  if (data.category !== undefined) updates.category = data.category;
  if (data.pricePerBaseUnit) updates.pricePerBaseUnit = data.pricePerBaseUnit;
  if (data.stockQuantity) updates.stockQuantity = data.stockQuantity;
  if (data.lowStockThreshold) updates.lowStockThreshold = data.lowStockThreshold;
  if (data.isActive !== undefined) updates.isActive = data.isActive;

  if (data.dimension) {
    updates.dimension = data.dimension;
    updates.baseUnit = BASE_UNIT_BY_DIMENSION[data.dimension as Dimension];
  }

  const [updated] = await db
    .update(products)
    .set(updates)
    .where(eq(products.id, id))
    .returning();

  revalidatePath("/admin/products");
  revalidatePath("/seller");
  return updated;
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("Unauthorized");

  await db.update(products).set({ isActive: false, updatedAt: new Date() }).where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/seller");
}

export async function adjustStock(id: string, deltaBase: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("Unauthorized");

  await db
    .update(products)
    .set({
      stockQuantity: sql`${products.stockQuantity} + ${deltaBase}::numeric`,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));

  revalidatePath("/admin");
  revalidatePath("/admin/products");
}
