import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
app.use(cors({
  origin: ["https://pathfinderstale.netlify.app", "http://localhost:5173"], 
  methods: ["GET", "POST"],
}));
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Initialize Gemini client
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fun facts endpoint
app.get("/api/fun-facts", async (req, res) => {
  const { country } = req.query;

  if (!country) return res.status(400).json({ error: "Country is required" });

  try {
    const model = ai.getGenerativeModel({
      model: "models/gemini-2.5-flash-preview-05-20",
    });

    const prompt = `Give me 5 fun facts about ${country}.`;

    const result = await model.generateContent(prompt);
    let text = await result.response.text();

    // Clean up text (remove ``` if any)
    text = text.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(\w*)\n/, '');
      text = text.replace(/```$/, '');
    }

    res.json({ facts: text });
  } catch (err) {
    console.error("Gemini Error:", err);
    res.status(500).json({ error: "Failed to fetch fun facts" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
