import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { AIProvider } from "./types";

const apiKey = process.env.GEMINI_API_KEY || "";
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const aiClient = new GoogleGenAI({ apiKey });

export const geminiProvider: AIProvider = {
  name: "Gemini",
  generateObject: async <T>(
    prompt: string,
    schema: z.ZodType<T>,
    schemaName: string,
    systemInstruction: string
  ): Promise<T> => {
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");

    // Convert Zod to JSON Schema format that Gemini understands
    const jsonSchema: any = zodToJsonSchema(schema as any, { target: "jsonSchema7" });
    const responseSchema = jsonSchema.definitions 
      ? jsonSchema.definitions[Object.keys(jsonSchema.definitions)[0]]
      : jsonSchema;

    const response = await aiClient.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty response.");
    }

    return JSON.parse(response.text) as T;
  }
};
