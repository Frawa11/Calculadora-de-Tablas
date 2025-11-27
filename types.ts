
export type UnitType = 'in' | 'ft' | 'm' | 'cm' | 'mm';

export interface WoodDimensions {
  length: string;
  lengthUnit: UnitType;
  width: string;
  widthUnit: UnitType;
  thickness: string;
  thicknessUnit: UnitType;
  price: string;
}

export interface CalculationResult {
  boardFeet: number;
  cubicMeters: number;
  totalCost: number;
}

export interface BudgetItem {
  id: string;
  dimensions: WoodDimensions;
  result: CalculationResult;
  timestamp: number;
}

export enum InputFieldType {
  LENGTH = 'LENGTH',
  WIDTH = 'WIDTH',
  THICKNESS = 'THICKNESS',
  PRICE = 'PRICE'
}

export type ThemeColor = 'amber' | 'blue' | 'emerald' | 'indigo' | 'rose' | 'slate';
