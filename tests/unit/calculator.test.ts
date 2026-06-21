import { calculateTransport, calculateHomeEnergy, calculateDiet, calculateShoppingWaste, calculateTotalFootprint, generateTips } from "../../src/lib/calculator";
import type { UserInputData } from "../../src/lib/types";

const baseData: UserInputData = {
  transport: { carType: "gas", kmPerWeek: 100, flightsPerYear: 1 },
  homeEnergy: { electricityKwhPerMonth: 300, gasUsage: 50, renewablePercentage: 20 },
  diet: { meatFrequency: "weekly" },
  shoppingWaste: { onlineOrdersPerMonth: 5, recyclingHabits: "sometimes" }
};

describe("Carbon Calculator — calculateTransport", () => {
  it("returns > 0 for a gas car", () => {
    expect(calculateTransport({ carType: "gas", kmPerWeek: 100, flightsPerYear: 1 })).toBeGreaterThan(0);
  });
  it("returns > 0 for a hybrid car", () => {
    expect(calculateTransport({ carType: "hybrid", kmPerWeek: 100, flightsPerYear: 0 })).toBeGreaterThan(0);
  });
  it("returns > 0 for an EV", () => {
    expect(calculateTransport({ carType: "ev", kmPerWeek: 100, flightsPerYear: 0 })).toBeGreaterThan(0);
  });
  it("returns 0 for no car and no flights", () => {
    expect(calculateTransport({ carType: "none", kmPerWeek: 0, flightsPerYear: 0 })).toBe(0);
  });
  it("clamps negative kmPerWeek to 0", () => {
    const result = calculateTransport({ carType: "gas", kmPerWeek: -100, flightsPerYear: 0 });
    expect(result).toBe(0);
  });
  it("accounts for flights correctly", () => {
    const noFlights = calculateTransport({ carType: "none", kmPerWeek: 0, flightsPerYear: 0 });
    const withFlights = calculateTransport({ carType: "none", kmPerWeek: 0, flightsPerYear: 2 });
    expect(withFlights).toBeGreaterThan(noFlights);
  });
});

describe("Carbon Calculator — calculateHomeEnergy", () => {
  it("returns 0 for all-renewable, no usage", () => {
    const result = calculateHomeEnergy({ electricityKwhPerMonth: 0, gasUsage: 0, renewablePercentage: 100 });
    expect(result).toBe(0);
  });
  it("returns more emissions for 0% renewable vs 100%", () => {
    const dirty = calculateHomeEnergy({ electricityKwhPerMonth: 300, gasUsage: 0, renewablePercentage: 0 });
    const clean = calculateHomeEnergy({ electricityKwhPerMonth: 300, gasUsage: 0, renewablePercentage: 100 });
    expect(dirty).toBeGreaterThan(clean);
  });
  it("clamps renewablePercentage > 100 to 100", () => {
    const clamped = calculateHomeEnergy({ electricityKwhPerMonth: 300, gasUsage: 0, renewablePercentage: 150 });
    const max = calculateHomeEnergy({ electricityKwhPerMonth: 300, gasUsage: 0, renewablePercentage: 100 });
    expect(clamped).toBe(max);
  });
});

describe("Carbon Calculator — calculateDiet", () => {
  it("daily meat is highest", () => {
    const daily = calculateDiet({ meatFrequency: "daily" });
    const weekly = calculateDiet({ meatFrequency: "weekly" });
    const rarely = calculateDiet({ meatFrequency: "rarely" });
    const vegan = calculateDiet({ meatFrequency: "vegan" });
    expect(daily).toBeGreaterThan(weekly);
    expect(weekly).toBeGreaterThan(rarely);
    expect(rarely).toBeGreaterThan(vegan);
  });
});

describe("Carbon Calculator — calculateShoppingWaste", () => {
  it("always recycling is lowest penalty", () => {
    const always = calculateShoppingWaste({ onlineOrdersPerMonth: 0, recyclingHabits: "always" });
    const sometimes = calculateShoppingWaste({ onlineOrdersPerMonth: 0, recyclingHabits: "sometimes" });
    const never = calculateShoppingWaste({ onlineOrdersPerMonth: 0, recyclingHabits: "never" });
    expect(always).toBeLessThan(sometimes);
    expect(sometimes).toBeLessThan(never);
  });
});

describe("Carbon Calculator — calculateTotalFootprint", () => {
  it("returns a positive score with valid data", () => {
    const result = calculateTotalFootprint(baseData);
    expect(result.score).toBeGreaterThan(0);
    expect(result.breakdown.transport).toBeDefined();
    expect(result.tips.length).toBeLessThanOrEqual(3);
  });
});

