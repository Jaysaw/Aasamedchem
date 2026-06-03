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

/** Quick quantity chips per dimension for buyers */
export const QUANTITY_PRESETS: Record<Dimension, { label: string; quantity: string; unit: DisplayUnit }[]> = {
  weight: [
    { label: "100 g", quantity: "100", unit: "g" },
    { label: "500 g", quantity: "500", unit: "g" },
    { label: "1 kg", quantity: "1", unit: "kg" },
    { label: "5 kg", quantity: "5", unit: "kg" },
    { label: "25 kg", quantity: "25", unit: "kg" },
  ],
  volume: [
    { label: "100 mL", quantity: "100", unit: "mL" },
    { label: "500 mL", quantity: "500", unit: "mL" },
    { label: "1 L", quantity: "1", unit: "L" },
    { label: "5 L", quantity: "5", unit: "L" },
    { label: "20 L", quantity: "20", unit: "L" },
  ],
  count: [
    { label: "100", quantity: "100", unit: "unit" },
    { label: "500", quantity: "500", unit: "unit" },
    { label: "1,000", quantity: "1000", unit: "unit" },
    { label: "10,000", quantity: "10000", unit: "unit" },
  ],
};

export type UnitBreakdown = {
  unit: DisplayUnit;
  unitLabel: string;
  quantityEquivalent: string;
  pricePerUnit: string;
  pricePerUnitFormatted: string;
  lineTotal: string;
  lineTotalFormatted: string;
};

export function buildConversionBreakdown(
  quantity: string | number,
  selectedUnit: DisplayUnit,
  baseUnit: DisplayUnit,
  dimension: Dimension,
  pricePerBaseUnit: string | number
): {
  baseQuantity: string;
  baseQuantityFormatted: string;
  selectedLineTotal: string;
  selectedLineTotalFormatted: string;
  units: UnitBreakdown[];
  formula: string;
} {
  const qty = new Decimal(quantity);
  const baseQty = toBaseQuantity(quantity, selectedUnit, baseUnit);
  const selectedLineTotal = calculateLineTotalInr(
    quantity,
    selectedUnit,
    baseUnit,
    pricePerBaseUnit
  );

  const units = unitsForDimension(dimension).map((unit) => {
    const equiv = fromBaseQuantity(baseQty.toString(), unit, baseUnit);
    const perUnit = pricePerDisplayUnit(pricePerBaseUnit, unit, baseUnit);
    return {
      unit,
      unitLabel: unitLabel(unit),
      quantityEquivalent: equiv.toDecimalPlaces(6, Decimal.ROUND_HALF_UP).toString(),
      pricePerUnit: perUnit.toString(),
      pricePerUnitFormatted: formatInr(perUnit),
      lineTotal: selectedLineTotal.toString(),
      lineTotalFormatted: formatInr(selectedLineTotal),
    };
  });

  const formula = `${qty.toString()} ${unitLabel(selectedUnit)} → ${baseQty.toDecimalPlaces(6).toString()} ${unitLabel(baseUnit)} (base) × ${formatInr(pricePerBaseUnit)}/${unitLabel(baseUnit)}`;

  return {
    baseQuantity: baseQty.toString(),
    baseQuantityFormatted: formatQuantity(baseQty, baseUnit),
    selectedLineTotal: selectedLineTotal.toString(),
    selectedLineTotalFormatted: formatInr(selectedLineTotal),
    units,
    formula,
  };
}

export function stockInUnit(
  stockBase: string | number,
  displayUnit: DisplayUnit,
  baseUnit: DisplayUnit
): string {
  return fromBaseQuantity(stockBase, displayUnit, baseUnit)
    .toDecimalPlaces(4, Decimal.ROUND_HALF_UP)
    .toString();
}
