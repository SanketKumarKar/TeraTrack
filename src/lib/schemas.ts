/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared validation schemas used by both the client-side form
 * and the server-side API route to prevent schema drift.
 */

import { z } from "zod";

/** Validates the complete user carbon footprint input. */
export const CalculationSchema = z.object({
  transport: z.object({
    carType: z.enum(["gas", "hybrid", "ev", "none"]),
    kmPerWeek: z.number().min(0, "Must be positive").max(5000, "Too high for weekly usage"),
    flightsPerYear: z.number().min(0).max(100),
  }),
  homeEnergy: z.object({
    electricityKwhPerMonth: z.number().min(0).max(10000),
    gasUsage: z.number().min(0).max(10000),
    renewablePercentage: z.number().min(0).max(100),
  }),
  diet: z.object({
    meatFrequency: z.enum(["daily", "weekly", "rarely", "vegan"]),
  }),
  shoppingWaste: z.object({
    onlineOrdersPerMonth: z.number().min(0).max(500),
    recyclingHabits: z.enum(["always", "sometimes", "never"]),
  }),
});

export type CalculationInput = z.infer<typeof CalculationSchema>;

/** Validates an individual chat message sent to the AI endpoint. */
export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000, "Message too long"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        parts: z.array(z.object({ text: z.string().max(4000) })),
      })
    )
    .max(40, "History too long"), // 40 parts = 20 turns
});
