import { CoverLetterResult, InterviewQuestionsResult, CoverLetterSchema, InterviewQuestionsSchema } from "./generationSchema";
import { generateObject } from "./ai";

const CL_PROMPT = `You are an expert Career Coach and Executive Assistant.
Generate a highly professional, modern cover letter.

RULES:
- Do NOT use generic placeholder fluff like "I am a hard worker".
- Strictly extract facts, achievements, and skills from the provided Resume.
- If a Job Description is provided, heavily tailor the letter to bridge the resume's experience with the JD's exact needs.
- If no Job Description is provided, create a strong, general-purpose letter highlighting the best achievements.
- DO NOT invent or fabricate any experience, metrics, or technologies.
- Tone: Confident, direct, and recruiter-friendly.`;

const IQ_PROMPT = `You are a strict Hiring Manager and Technical Recruiter.
Generate realistic interview questions based on the candidate's resume and target role.

RULES:
- Questions must be deeply rooted in the actual claims made on the resume.
- If a Job Description is provided, probe the gaps between the resume and the JD requirements.
- Avoid generic lists (e.g., "What is your biggest weakness?"). Instead, ask specific behavioral or technical questions about the projects listed.
- Categorize questions correctly.
- Provide a brief 'focusContext' explaining exactly why this question is being asked based on the resume/JD.`;

export async function generateCoverLetter(resumeText: string, jdText?: string): Promise<CoverLetterResult> {
  let userText = "=== RESUME ===\n" + resumeText;
  if (jdText && jdText.trim().length > 0) {
    userText += "\n\n=== JOB DESCRIPTION ===\n" + jdText;
  }

  return await generateObject<CoverLetterResult>(
    userText,
    CoverLetterSchema,
    "CoverLetter",
    CL_PROMPT
  );
}

export async function generateInterviewQuestions(resumeText: string, jdText?: string): Promise<InterviewQuestionsResult> {
  let userText = "=== RESUME ===\n" + resumeText;
  if (jdText && jdText.trim().length > 0) {
    userText += "\n\n=== JOB DESCRIPTION ===\n" + jdText;
  }

  return await generateObject<InterviewQuestionsResult>(
    userText,
    InterviewQuestionsSchema,
    "InterviewQuestions",
    IQ_PROMPT
  );
}
