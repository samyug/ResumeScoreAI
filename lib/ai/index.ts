import { z } from "zod";
import { openAIProvider } from "./openaiProvider";
import { geminiProvider } from "./geminiProvider";

export async function generateObject<T>(
  prompt: string,
  schema: z.ZodType<T>,
  schemaName: string,
  systemInstruction: string
): Promise<T> {
  console.log(`[AI Provider] Attempting to generate object using ${openAIProvider.name}...`);
  try {
    const result = await openAIProvider.generateObject(prompt, schema, schemaName, systemInstruction);
    console.log(`[AI Provider] Successfully generated object using ${openAIProvider.name}.`);
    return result;
  } catch (error: any) {
    console.warn(`[AI Provider] ${openAIProvider.name} failed:`, error.message);
    console.log(`[AI Provider] Falling back to ${geminiProvider.name}...`);
    
    try {
      const result = await geminiProvider.generateObject(prompt, schema, schemaName, systemInstruction);
      console.log(`[AI Provider] Successfully generated object using ${geminiProvider.name}.`);
      return result;
    } catch (fallbackError: any) {
      console.error(`[AI Provider] ${geminiProvider.name} also failed:`, fallbackError.message);
      throw new Error(`Both AI providers failed. Primary: ${error.message} | Fallback: ${fallbackError.message}`);
    }
  }
}
