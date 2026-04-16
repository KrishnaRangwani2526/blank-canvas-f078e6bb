import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// Load .env
const envFile = fs.readFileSync(".env", "utf8");
const envVars = envFile.split("\n").reduce((acc, line) => {
  const [key, ...values] = line.split("=");
  if (key && values.length > 0) {
    acc[key.trim()] = values.join("=").replace(/"/g, "").trim();
  }
  return acc;
}, {} as any);

const apiKey = envVars.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.log("No API Key");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function testGemini() {
  const prompt = `You are an expert AI Resume and ATS Analyzer. Your task is to analyze the following candidate profile strictly.

Candidate Profile JSON:
{
  "bio": "I am a frontend developer",
  "skills": ["React", "TypeScript", "Node.js"],
  "experience": [{"role": "Frontend Developer", "company": "Tech Corp", "description": "Built things"}],
  "projects": [],
  "education": []
}

Provide a detailed JSON response exactly matching this schema:
{
  "ats_score": number (0-100),
  "summary": "overall summary",
  "profile_summary": {
    "bio": "string",
    "top_skills": ["skill1"],
    "current_projects": [],
    "certifications": {"has_certs": false, "list": [], "summary": ""},
    "experience_highlights": ["string"]
  },
  "score_breakdown": [
    {"category": "Skills Quality & Relevance", "score": 90, "max": 100, "detail": "string"}
  ],
  "profile_gaps": [],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "consistency_score": 50,
  "recommendations": ["actionable advice 1"],
  "learning_roadmap": ["week 1 plan"]
}
Limit score_breakdown categories to 3-5 critical areas. Make the response highly customized to the candidate's actual data. If the profile is largely empty, reflect that with a low score and basic advice. DO NOT INCLUDE MARKDOWN FORMATTING (like \`\`\`json) IN YOUR RESPONSE, JUST THE RAW JSON OBJECT.`;

  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });
    console.log(result.response.text());
  } catch (error) {
    console.error("error", error);
  }
}

testGemini();
