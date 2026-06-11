import { NextResponse } from "next/server";
import { parseResume } from "@/lib/parseResume";
import { analyzeResume } from "@/lib/analyzeResume";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    const jdFile = formData.get("jobDescriptionFile") as File | null;
    const jdText = formData.get("jobDescriptionText") as string | null;

    if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Configuration Error: No AI provider API keys found. Please duplicate .env.example to .env.local and add an API key." },
        { status: 500 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds maximum size of 10MB." }, { status: 400 });
    }

    if (!file.type && !file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
      return NextResponse.json({ error: "Unsupported file format." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 1. Extract Resume Text
    let extractedText = "";
    try {
      extractedText = await parseResume(buffer, file.name, file.type);
    } catch (error: any) {
      return NextResponse.json({ error: error.message || "Failed to extract text from the file." }, { status: 400 });
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: "Extracted resume is empty." }, { status: 400 });
    }

    // 2. Extract JD Text
    let combinedJdText = jdText ? jdText.trim() : "";
    if (jdFile && (jdFile.type || jdFile.name.match(/\.(pdf|doc|docx|txt)$/i))) {
      try {
        const jdBuffer = Buffer.from(await jdFile.arrayBuffer());
        if (jdFile.name.match(/\.txt$/i) || jdFile.type.includes("text/plain")) {
          combinedJdText += "\n" + jdBuffer.toString("utf-8");
        } else {
          const parsedJd = await parseResume(jdBuffer, jdFile.name, jdFile.type);
          combinedJdText += "\n" + parsedJd;
        }
      } catch (error: any) {
        return NextResponse.json({ error: "Failed to extract text from the Job Description file." }, { status: 400 });
      }
    }

    // 3. Unified AI Analysis (OpenAI -> Gemini fallback handled internally)
    try {
      const fullAnalysis = await analyzeResume(extractedText, combinedJdText);
      return NextResponse.json(fullAnalysis);
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      let errorMsg = "Failed to analyze the resume using AI.";
      
      // Since it fell back and still failed, we surface the error
      if (error.message?.includes("503") || error.message?.includes("high demand") || error.message?.includes("rate limit") || error.message?.includes("429")) {
        errorMsg = "The AI servers are currently experiencing high demand or rate limits. Both primary and fallback providers failed. Please try again.";
      }
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
