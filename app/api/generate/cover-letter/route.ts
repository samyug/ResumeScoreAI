import { NextResponse } from "next/server";
import { parseResume } from "@/lib/parseResume";
import { generateCoverLetter } from "@/lib/generateAssets";

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

    if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";
    try {
      extractedText = await parseResume(buffer, file.name, file.type);
    } catch (error: any) {
      return NextResponse.json({ error: "Failed to extract text from the resume." }, { status: 400 });
    }

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
        return NextResponse.json({ error: "Failed to extract text from the JD file." }, { status: 400 });
      }
    }

    try {
      const result = await generateCoverLetter(extractedText, combinedJdText);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error("Gemini Generation Error:", error);
      let errorMsg = "Failed to generate Cover Letter.";
      if (error.status === 503 || error.message?.includes("503")) errorMsg = "The AI servers are currently busy. Please try again.";
      if (error.status === 429 || error.message?.includes("429")) errorMsg = "AI rate limit exceeded. Please try again later.";
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
