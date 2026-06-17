/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CarType = "gas" | "hybrid" | "ev" | "none";
export type MeatFrequency = "daily" | "weekly" | "rarely" | "vegan";
export type RecyclingHabit = "always" | "sometimes" | "never";

export interface TransportData {
  carType: CarType;
  kmPerWeek: number;
  flightsPerYear: number;
}

export interface HomeEnergyData {
  electricityKwhPerMonth: number;
  gasUsage: number;
  renewablePercentage: number;
}

export interface DietData {
  meatFrequency: MeatFrequency;
}

export interface ShoppingWasteData {
  onlineOrdersPerMonth: number;
  recyclingHabits: RecyclingHabit;
}

export interface UserInputData {
  transport: TransportData;
  homeEnergy: HomeEnergyData;
  diet: DietData;
  shoppingWaste: ShoppingWasteData;
}

export interface CategoryBreakdown {
  transport: number;
  homeEnergy: number;
  diet: number;
  shoppingWaste: number;
}

export interface CalculationResult {
  score: number;
  breakdown: CategoryBreakdown;
  tips: string[];
}

export interface EcoAction {
  id: string;
  name: string;
  co2SavedKg: number;
  date: string;
}
