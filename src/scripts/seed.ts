import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  const adminHash = await bcrypt.hash("admin123", 10);
  const sellerHash = await bcrypt.hash("seller123", 10);

  await db
    .insert(schema.users)
    .values([
      {
        email: "admin@aasamedchem.demo",
        passwordHash: adminHash,
        name: "Admin User",
        role: "admin",
      },
      {
        email: "seller@aasamedchem.demo",
        passwordHash: sellerHash,
        name: "Pharma Seller",
        role: "seller",
      },
    ])
    .onConflictDoNothing();

  const sampleProducts: (typeof schema.products.$inferInsert)[] = [
    {
      name: "Paracetamol API",
      sku: "PCM-API-01",
      description: "High-purity paracetamol active pharmaceutical ingredient",
      category: "API",
      dimension: "weight",
      baseUnit: "g",
      pricePerBaseUnit: "0.85",
      stockQuantity: "500000",
      lowStockThreshold: "10000",
    },
    {
      name: "Ibuprofen Granules",
      sku: "IBU-GRN-02",
      description: "Ibuprofen granules for tablet formulation",
      category: "Excipient",
      dimension: "weight",
      baseUnit: "g",
      pricePerBaseUnit: "1.25",
      stockQuantity: "250000",
      lowStockThreshold: "5000",
    },
    {
      name: "Saline Solution 0.9%",
      sku: "SAL-SOL-03",
      description: "Sterile isotonic saline for lab and production use",
      category: "Solution",
      dimension: "volume",
      baseUnit: "mL",
      pricePerBaseUnit: "0.02",
      stockQuantity: "1000000",
      lowStockThreshold: "50000",
    },
    {
      name: "Ethanol 96%",
      sku: "ETH-96-04",
      description: "Pharma-grade ethanol for extraction and sanitization",
      category: "Solvent",
      dimension: "volume",
      baseUnit: "mL",
      pricePerBaseUnit: "0.08",
      stockQuantity: "500000",
      lowStockThreshold: "20000",
    },
    {
      name: "Empty Hard Gelatin Capsules Size 0",
      sku: "CAP-HG-00",
      description: "Two-piece hard gelatin capsules, size 0, clear",
      category: "Packaging",
      dimension: "count",
      baseUnit: "unit",
      pricePerBaseUnit: "0.45",
      stockQuantity: "2000000",
      lowStockThreshold: "100000",
    },
    {
      name: "Vitamin C Powder (Ascorbic Acid)",
      sku: "VTC-PWD-05",
      description: "USP-grade ascorbic acid powder",
      category: "Vitamin",
      dimension: "weight",
      baseUnit: "g",
      pricePerBaseUnit: "2.10",
      stockQuantity: "75000",
      lowStockThreshold: "3000",
    },
    {
      name: "Distilled Water",
      sku: "DW-PH-06",
      description: "Pharmaceutical distilled water",
      category: "Solution",
      dimension: "volume",
      baseUnit: "mL",
      pricePerBaseUnit: "0.005",
      stockQuantity: "2000000",
      lowStockThreshold: "100000",
    },
    {
      name: "Blister Pack Sheets (10-count)",
      sku: "BLS-10-07",
      description: "PVC/PVDC blister sheets pre-formed for 10 units",
      category: "Packaging",
      dimension: "count",
      baseUnit: "unit",
      pricePerBaseUnit: "12.50",
      stockQuantity: "50000",
      lowStockThreshold: "2000",
    },
  ];

  for (const p of sampleProducts) {
    await db.insert(schema.products).values(p).onConflictDoNothing();
  }

  console.log("Seed complete.");
  console.log("Admin: admin@aasamedchem.demo / admin123");
  console.log("Seller: seller@aasamedchem.demo / seller123");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
