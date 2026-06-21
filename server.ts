import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { CalculationSchema, ChatRequestSchema } from "./src/lib/schemas.js";
import { calculateTotalFootprint } from "./src/lib/calculator.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


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
      // Validate request body to prevent prompt injection and token abuse
      const parsed = ChatRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request: " + parsed.error.issues[0].message });
      }
      const { message, history } = parsed.data;

      const systemInstruction = "You are a helpful, expert AI assistant specialized in carbon footprint reduction, sustainability, and climate change awareness. Provide concise, actionable advice in a friendly, encouraging, and natural tone. Align with the TerraTrack project theme.";
      
      const contents = [
        ...history,
        { role: "user", parts: [{ text: message }]}
      ];
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
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
      
      // Use the shared calculator for consistent results with the frontend
      const { score } = calculateTotalFootprint(parsedData);

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
