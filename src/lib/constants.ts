/**
 * Constants for emission factors.
 * Sources are generalized approximations based on standard IPCC and EPA guidelines for personal carbon footprints.
 */

// Transport
export const WEEKS_PER_YEAR = 52;
export const MONTHS_PER_YEAR = 12;

// CO2 emissions in tonnes per km based on vehicle type
// Source: EPA Greenhouse Gas Equivalencies
export const EMISSION_FACTORS = {
  transport: {
    car: {
      gas: 0.000192, // Tonnes CO2 per km
      hybrid: 0.000105,
      ev: 0.000053,
      none: 0,
    },
    flight: 1.5, // Average tonnes CO2 per short-to-medium haul flight
  },
  homeEnergy: {
    electricity: 0.000385, // Tonnes CO2 per kWh (Grid average)
    gas: 0.002, // Tonnes CO2 per unit of gas
  },
  diet: {
    // Tonnes CO2 per year based on diet
    // Source: Oxford Martin School
    daily: 3.3,
    weekly: 1.7,
    rarely: 1.0,
    vegan: 0.5,
  },
  shoppingWaste: {
    onlineOrder: 0.005, // Tonnes CO2 per order (packaging + last mile)
    recyclingPenalty: {
      always: 0,
      sometimes: 0.2, // Tonnes CO2 added per year for 'sometimes'
      never: 0.5, // Tonnes CO2 added per year for 'never'
    },
  },
};

export const NATIONAL_AVERAGE_TONNES = 15; // Typical developed nation average
export const GLOBAL_AVERAGE_TONNES = 4.8; // Global average
