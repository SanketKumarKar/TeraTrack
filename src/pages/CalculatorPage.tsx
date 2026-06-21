import { FormEvent, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { cn } from "../lib/utils";
import { CalculationSchema } from "../lib/schemas";
import { Leaf, Car, Zap, ShoppingBag } from "lucide-react";
import { useAuth } from "../lib/firebase/auth";
import { saveCarbonInput, getCarbonInput } from "../lib/firebase/db";
import type { UserInputData } from "../lib/types";

type FormState = z.infer<typeof CalculationSchema>;

export default function CalculatorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [formData, setFormData] = useState<FormState>({
    transport: { carType: "gas", kmPerWeek: 100, flightsPerYear: 1 },
    homeEnergy: { electricityKwhPerMonth: 300, gasUsage: 50, renewablePercentage: 20 },
    diet: { meatFrequency: "weekly" },
    shoppingWaste: { onlineOrdersPerMonth: 5, recyclingHabits: "sometimes" },
  });

  useEffect(() => {
    let cancelled = false;
    async function fetchExisting() {
      if (!user) return;
      try {
        const data = await getCarbonInput(user.uid);
        if (data && !cancelled) {
          setFormData(data as FormState);
        }
      } catch (e) {
        if (!cancelled) console.error("Failed to load existing data", e);
      } finally {
        if (!cancelled) setInitialFetchDone(true);
      }
    }
    fetchExisting();
    return () => { cancelled = true; };
  }, [user]);

  const handleChange = useCallback((category: keyof FormState, field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }));
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be signed in to save.");
      return;
    }

    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      // Client validation
      CalculationSchema.parse(formData);

      // The API call demonstrates full-stack validation behaviour.
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to process calculation on the server.");
      }

      // Store input to Firebase
      await saveCarbonInput(user.uid, formData);

      // Navigate to Dashboard
      navigate("/dashboard");
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return;
      if (err instanceof z.ZodError) {
        setError("Please check your inputs: " + err.issues[0].message);
      } else {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [user, formData, navigate]);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-[32px] shadow-sm border border-natural-200 overflow-hidden">
      <div className="bg-natural-700 px-6 py-10 text-white sm:px-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Calculate Your Carbon Footprint</h1>
        <p className="mt-4 text-natural-100 max-w-2xl mx-auto text-sm sm:text-base opacity-80">
          Answer a few questions about your lifestyle to see your annual CO₂ emissions and get personalized ways to reduce them.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-10 sm:px-12 space-y-12">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-200" role="alert">
            {error}
          </div>
        )}

        <section aria-labelledby="transport-heading">
          <div className="flex items-center gap-2 mb-6">
            <Car className="w-5 h-5 text-natural-500" />
            <h2 id="transport-heading" className="text-lg font-bold text-natural-800">Transport</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="carType" className="block text-xs font-bold uppercase tracking-widest text-natural-500 mb-2">Car Type</label>
              <select
                id="carType"
                className="w-full rounded-lg border-natural-200 border px-4 py-3 text-sm focus:border-natural-700 focus:ring-natural-700 focus:outline-none bg-natural-50"
                value={formData.transport.carType}
                onChange={(e) => handleChange("transport", "carType", e.target.value)}
              >
                <option value="gas">Gasoline / Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="ev">Electric</option>
                <option value="none">No Car (Public Transit/Bike)</option>
              </select>
            </div>
            {formData.transport.carType !== "none" && (
              <div>
                <label htmlFor="kmPerWeek" className="block text-xs font-bold uppercase tracking-widest text-natural-500 mb-2">Driving Distance (km/week)</label>
                <input
                  type="number"
                  id="kmPerWeek"
                  min="0"
                  max="5000"
                  required
                  aria-required="true"
                  className="w-full rounded-lg border-natural-200 border px-4 py-3 text-sm focus:border-natural-700 focus:ring-natural-700 focus:outline-none bg-natural-50"
                  value={formData.transport.kmPerWeek}
                  onChange={(e) => handleChange("transport", "kmPerWeek", Number(e.target.value))}
                />
              </div>
            )}
            <div>
              <label htmlFor="flightsPerYear" className="block text-xs font-bold uppercase tracking-widest text-natural-500 mb-2">Flights (per year)</label>
              <input
                type="number"
                id="flightsPerYear"
                min="0"
                max="100"
                required
                aria-required="true"
                className="w-full rounded-lg border-natural-200 border px-4 py-3 text-sm focus:border-natural-700 focus:ring-natural-700 focus:outline-none bg-natural-50"
                value={formData.transport.flightsPerYear}
                onChange={(e) => handleChange("transport", "flightsPerYear", Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="home-heading">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-natural-500" />
            <h2 id="home-heading" className="text-lg font-bold text-natural-800">Home Energy</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="electricityKwh" className="block text-xs font-bold uppercase tracking-widest text-natural-500 mb-2">Electricity (kWh/M)</label>
              <input
                type="number"
                id="electricityKwh"
                min="0"
                max="10000"
                required
                aria-required="true"
                className="w-full rounded-lg border-natural-200 border px-4 py-3 text-sm focus:border-natural-700 focus:ring-natural-700 focus:outline-none bg-natural-50"
                value={formData.homeEnergy.electricityKwhPerMonth}
                onChange={(e) => handleChange("homeEnergy", "electricityKwhPerMonth", Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="gasUsage" className="block text-xs font-bold uppercase tracking-widest text-natural-500 mb-2">Natural Gas (units/M)</label>
              <input
                type="number"
                id="gasUsage"
                min="0"
                max="10000"
                required
                aria-required="true"
                className="w-full rounded-lg border-natural-200 border px-4 py-3 text-sm focus:border-natural-700 focus:ring-natural-700 focus:outline-none bg-natural-50"
                value={formData.homeEnergy.gasUsage}
                onChange={(e) => handleChange("homeEnergy", "gasUsage", Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="renewable" className="block text-xs font-bold uppercase tracking-widest text-natural-500 mb-2">Renewable Energy (%)</label>
              <input
                type="number"
                id="renewable"
                min="0"
                max="100"
                required
                aria-required="true"
                className="w-full rounded-lg border-natural-200 border px-4 py-3 text-sm focus:border-natural-700 focus:ring-natural-700 focus:outline-none bg-natural-50"
                value={formData.homeEnergy.renewablePercentage}
                onChange={(e) => handleChange("homeEnergy", "renewablePercentage", Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="diet-heading">
          <div className="flex items-center gap-2 mb-6">
            <Leaf className="w-5 h-5 text-natural-500" />
            <h2 id="diet-heading" className="text-lg font-bold text-natural-800">Diet</h2>
          </div>
          <div>
            <label htmlFor="meatFrequency" className="block text-xs font-bold uppercase tracking-widest text-natural-500 mb-2">Meat Consumption</label>
            <select
              id="meatFrequency"
              className="w-full sm:max-w-xs rounded-lg border-natural-200 border px-4 py-3 text-sm focus:border-natural-700 focus:ring-natural-700 focus:outline-none bg-natural-50"
              value={formData.diet.meatFrequency}
              onChange={(e) => handleChange("diet", "meatFrequency", e.target.value)}
            >
              <option value="daily">Daily (High emission)</option>
              <option value="weekly">Weekly (Medium emission)</option>
              <option value="rarely">Rarely / Pescatarian (Low emission)</option>
              <option value="vegan">Vegan / Vegetarian (Lowest emission)</option>
            </select>
          </div>
        </section>

        <section aria-labelledby="shopping-heading">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingBag className="w-5 h-5 text-natural-500" />
            <h2 id="shopping-heading" className="text-lg font-bold text-natural-800">Shopping & Waste</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="onlineOrders" className="block text-xs font-bold uppercase tracking-widest text-natural-500 mb-2">Online Orders (per month)</label>
              <input
                type="number"
                id="onlineOrders"
                min="0"
                max="500"
                required
                aria-required="true"
                className="w-full rounded-lg border-natural-200 border px-4 py-3 text-sm focus:border-natural-700 focus:ring-natural-700 focus:outline-none bg-natural-50"
                value={formData.shoppingWaste.onlineOrdersPerMonth}
                onChange={(e) => handleChange("shoppingWaste", "onlineOrdersPerMonth", Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="recyclingHabits" className="block text-xs font-bold uppercase tracking-widest text-natural-500 mb-2">Recycling Habits</label>
              <select
                id="recyclingHabits"
                className="w-full rounded-lg border-natural-200 border px-4 py-3 text-sm focus:border-natural-700 focus:ring-natural-700 focus:outline-none bg-natural-50"
                value={formData.shoppingWaste.recyclingHabits}
                onChange={(e) => handleChange("shoppingWaste", "recyclingHabits", e.target.value)}
              >
                <option value="always">Always recycle what I can</option>
                <option value="sometimes">Sometimes recycle</option>
                <option value="never">Rarely or never recycle</option>
              </select>
            </div>
          </div>
        </section>

        <div className="pt-8 border-t border-natural-200 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 bg-natural-700 hover:bg-natural-600 text-white font-bold uppercase tracking-wider text-sm rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-natural-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Calculating..." : "Calculate My Footprint"}
          </button>
        </div>
      </form>
    </div>
  );
}
