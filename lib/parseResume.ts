import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function parseResume(fileBuffer: Buffer, fileName: string, fileType: string): Promise<string> {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (fileType === "application/pdf" || ext === "pdf") {
    try {
      const data = await pdfParse(fileBuffer);
      return data.text;
    } catch (error) {
      console.error("PDF Parsing Error:", error);
      throw new Error("Failed to parse PDF file.");
    }
  }

  if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
    fileType === "application/msword" ||
    ext === "docx" || 
    ext === "doc"
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    } catch (error) {
      console.error("DOCX Parsing Error:", error);
      throw new Error("Failed to parse DOCX file.");
    }
  }

  if (ext === "txt" || fileType === "text/plain") {
    return fileBuffer.toString("utf-8");
  }

  throw new Error("Unsupported file type.");
}
