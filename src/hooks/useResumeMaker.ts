// @ts-nocheck
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "./useProfile";
import { toast } from "sonner";

export interface ResumeData {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills: string[];
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    year: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    tech: string[];
    link?: string;
  }>;
}

export function useResumeMaker() {
  const { user } = useAuth();
  const { profile, skills, experience, projects, education } = useProfile(user?.id);
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState<ResumeData | null>(null);

  const generateResume = async (profileUrl?: string) => {
    if (!profile && !profileUrl) {
      toast.error("Profile data required to generate resume");
      return null;
    }

    setLoading(true);
    try {
      const profileContext = {
        name: profile?.full_name || "Professional",
        email: user?.email || "contact@example.com",
        phone: profile?.phone || "+1 (555) 000-0000",
        location: profile?.location || "Remote",
        bio: profile?.bio || profile?.about || "",
        skills: skills.map((s) => s.name),
        experience: experience.map((e) => ({
          company: e.company,
          role: e.role,
          duration: `${e.start_date || "2020"} - ${e.end_date || "Present"}`,
          description: e.description || "",
        })),
        education: education.map((e) => ({
          school: e.school,
          degree: e.degree,
          field: e.field_of_study || "Computer Science",
          year: e.end_date || "2024",
        })),
        projects: projects.map((p) => ({
          name: p.title,
          description: p.description || "",
          tech: p.tech_stack || [],
          link: p.project_link,
        })),
      };

      const prompt = `You are an expert Resume Writer and Career Coach. Take the following raw candidate profile data and rewrite it into a highly professional, polished Resume format. Focus on action verbs, metric-driven achievements if possible, and correct grammar.

Raw Data:
${JSON.stringify(profileContext, null, 2)}

Provide a detailed JSON response exactly matching this schema to populate the UI (DO NOT use \`\`\`json markdown blocks, just raw JSON text):
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "bio": "string (a powerful professional summary)",
  "skills": ["string", "string"],
  "experience": [{
    "company": "string",
    "role": "string",
    "duration": "string",
    "description": "string (bullet points separated by \\n\\n or a highly polished paragraph)"
  }],
  "education": [{
    "school": "string",
    "degree": "string",
    "field": "string",
    "year": "string"
  }],
  "projects": [{
    "name": "string",
    "description": "string",
    "tech": ["string"],
    "link": "string"
  }]
}`;

      const { generateJSONWithGemini } = await import("@/lib/gemini");
      const generatedResume = await generateJSONWithGemini(prompt);

      setResume(generatedResume);
      return generatedResume;
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate AI resume");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generateResume, resume, loading };
}