describe("Carbon Calculator — generateTips (all category paths)", () => {
  it("tips target transport when transport is highest (EV switch)", () => {
    const input: UserInputData = {
      ...baseData,
      transport: { carType: "gas", kmPerWeek: 500, flightsPerYear: 0 },
      homeEnergy: { electricityKwhPerMonth: 0, gasUsage: 0, renewablePercentage: 100 },
      diet: { meatFrequency: "vegan" },
      shoppingWaste: { onlineOrdersPerMonth: 0, recyclingHabits: "always" },
    };
    const { tips } = calculateTotalFootprint(input);
    expect(tips[0]).toMatch(/electric|transit/i);
  });

  it("tips target transport when flights are high", () => {
    const input: UserInputData = {
      ...baseData,
      transport: { carType: "none", kmPerWeek: 0, flightsPerYear: 10 },
      homeEnergy: { electricityKwhPerMonth: 0, gasUsage: 0, renewablePercentage: 100 },
      diet: { meatFrequency: "vegan" },
      shoppingWaste: { onlineOrdersPerMonth: 0, recyclingHabits: "always" },
    };
    const { tips } = calculateTotalFootprint(input);
    expect(tips.some(t => /flight|train|vacation/i.test(t))).toBe(true);
  });

  it("tips target diet when diet is highest", () => {
    const input: UserInputData = {
      ...baseData,
      transport: { carType: "none", kmPerWeek: 0, flightsPerYear: 0 },
      homeEnergy: { electricityKwhPerMonth: 0, gasUsage: 0, renewablePercentage: 100 },
      diet: { meatFrequency: "daily" },
      shoppingWaste: { onlineOrdersPerMonth: 0, recyclingHabits: "always" },
    };
    const { tips } = calculateTotalFootprint(input);
    expect(tips[0]).toContain("plant-based");
  });

  it("tips target homeEnergy when it is highest (low renewable)", () => {
    const input: UserInputData = {
      ...baseData,
      transport: { carType: "none", kmPerWeek: 0, flightsPerYear: 0 },
      homeEnergy: { electricityKwhPerMonth: 2000, gasUsage: 500, renewablePercentage: 0 },
      diet: { meatFrequency: "vegan" },
      shoppingWaste: { onlineOrdersPerMonth: 0, recyclingHabits: "always" },
    };
    const { tips } = calculateTotalFootprint(input);
    expect(tips.some(t => /renewable|solar|insul/i.test(t))).toBe(true);
  });

  it("tips target shoppingWaste when it is highest", () => {
    const input: UserInputData = {
      ...baseData,
      transport: { carType: "none", kmPerWeek: 0, flightsPerYear: 0 },
      homeEnergy: { electricityKwhPerMonth: 0, gasUsage: 0, renewablePercentage: 100 },
      diet: { meatFrequency: "vegan" },
      shoppingWaste: { onlineOrdersPerMonth: 50, recyclingHabits: "never" },
    };
    const { tips } = calculateTotalFootprint(input);
    expect(tips.some(t => /order|recycl|compost/i.test(t))).toBe(true);
  });

  it("always returns at most 3 tips", () => {
    const { tips } = calculateTotalFootprint(baseData);
    expect(tips.length).toBeLessThanOrEqual(3);
  });

  it("generateTips adds a general tip when fewer than 3 specific ones", () => {
    // vegan + ev + no orders + always recycle → only general tip
    const input: UserInputData = {
      ...baseData,
      transport: { carType: "ev", kmPerWeek: 10, flightsPerYear: 0 },
      homeEnergy: { electricityKwhPerMonth: 0, gasUsage: 0, renewablePercentage: 100 },
      diet: { meatFrequency: "vegan" },
      shoppingWaste: { onlineOrdersPerMonth: 0, recyclingHabits: "always" },
    };
    const breakdown = {
      transport: 0.00275,
      homeEnergy: 0,
      diet: 0.5,
      shoppingWaste: 0,
    };
    const tips = generateTips(breakdown, input);
    expect(tips.length).toBeGreaterThan(0);
  });

  it("transport with EV + no high flights → carpooling/biking fallback tip (line 86)", () => {
    // EV + 0 flights: neither gas/hybrid branch nor flight branch fires → fallback tip
    const input: UserInputData = {
      ...baseData,
      transport: { carType: "ev", kmPerWeek: 500, flightsPerYear: 0 },
      homeEnergy: { electricityKwhPerMonth: 0, gasUsage: 0, renewablePercentage: 100 },
      diet: { meatFrequency: "vegan" },
      shoppingWaste: { onlineOrdersPerMonth: 0, recyclingHabits: "always" },
    };
    const { tips } = calculateTotalFootprint(input);
    expect(tips.some(t => /carpooling|biking/i.test(t))).toBe(true);
  });

  it("homeEnergy with renewable >= 50% skips solar tip, shows only insulation tip (line 88 false branch)", () => {
    const input: UserInputData = {
      ...baseData,
      transport: { carType: "none", kmPerWeek: 0, flightsPerYear: 0 },
      homeEnergy: { electricityKwhPerMonth: 2000, gasUsage: 500, renewablePercentage: 60 },
      diet: { meatFrequency: "vegan" },
      shoppingWaste: { onlineOrdersPerMonth: 0, recyclingHabits: "always" },
    };
    const { tips } = calculateTotalFootprint(input);
    expect(tips.some(t => /insul|appliance/i.test(t))).toBe(true);
    // Should NOT include the solar panels tip since renewable >= 50
    expect(tips.some(t => /solar|renewable provider/i.test(t))).toBe(false);
  });
});


