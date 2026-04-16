// @ts-nocheck
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "./useProfile";
import { toast } from "sonner";

export interface ATSResult {
  ats_score: number;
  summary: string;
  profile_summary: {
    bio: string;
    top_skills: string[];
    current_projects: Array<{ name: string; description: string; tech: string[] }>;
    certifications: { has_certs: boolean; list: string[]; summary: string };
    experience_highlights: string[];
  };
  score_breakdown: Array<{ category: string; score: number; max: number; detail: string }>;
  profile_gaps: Array<{ area: string; severity: "high" | "medium" | "low"; detail: string }>;
  strengths: string[];
  weaknesses: string[];
  consistency_score: number;
  recommendations: string[];
  learning_roadmap: string[];
  match_percentage?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  gap_analysis?: string;
}

export function useAtsAnalyzer() {
  const { user } = useAuth();
  const { profile, skills, experience, projects, education } = useProfile(user?.id);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);

  const analyzeProfile = async (jobRequirements?: string) => {
    if (!profile) {
      toast.error("Please complete your profile first");
      return null;
    }

    setLoading(true);
    try {
      const profileContext = {
        bio: profile.bio || profile.about,
        skills: skills.map((s) => s.name),
        experience: experience.map((e) => ({ role: e.role, company: e.company, description: e.description })),
        projects: projects.map((p) => ({ title: p.title, description: p.description, tech: p.tech_stack })),
        education: education.map((e) => ({ degree: e.degree, field: e.field_of_study })),
      };

      const prompt = `You are an expert AI Resume and ATS Analyzer. Your task is to analyze the following candidate profile strictly.

Candidate Profile JSON:
${JSON.stringify(profileContext, null, 2)}

${jobRequirements ? `Job Requirements to match against:\n${jobRequirements}\n\n` : ''}
    
Provide a detailed JSON response exactly matching this schema:
{
  "ats_score": number (0-100),
  "summary": "overall summary",
  "profile_summary": {
    "bio": "string",
    "top_skills": ["skill1", ...],
    "current_projects": [{"name": "string", "description": "string", "tech": ["string"]}],
    "certifications": {"has_certs": boolean, "list": ["string"], "summary": "string"},
    "experience_highlights": ["string"]
  },
  "score_breakdown": [
    {"category": "Skills Quality & Relevance", "score": number, "max": 100, "detail": "string"},
    {"category": "Project Depth & Impact", "score": number, "max": 100, "detail": "string"},
    {"category": "Work Experience", "score": number, "max": 100, "detail": "string"}
  ],
  "profile_gaps": [{"area": "string", "severity": "high" | "medium" | "low", "detail": "string"}],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "consistency_score": number (0-100),
  "recommendations": ["actionable advice 1", ...],
  "learning_roadmap": ["week 1 plan", ...]
  ${jobRequirements ? `, "match_percentage": number, "matched_skills": ["string"], "missing_skills": ["string"], "gap_analysis": "string"` : ''}
}
Limit score_breakdown categories to 3-5 critical areas. Make the response highly customized to the candidate's actual data. If the profile is largely empty, reflect that with a low score and basic advice. DO NOT INCLUDE MARKDOWN FORMATTING (like \`\`\`json) IN YOUR RESPONSE, JUST THE RAW JSON OBJECT.`;

      const { generateJSONWithGemini } = await import("@/lib/gemini");
      const generatedResult = await generateJSONWithGemini(prompt);
      
      const completeResult: ATSResult = {
        ...generatedResult,
      };

      setResult(completeResult);
      return completeResult;
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to analyze profile with AI");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { analyzeProfile, result, loading };
}
