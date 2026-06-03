export type UserRole = "admin" | "seller" | "buyer";

export type CartLine = {
  productId: string;
  name: string;
  sku: string;
  dimension: "weight" | "volume" | "count";
  baseUnit: "g" | "kg" | "mL" | "L" | "unit";
  pricePerBaseUnit: string;
  quantity: string;
  unit: "g" | "kg" | "mL" | "L" | "unit";
};
