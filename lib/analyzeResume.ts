import { UnifiedResumeAnalysisSchema, FullResumeAnalysis } from "./schema";
import { generateObject } from "./ai";

const UNIFIED_PROMPT = `You are a Principal Recruiter, Career Coach, and ATS Parsing Expert.
Your job is to rigorously evaluate a resume.

RULES:
- Be highly critical. Do not inflate scores.
- Avoid generic praise.
- Evaluate ATS compatibility rigorously (look for tables, multi-columns, weird headers).
- Identify recruiter concerns honestly.
- Highlight missing metrics and vague accomplishments.

IF A JOB DESCRIPTION IS PROVIDED:
- Strictly evaluate the resume against the job description.
- Never fabricate experience or invent qualifications.
- Identify keyword gaps with strict precision.
- Provide actionable, high-impact tailoring recommendations to bridge the gap.
- Populate the optional job match fields in the JSON response.

IF NO JOB DESCRIPTION IS PROVIDED:
- Only populate the base evaluation fields.
- Omit all job match fields (e.g., jobMatchScore, missingKeywords, tailoredSummary, etc.).`;

export async function analyzeResume(resumeText: string, jdText?: string): Promise<FullResumeAnalysis> {
  let userText = "=== RESUME ===\n" + resumeText;
  if (jdText && jdText.trim().length > 0) {
    userText += "\n\n=== JOB DESCRIPTION ===\n" + jdText;
  }

  return await generateObject<FullResumeAnalysis>(
    userText,
    UnifiedResumeAnalysisSchema,
    "FullResumeAnalysis",
    UNIFIED_PROMPT
  );
}
