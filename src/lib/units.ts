import Decimal from "decimal.js";

export type DisplayUnit = "g" | "kg" | "mL" | "L" | "unit";
export type Dimension = "weight" | "volume" | "count";

/** Smallest canonical unit per dimension for DB storage */
export const BASE_UNIT_BY_DIMENSION: Record<Dimension, DisplayUnit> = {
  weight: "g",
  volume: "mL",
  count: "unit",
};

/** Units allowed per dimension in the UI */
export const UNITS_BY_DIMENSION: Record<Dimension, DisplayUnit[]> = {
  weight: ["g", "kg"],
  volume: ["mL", "L"],
  count: ["unit"],
};

/** Multiplier: 1 display unit = this many base units */
const TO_BASE: Record<DisplayUnit, Decimal> = {
  g: new Decimal(1),
  kg: new Decimal(1000),
  mL: new Decimal(1),
  L: new Decimal(1000),
  unit: new Decimal(1),
};

export function unitsForDimension(dimension: Dimension): DisplayUnit[] {
  return UNITS_BY_DIMENSION[dimension];
}

export function isUnitValidForDimension(
  unit: DisplayUnit,
  dimension: Dimension
): boolean {
  return UNITS_BY_DIMENSION[dimension].includes(unit);
}

/** Convert quantity from `fromUnit` to product base unit */
export function toBaseQuantity(
  quantity: string | number,
  fromUnit: DisplayUnit,
  baseUnit: DisplayUnit
): Decimal {
  const q = new Decimal(quantity);
  if (fromUnit === baseUnit) return q;
  const inSmallest = q.mul(TO_BASE[fromUnit]);
  return inSmallest.div(TO_BASE[baseUnit]);
}

/** Convert base quantity to display unit */
export function fromBaseQuantity(
  baseQty: string | number,
  toUnit: DisplayUnit,
  baseUnit: DisplayUnit
): Decimal {
  const q = new Decimal(baseQty);
  if (toUnit === baseUnit) return q;
  const inSmallest = q.mul(TO_BASE[baseUnit]);
  return inSmallest.div(TO_BASE[toUnit]);
}

/** Line total INR = baseQty * pricePerBaseUnit */
export function calculateLineTotalInr(
  quantity: string | number,
  fromUnit: DisplayUnit,
  baseUnit: DisplayUnit,
  pricePerBaseUnit: string | number
): Decimal {
  const baseQty = toBaseQuantity(quantity, fromUnit, baseUnit);
  return baseQty.mul(new Decimal(pricePerBaseUnit));
}

/** Unit price in INR for 1 unit of `displayUnit` */
export function pricePerDisplayUnit(
  pricePerBaseUnit: string | number,
  displayUnit: DisplayUnit,
  baseUnit: DisplayUnit
): Decimal {
  const perBase = new Decimal(pricePerBaseUnit);
  if (displayUnit === baseUnit) return perBase;
  const oneDisplayInBase = toBaseQuantity(1, displayUnit, baseUnit);
  return perBase.mul(oneDisplayInBase);
}

export function formatInr(value: string | number | Decimal): string {
  const d = value instanceof Decimal ? value : new Decimal(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(d.toNumber());
}

export function formatQuantity(
  value: string | number | Decimal,
  unit: DisplayUnit,
  maxDecimals = 6
): string {
  const d = value instanceof Decimal ? value : new Decimal(value);
  const trimmed = d.toDecimalPlaces(maxDecimals, Decimal.ROUND_HALF_UP);
  return `${trimmed.toString()} ${unitLabel(unit)}`;
}

export function unitLabel(unit: DisplayUnit): string {
  if (unit === "unit") return "items";
  return unit;
}

export const CONVERSION_REFERENCE = [
  { from: "kg", to: "g", factor: "1000" },
  { from: "g", to: "kg", factor: "0.001" },
  { from: "L", to: "mL", factor: "1000" },
  { from: "mL", to: "L", factor: "0.001" },
  { from: "items", to: "items", factor: "1" },
] as const;
