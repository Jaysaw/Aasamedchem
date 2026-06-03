import { loadEnv } from "../lib/load-env";

loadEnv();

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import Decimal from "decimal.js";
import * as schema from "../db/schema";
import { calculateLineTotalInr, toBaseQuantity, type DisplayUnit } from "../lib/units";

const PRODUCTS: (typeof schema.products.$inferInsert)[] = [
  { name: "Paracetamol API", sku: "PCM-API-01", description: "High-purity paracetamol API for tablet manufacturing", category: "API", dimension: "weight", baseUnit: "g", pricePerBaseUnit: "0.85", stockQuantity: "500000", lowStockThreshold: "10000" },
  { name: "Ibuprofen Granules", sku: "IBU-GRN-02", description: "Ibuprofen granules BP grade", category: "API", dimension: "weight", baseUnit: "g", pricePerBaseUnit: "1.25", stockQuantity: "250000", lowStockThreshold: "5000" },
  { name: "Metformin HCl", sku: "MET-HCL-03", description: "Metformin hydrochloride powder", category: "API", dimension: "weight", baseUnit: "g", pricePerBaseUnit: "1.95", stockQuantity: "180000", lowStockThreshold: "8000" },
  { name: "Amoxicillin Trihydrate", sku: "AMX-TRI-04", description: "Broad-spectrum antibiotic API", category: "API", dimension: "weight", baseUnit: "g", pricePerBaseUnit: "3.40", stockQuantity: "120000", lowStockThreshold: "5000" },
  { name: "Caffeine Anhydrous", sku: "CAF-ANH-05", description: "Anhydrous caffeine USP", category: "API", dimension: "weight", baseUnit: "g", pricePerBaseUnit: "4.20", stockQuantity: "45000", lowStockThreshold: "2000" },
  { name: "Lactose Monohydrate", sku: "LAC-MON-06", description: "Pharmaceutical grade filler excipient", category: "Excipient", dimension: "weight", baseUnit: "g", pricePerBaseUnit: "0.18", stockQuantity: "800000", lowStockThreshold: "20000" },
  { name: "Magnesium Stearate", sku: "MGS-STR-07", description: "Lubricant for tablet compression", category: "Excipient", dimension: "weight", baseUnit: "g", pricePerBaseUnit: "0.55", stockQuantity: "150000", lowStockThreshold: "5000" },
  { name: "Saline Solution 0.9%", sku: "SAL-SOL-08", description: "Sterile isotonic saline", category: "Solution", dimension: "volume", baseUnit: "mL", pricePerBaseUnit: "0.02", stockQuantity: "1000000", lowStockThreshold: "50000" },
  { name: "Ethanol 96%", sku: "ETH-96-09", description: "Pharma-grade ethanol", category: "Solvent", dimension: "volume", baseUnit: "mL", pricePerBaseUnit: "0.08", stockQuantity: "500000", lowStockThreshold: "20000" },
  { name: "Glycerin USP", sku: "GLY-USP-10", description: "Humectant and solvent", category: "Solvent", dimension: "volume", baseUnit: "mL", pricePerBaseUnit: "0.12", stockQuantity: "300000", lowStockThreshold: "15000" },
  { name: "Propylene Glycol", sku: "PPG-PH-11", description: "Pharmaceutical propylene glycol", category: "Solvent", dimension: "volume", baseUnit: "mL", pricePerBaseUnit: "0.09", stockQuantity: "220000", lowStockThreshold: "10000" },
  { name: "Distilled Water", sku: "DW-PH-12", description: "Purified water for formulation", category: "Solution", dimension: "volume", baseUnit: "mL", pricePerBaseUnit: "0.005", stockQuantity: "2000000", lowStockThreshold: "100000" },
  { name: "Empty Hard Gelatin Capsules Size 0", sku: "CAP-HG-00", description: "Two-piece capsules size 0", category: "Packaging", dimension: "count", baseUnit: "unit", pricePerBaseUnit: "0.45", stockQuantity: "2000000", lowStockThreshold: "100000" },
  { name: "Empty Hard Gelatin Capsules Size 1", sku: "CAP-HG-01", description: "Two-piece capsules size 1", category: "Packaging", dimension: "count", baseUnit: "unit", pricePerBaseUnit: "0.38", stockQuantity: "1500000", lowStockThreshold: "80000" },
  { name: "Aluminium Foil Blister", sku: "BLF-ALU-14", description: "Blister foil roll 75mm", category: "Packaging", dimension: "count", baseUnit: "unit", pricePerBaseUnit: "8.50", stockQuantity: "25000", lowStockThreshold: "1000" },
  { name: "HDPE Bottle 100mL", sku: "BTL-HDPE-15", description: "White HDPE bottle with cap", category: "Packaging", dimension: "count", baseUnit: "unit", pricePerBaseUnit: "6.25", stockQuantity: "80000", lowStockThreshold: "4000" },
  { name: "Vitamin C Powder", sku: "VTC-PWD-16", description: "Ascorbic acid USP", category: "Vitamin", dimension: "weight", baseUnit: "g", pricePerBaseUnit: "2.10", stockQuantity: "75000", lowStockThreshold: "3000" },
  { name: "Zinc Oxide Powder", sku: "ZNO-PWD-17", description: "Topical grade zinc oxide", category: "Mineral", dimension: "weight", baseUnit: "g", pricePerBaseUnit: "0.95", stockQuantity: "60000", lowStockThreshold: "2500" },
  { name: "Hydrogen Peroxide 3%", sku: "H2O2-3-18", description: "Antiseptic grade peroxide solution", category: "Solution", dimension: "volume", baseUnit: "mL", pricePerBaseUnit: "0.04", stockQuantity: "400000", lowStockThreshold: "20000" },
  { name: "Syrup Base (Simple)", sku: "SRP-BAS-19", description: "Ready-to-flavour syrup base", category: "Formulation", dimension: "volume", baseUnit: "mL", pricePerBaseUnit: "0.15", stockQuantity: "350000", lowStockThreshold: "12000" },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  const [adminHash, sellerHash, buyerHash] = await Promise.all([
    bcrypt.hash("admin123", 10),
    bcrypt.hash("seller123", 10),
    bcrypt.hash("buyer123", 10),
  ]);

  await db
    .insert(schema.users)
    .values([
      { email: "admin@aasamedchem.demo", passwordHash: adminHash, name: "Admin User", role: "admin" },
      { email: "seller@aasamedchem.demo", passwordHash: sellerHash, name: "Distribution Seller", role: "seller" },
      { email: "buyer@aasamedchem.demo", passwordHash: buyerHash, name: "Apollo Pharma Buyer", role: "buyer" },
      { email: "buyer2@aasamedchem.demo", passwordHash: buyerHash, name: "MediCare Retail Buyer", role: "buyer" },
    ])
    .onConflictDoNothing();

  for (const p of PRODUCTS) {
    await db.insert(schema.products).values(p).onConflictDoNothing();
  }

  const [buyer] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "buyer@aasamedchem.demo"))
    .limit(1);

  const [buyer2] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "buyer2@aasamedchem.demo"))
    .limit(1);

  const allProducts = await db.select().from(schema.products).limit(5);

  if (buyer && allProducts.length >= 3) {
    const p0 = allProducts[0];
    const p1 = allProducts[1];
    const p2 = allProducts[2];

    const lines = [
      { product: p0, qty: "2.5", unit: "kg" as DisplayUnit },
      { product: p1, qty: "500", unit: "g" as DisplayUnit },
      { product: p2, qty: "10", unit: "L" as DisplayUnit },
    ];

    let total = new Decimal(0);
    const itemSnapshots = lines.map(({ product, qty, unit }) => {
      const base = product.baseUnit as DisplayUnit;
      const baseQty = toBaseQuantity(qty, unit, base);
      const lineTotal = calculateLineTotalInr(qty, unit, base, product.pricePerBaseUnit);
      total = total.plus(lineTotal);
      return {
        productId: product.id,
        orderedQuantity: qty,
        orderedUnit: unit,
        quantityInBase: baseQty.toString(),
        pricePerBaseUnit: product.pricePerBaseUnit,
        lineTotalInr: lineTotal.toDecimalPlaces(4).toString(),
        productName: product.name,
        productSku: product.sku,
        productBaseUnit: product.baseUnit,
      };
    });

    const existing = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.orderNumber, "AQ-SEED-001"))
      .limit(1);

    if (!existing.length) {
      const [order] = await db
        .insert(schema.orders)
        .values({
          orderNumber: "AQ-SEED-001",
          buyerId: buyer.id,
          status: "quotation",
          totalInr: total.toDecimalPlaces(4).toString(),
          notes: "Sample quotation: 2.5 kg API + 500 g + 10 L — verify conversions",
        })
        .returning();

      await db.insert(schema.orderItems).values(
        itemSnapshots.map((row) => ({ ...row, orderId: order.id }))
      );
    }

    if (buyer2 && allProducts[3]) {
      const p = allProducts[3];
      const existing2 = await db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.orderNumber, "AQ-SEED-002"))
        .limit(1);

      if (!existing2.length) {
        const lineTotal = calculateLineTotalInr("10000", "unit", "unit", p.pricePerBaseUnit);
        const [order2] = await db
          .insert(schema.orders)
          .values({
            orderNumber: "AQ-SEED-002",
            buyerId: buyer2.id,
            status: "pending",
            totalInr: lineTotal.toDecimalPlaces(4).toString(),
            notes: "10,000 capsules order",
          })
          .returning();

        await db.insert(schema.orderItems).values({
          orderId: order2.id,
          productId: p.id,
          orderedQuantity: "10000",
          orderedUnit: "unit",
          quantityInBase: "10000",
          pricePerBaseUnit: p.pricePerBaseUnit,
          lineTotalInr: lineTotal.toDecimalPlaces(4).toString(),
          productName: p.name,
          productSku: p.sku,
          productBaseUnit: p.baseUnit,
        });
      }
    }
  }

  console.log("Seed complete — 20 products, 4 users, sample orders.");
  console.log("Admin:  admin@aasamedchem.demo / admin123");
  console.log("Seller: seller@aasamedchem.demo / seller123");
  console.log("Buyer:  buyer@aasamedchem.demo / buyer123");
  console.log("Buyer2: buyer2@aasamedchem.demo / buyer123");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
