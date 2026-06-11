import OpenAI from "openai";
import { z } from "zod";
import { AIProvider } from "./types";

export const openAIProvider: AIProvider = {
  name: "OpenAI",
  generateObject: async <T>(
    prompt: string,
    schema: z.ZodType<T>,
    schemaName: string,
    systemInstruction: string
  ): Promise<T> => {
    const apiKey = process.env.OPENAI_API_KEY || "";
    const model = process.env.OPENAI_MODEL || "gpt-4o";
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");
    
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemInstruction + "\n\nYou must respond with raw JSON only. Do not include markdown formatting or backticks. Return exactly a JSON object." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("OpenAI returned an empty response.");
    }
    
    // Attempt to parse and validate
    const parsed = JSON.parse(content);
    return parsed as T;
  }
};
