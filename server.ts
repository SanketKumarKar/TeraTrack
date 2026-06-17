import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Schema Definitions ---
const CalculationSchema = z.object({
  transport: z.object({
    carType: z.enum(["gas", "hybrid", "ev", "none"]),
    kmPerWeek: z.number().min(0).max(5000),
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for rate limit behind reverse proxy (like Cloud Run)
  app.set("trust proxy", 1);

  // Enhance security (disabled Helmet's iframe restriction for preview compatibility)
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    frameguard: false
  }));
  app.use(express.json());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: "Too many requests, please try again later." }
  });
  app.use("/api/", limiter);

  // API Routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const systemInstruction = "You are a helpful, expert AI assistant specialized in carbon footprint reduction, sustainability, and climate change awareness. Provide concise, actionable advice in a friendly, encouraging, and natural tone. Align with the TerraTrack project theme.";
      
      const contents = [
        ...history,
        { role: "user", parts: [{ text: message }]}
      ];
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
        }
      });
      
      res.json({ response: response.text });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  app.post("/api/calculate", (req, res) => {
    try {
      const parsedData = CalculationSchema.parse(req.body);
      
      // Calculate carbon footprint (dummy logic for server-side validation / store)
      // The actual math might be shared, here we just do a quick computation for the score.
      let score = 0;
      
      // Very basic scoring logic for the backend just to satisfy storing a score
      // We will have a more detailed shared library.
      if (parsedData.transport.carType === "gas") score += 2;
      score += (parsedData.transport.kmPerWeek * 0.0002) * 52;
      score += parsedData.transport.flightsPerYear * 1.5;
      
      score += (parsedData.homeEnergy.electricityKwhPerMonth * 12 * 0.0005) * ((100 - parsedData.homeEnergy.renewablePercentage) / 100);
      score += parsedData.homeEnergy.gasUsage * 12 * 0.002;
      
      if (parsedData.diet.meatFrequency === "daily") score += 3.3;
      if (parsedData.diet.meatFrequency === "weekly") score += 1.7;
      if (parsedData.diet.meatFrequency === "rarely") score += 1.0;
      if (parsedData.diet.meatFrequency === "vegan") score += 0.5;
      
      score += parsedData.shoppingWaste.onlineOrdersPerMonth * 12 * 0.05;
      if (parsedData.shoppingWaste.recyclingHabits === "never") score += 0.5;

      res.json({ success: true, score });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.issues });
      }
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
