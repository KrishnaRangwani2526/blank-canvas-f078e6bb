import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ResumeData } from "@/hooks/useResumeMaker";

export function useCompanyResumeGeneration() {
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState<ResumeData | null>(null);

  const generateCandidateResume = async (candidateId: string) => {
    setLoading(true);
    try {
      // Fetch candidate data
      const { data: candidateData, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", candidateId)
        .single();

      if (error || !candidateData) throw new Error("Candidate not found");

      // Simulate generation delay
      await new Promise((r) => setTimeout(r, 1500));

      const generatedResume: ResumeData = {
        name: candidateData.name,
        email: candidateData.email || "contact@example.com",
        phone: "+1 (555) 000-0000",
        location: candidateData.bio || "Remote",
        bio: candidateData.about || "Professional developer",
        skills: (candidateData.skills || []) as string[],
        experience:
          ((candidateData.experience as any[]) || []).map((e) => ({
            company: e.company,
            role: e.role,
            duration: `${e.startDate || "2020"} - ${e.endDate || "Present"}`,
            description: e.description || "Contributed to team projects",
          })) || [],
        education:
          ((candidateData.education as any[]) || []).map((e) => ({
            school: e.school,
            degree: e.degree,
            field: e.field || "Computer Science",
            year: e.endDate || "2024",
          })) || [],
        projects:
          ((candidateData.projects as any[]) || []).map((p) => ({
            name: p.title,
            description: p.description || "Work in progress",
            tech: p.tech_stack || [],
            link: p.link,
          })) || [],
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

  return { generateCandidateResume, resume, loading };
}
