import { calculateTransport, calculateHomeEnergy, calculateDiet, calculateShoppingWaste, calculateTotalFootprint, generateTips } from "../../src/lib/calculator";
import type { UserInputData } from "../../src/lib/types";

describe("Carbon Calculator", () => {
  const mockData: UserInputData = {
    transport: { carType: "gas", kmPerWeek: 100, flightsPerYear: 1 },
    homeEnergy: { electricityKwhPerMonth: 300, gasUsage: 50, renewablePercentage: 20 },
    diet: { meatFrequency: "weekly" },
    shoppingWaste: { onlineOrdersPerMonth: 5, recyclingHabits: "sometimes" }
  };

  it("calculates transport emissions correctly", () => {
    const result = calculateTransport(mockData.transport);
    expect(result).toBeGreaterThan(0);
  });

  it("calculates zero transport emissions for no car and no flights", () => {
    const result = calculateTransport({ carType: "none", kmPerWeek: 0, flightsPerYear: 0 });
    expect(result).toBe(0);
  });

  it("calculates total footprint correctly", () => {
    const result = calculateTotalFootprint(mockData);
    expect(result.score).toBeGreaterThan(0);
    expect(result.breakdown.transport).toBeDefined();
    expect(result.tips.length).toBeLessThanOrEqual(3);
  });

  it("generates correct tips based on highest emitting category", () => {
    // Force diet to be highest
    const input: UserInputData = {
      ...mockData,
      transport: { carType: "none", kmPerWeek: 0, flightsPerYear: 0 },
      homeEnergy: { electricityKwhPerMonth: 0, gasUsage: 0, renewablePercentage: 100 },
      diet: { meatFrequency: "daily" } // Highest
    };
    const result = calculateTotalFootprint(input);
    expect(result.tips[0]).toContain("plant-based");
  });
});
