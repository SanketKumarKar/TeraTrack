import { EMISSION_FACTORS, WEEKS_PER_YEAR, MONTHS_PER_YEAR } from "./constants";
import type { UserInputData, CategoryBreakdown, CalculationResult } from "./types";

/**
 * Calculates the transport carbon emissions for a year.
 * Time complexity: O(1)
 *
 * @param transport - The transport data input from the user.
 * @returns The transport carbon footprint in tonnes.
 */
export const calculateTransport = (transport: UserInputData["transport"]): number => {
  const kmPerWeek = Math.max(0, transport.kmPerWeek);
  const flightsPerYear = Math.max(0, transport.flightsPerYear);
  const carEmissions = kmPerWeek * EMISSION_FACTORS.transport.car[transport.carType] * WEEKS_PER_YEAR;
  const flightEmissions = flightsPerYear * EMISSION_FACTORS.transport.flight;
  return carEmissions + flightEmissions;
};

/**
 * Calculates the home energy carbon emissions for a year.
 * Time complexity: O(1)
 *
 * @param homeEnergy - The home energy data input from the user.
 * @returns The home energy carbon footprint in tonnes.
 */
export const calculateHomeEnergy = (homeEnergy: UserInputData["homeEnergy"]): number => {
  const electricityKwh = Math.max(0, homeEnergy.electricityKwhPerMonth);
  const gasUsage = Math.max(0, homeEnergy.gasUsage);
  const renewablePct = Math.min(100, Math.max(0, homeEnergy.renewablePercentage));

  const electricityEmissions = electricityKwh * MONTHS_PER_YEAR * EMISSION_FACTORS.homeEnergy.electricity;
  const gridDependency = (100 - renewablePct) / 100;
  
  const gasEmissions = gasUsage * MONTHS_PER_YEAR * EMISSION_FACTORS.homeEnergy.gas;
  
  return (electricityEmissions * gridDependency) + gasEmissions;
};

/**
 * Calculates the dietary carbon emissions for a year.
 * Time complexity: O(1)
 *
 * @param diet - The diet data input from the user.
 * @returns The dietary carbon footprint in tonnes.
 */
export const calculateDiet = (diet: UserInputData["diet"]): number => {
  return EMISSION_FACTORS.diet[diet.meatFrequency];
};

/**
 * Calculates the online shopping and waste carbon emissions for a year.
 * Time complexity: O(1)
 *
 * @param shopping - The shopping and waste data input from the user.
 * @returns The shopping and waste carbon footprint in tonnes.
 */
export const calculateShoppingWaste = (shopping: UserInputData["shoppingWaste"]): number => {
  const ordersPerMonth = Math.max(0, shopping.onlineOrdersPerMonth);
  const shoppingEmissions = ordersPerMonth * MONTHS_PER_YEAR * EMISSION_FACTORS.shoppingWaste.onlineOrder;
  const recyclingEmissions = EMISSION_FACTORS.shoppingWaste.recyclingPenalty[shopping.recyclingHabits];
  return shoppingEmissions + recyclingEmissions;
};

/**
 * Generates personalized reduction tips based on the category breakdown.
 * Time complexity: O(1) strictly since the number of categories is fixed (4).
 *
 * @param breakdown - The calculated emissions for each category.
 * @param input - The original user input to provide specific tips.
 * @returns An array of actionable tips (strings).
 */
export const generateTips = (breakdown: CategoryBreakdown, input: UserInputData): string[] => {
  const tips: string[] = [];

  // Sort categories by highest emissions
  const sortedCategories = Object.entries(breakdown).sort(([, a], [, b]) => b - a);
  const highestCategory = sortedCategories[0][0];

  if (highestCategory === "transport") {
    if (input.transport.carType === "gas" || input.transport.carType === "hybrid") {
      tips.push("Consider switching to an electric vehicle or utilizing public transit to reduce car emissions.");
    }
    if (input.transport.flightsPerYear > 2) {
      tips.push("Try reducing your yearly flights by opting for local vacations or utilizing train travel.");
    }
    if (tips.length === 0) tips.push("Carpooling or biking for short trips can significantly lower your transport footprint.");
  } else if (highestCategory === "homeEnergy") {
    if (input.homeEnergy.renewablePercentage < 50) {
      tips.push("Switch to a renewable energy provider or consider installing solar panels.");
    }
    tips.push("Improve home insulation and upgrade to energy-efficient appliances to reduce your power consumption.");
  } else if (highestCategory === "diet") {
    if (input.diet.meatFrequency === "daily" || input.diet.meatFrequency === "weekly") {
      tips.push("Try incorporating more plant-based meals into your week. Even one meatless day helps significantly.");
    }
    tips.push("Buy locally sourced and seasonal produce to reduce transportation emissions for your food.");
  } else if (highestCategory === "shoppingWaste") {
    if (input.shoppingWaste.onlineOrdersPerMonth > 4) {
      tips.push("Consolidate your online orders to reduce packaging and last-mile delivery emissions.");
    }
    if (input.shoppingWaste.recyclingHabits !== "always") {
      tips.push("Start recycling cardboard, plastics, and glass consistently. Composting organic waste is also excellent.");
    }
  }

  // Always add one general tip if we have less than 3
  if (tips.length < 3) {
    tips.push("Small habitual changes add up over time. Review your habits quarterly to keep your emissions low.");
  }

  return tips.slice(0, 3);
};

/**
 * Calculates the total carbon footprint and returns a full breakdown.
 * Time complexity: O(1)
 *
 * @param input - The complete user input data.
 * @returns The total score, category breakdown, and personalized tips.
 */
export const calculateTotalFootprint = (input: UserInputData): CalculationResult => {
  const breakdown: CategoryBreakdown = {
    transport: calculateTransport(input.transport),
    homeEnergy: calculateHomeEnergy(input.homeEnergy),
    diet: calculateDiet(input.diet),
    shoppingWaste: calculateShoppingWaste(input.shoppingWaste),
  };

  const score = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
  const tips = generateTips(breakdown, input);

  return {
    score,
    breakdown,
    tips,
  };
};
