import { GoogleGenAI } from "@google/genai";

// Ensure the API key is set
const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "";

if (!apiKey) {
  console.warn("Missing API Key. Please set GEMINI_API_KEY or OPENAI_API_KEY in .env");
}

export const aiClient = new GoogleGenAI({ apiKey });

export const geminiModel = "gemini-2.5-flash";
