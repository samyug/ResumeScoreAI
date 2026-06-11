import { z } from "zod";

export const CoverLetterSchema = z.object({
  content: z.string()
});

export const InterviewQuestionsSchema = z.object({
  questions: z.array(z.object({
    category: z.enum(["Technical", "Behavioral", "Experience-Based", "Project-Specific", "Role-Specific"]),
    question: z.string(),
    focusContext: z.string()
  }))
});

export type CoverLetterResult = z.infer<typeof CoverLetterSchema>;
export type InterviewQuestionsResult = z.infer<typeof InterviewQuestionsSchema>;
