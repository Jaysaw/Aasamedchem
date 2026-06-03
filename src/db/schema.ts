import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  numeric,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["admin", "seller", "buyer"]);
export const dimensionEnum = pgEnum("dimension", ["weight", "volume", "count"]);
export const displayUnitEnum = pgEnum("display_unit", [
  "g",
  "kg",
  "mL",
  "L",
  "unit",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "quotation",
  "pending",
  "approved",
  "rejected",
  "fulfilled",
  "cancelled",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  role: userRoleEnum("role").notNull().default("seller"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  sku: varchar("sku", { length: 64 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  dimension: dimensionEnum("dimension").notNull(),
  /** Canonical storage unit for this product's dimension */
  baseUnit: displayUnitEnum("base_unit").notNull(),
  /**
   * Price in INR per 1 base unit (e.g. per gram, per mL, per item).
   * NUMERIC(24,10) — up to 14 digits before decimal, 10 after.
   */
  pricePerBaseUnit: numeric("price_per_base_unit", {
    precision: 24,
    scale: 10,
  }).notNull(),
  /**
   * Stock held in base units (same dimension as baseUnit).
   * NUMERIC(24,8) for large inventory counts with precision.
   */
  stockQuantity: numeric("stock_quantity", { precision: 24, scale: 8 })
    .notNull()
    .default("0"),
  lowStockThreshold: numeric("low_stock_threshold", { precision: 24, scale: 8 })
    .notNull()
    .default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: varchar("order_number", { length: 32 }).notNull().unique(),
  buyerId: uuid("buyer_id")
    .notNull()
    .references(() => users.id),
  status: orderStatusEnum("status").notNull().default("quotation"),
  /** Total in INR — NUMERIC(24,4) for display-friendly money */
  totalInr: numeric("total_inr", { precision: 24, scale: 4 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  /** Quantity the user entered in their chosen unit */
  orderedQuantity: numeric("ordered_quantity", { precision: 24, scale: 8 })
    .notNull(),
  orderedUnit: displayUnitEnum("ordered_unit").notNull(),
  /** Normalized quantity in product base units */
  quantityInBase: numeric("quantity_in_base", { precision: 24, scale: 8 })
    .notNull(),
  /** Snapshot: INR per base unit at order time */
  pricePerBaseUnit: numeric("price_per_base_unit", {
    precision: 24,
    scale: 10,
  }).notNull(),
  /** Line total INR */
  lineTotalInr: numeric("line_total_inr", { precision: 24, scale: 4 }).notNull(),
  productName: varchar("product_name", { length: 200 }).notNull(),
  productSku: varchar("product_sku", { length: 64 }).notNull(),
  productBaseUnit: displayUnitEnum("product_base_unit").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, { fields: [orders.buyerId], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
