import { z } from "zod";

export interface AIProvider {
  name: string;
  generateObject<T>(
    prompt: string,
    schema: z.ZodType<T>,
    schemaName: string,
    systemInstruction: string
  ): Promise<T>;
}
