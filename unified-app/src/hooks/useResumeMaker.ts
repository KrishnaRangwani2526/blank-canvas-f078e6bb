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
      // Simulate resume generation delay
      await new Promise((r) => setTimeout(r, 2000));

      const generatedResume: ResumeData = {
        name: profile?.full_name || "Professional",
        email: user?.email || "contact@example.com",
        phone: profile?.phone || "+1 (555) 000-0000",
        location: profile?.location || "Remote",
        bio: profile?.bio || profile?.about || "Professional developer passionate about building quality software.",
        skills: skills.map((s) => s.name),
        experience: experience.map((e) => ({
          company: e.company,
          role: e.role,
          duration: `${e.start_date || "2020"} - ${e.end_date || "Present"}`,
          description: e.description || `Contributed to team projects and developed ${e.role} skills.`,
        })),
        education: education.map((e) => ({
          school: e.school,
          degree: e.degree,
          field: e.field_of_study || "Computer Science",
          year: e.end_date || "2024",
        })),
        projects: projects.map((p) => ({
          name: p.title,
          description: p.description || "Work in progress",
          tech: p.tech_stack || [],
          link: p.project_link,
        })),
      };

      setResume(generatedResume);
      return generatedResume;
    } catch (err: any) {
      toast.error(err.message || "Failed to generate resume");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generateResume, resume, loading };
}
