# ResumeScore AI

ResumeScore AI is an intelligent, single-page application that evaluates resumes, highlights ATS (Applicant Tracking System) parsing risks, simulates recruiter feedback, and generates tailored cover letters and interview questions based on specific job descriptions. 

Built with Next.js and powered by OpenAI (Primary) and Google Gemini (Fallback), it guarantees resilient, high-speed structured data analysis.

## ✨ Features
* **ATS Risk Scanning:** Instantly identifies structural issues or formatting elements that prevent ATS parsers from reading your resume.
* **Recruiter Simulation:** Analyzes the resume just like a human recruiter, outputting a "first impression" summary, hiring recommendation, and the strongest/weakest aspects of the candidate.
* **Keyword Gap Analysis:** Compares your resume against a target job description and highlights high-impact missing keywords.
* **Resume Tailoring:** Suggests specific bullet-point rewrites and structural optimizations tailored to the target role.
* **Cover Letter Generation:** Drafts a professional cover letter combining your experience with the job requirements.
* **Interview Prep:** Predicts technical and behavioral interview questions the candidate is likely to face based on their resume claims.
* **Provider Failover:** Automatically routes requests to Google Gemini if the OpenAI API rate limits or fails.

## 🛠 Tech Stack
* **Framework**: [Next.js](https://nextjs.org/) (App Router)
* **Styling**: Vanilla CSS (Vibrant, glassmorphism UI)
* **AI Providers**: OpenAI (`gpt-4o`) & Google Gemini (`gemini-2.5-flash`)
* **Parsing**: `pdf-parse` (PDFs) and `mammoth` (DOCX)
* **Validation**: `zod` and `zod-to-json-schema` for guaranteed structured JSON outputs.

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd resumescore-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
You must provide at least one AI API key for the application to function. 
Duplicate the `.env.example` file and rename it to `.env.local`:
```bash
cp .env.example .env.local
```

Open `.env.local` and add your keys:
* **OPENAI_API_KEY**: Get it from [OpenAI Platform](https://platform.openai.com/api-keys)
* **GEMINI_API_KEY**: Get it from [Google AI Studio](https://aistudio.google.com/app/apikey)

*Note: OpenAI is the primary provider. If the OpenAI key is missing or rate-limited, the application automatically falls back to Gemini.*

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 🏗 Building for Production

To create an optimized production build:
```bash
npm run build
npm start
```

## 🐛 Troubleshooting
* **Error: "Configuration Error: No AI provider API keys found."**
  You haven't set up your `.env.local` file. Follow Step 3 above.
* **Error: "The AI servers are currently experiencing high demand or rate limits."**
  Both your primary (OpenAI) and fallback (Gemini) API keys have hit their rate limits or run out of credits. Check your billing dashboard for the respective provider.
* **Hydration Warning (`crxlauncher`)**
  If you see a React hydration warning regarding `crxlauncher=""` in your console, this is safely caused by a Chrome browser extension modifying the DOM. It does not affect application functionality.
