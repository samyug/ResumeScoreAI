import { z } from "zod";

export const UnifiedResumeAnalysisSchema = z.object({
  // Base fields
  resumeScore: z.number().describe("Overall score of the resume out of 100."),
  atsScore: z.number().describe("ATS compatibility score out of 100."),
  atsVerdict: z.string().describe("Brief verdict on ATS parsability."),
  atsRisks: z.array(z.object({
    issue: z.string(),
    severity: z.enum(["low", "medium", "high"]),
    explanation: z.string(),
    suggestedFix: z.string()
  })),
  recruiterSimulation: z.object({
    firstImpression: z.string(),
    strongestAspect: z.string(),
    biggestConcern: z.string(),
    interviewReadiness: z.enum(["Low", "Medium", "High"]),
    hiringRecommendation: z.string()
  }),
  topFiveFixes: z.array(z.object({
    impact: z.enum(["low", "medium", "high"]),
    action: z.string(),
    expectedScoreGain: z.string()
  })),

  // Job Match Fields (Optional, only populated if JD is provided)
  jobMatchScore: z.number().optional().describe("Score representing how well the resume aligns with the target job description out of 100. Omit if no job description was provided."),
  missingKeywords: z.array(z.object({
    keyword: z.string(),
    importance: z.enum(["low", "medium", "high"]),
    foundInJD: z.boolean()
  })).optional().describe("Important keywords missing from the resume. Omit if no job description was provided."),
  tailoredSummary: z.string().optional().describe("A rewritten professional summary tailored to the target job description. Omit if no job description was provided."),
  tailoredBullets: z.array(z.object({
    before: z.string(),
    after: z.string()
  })).optional().describe("Rewritten high-impact bullet points tailored to the job description. Omit if no job description was provided."),
  tailoringRecommendations: z.array(z.object({
    impact: z.enum(["low", "medium", "high"]),
    section: z.string(),
    recommendation: z.string()
  })).optional().describe("Strategic recommendations to better align the resume with the job description. Omit if no job description was provided.")
});

export type FullResumeAnalysis = z.infer<typeof UnifiedResumeAnalysisSchema>;
