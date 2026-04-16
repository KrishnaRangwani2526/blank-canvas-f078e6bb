// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type Education = Tables<"education">;
type Experience = Tables<"experience">;
type Project = Tables<"projects">;
type Certificate = Tables<"certificates">;
type Skill = Tables<"skills">;
type LearningGoal = Tables<"learning_goals">;

export interface ProfileData {
  profile: Profile | null;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certificates: Certificate[];
  skills: Skill[];
  learningGoals: LearningGoal[];
  loading: boolean;
  refetch: () => void;
}

export const useProfile = (userId?: string): ProfileData => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const syncCandidateRecord = useCallback(async () => {
    // Candidate data is derived from profiles/skills/etc tables directly.
    // No need to sync to a separate candidates table.
  }, []);

  const fetchAll = useCallback(async () => {
    if (!targetUserId) { setLoading(false); return; }
    setLoading(true);

    const [pRes, edRes, exRes, prRes, ceRes, skRes, lgRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", targetUserId).single(),
      supabase.from("education").select("*").eq("user_id", targetUserId).order("start_date", { ascending: false }),
      supabase.from("experience").select("*").eq("user_id", targetUserId).order("start_date", { ascending: false }),
      supabase.from("projects").select("*").eq("user_id", targetUserId).order("start_date", { ascending: false }),
      supabase.from("certificates").select("*").eq("user_id", targetUserId).order("issue_date", { ascending: false }),
      supabase.from("skills").select("*").eq("user_id", targetUserId),
      supabase.from("learning_goals").select("*").eq("user_id", targetUserId).order("created_at", { ascending: false }),
    ]);

    if (pRes.data) setProfile(pRes.data);
    if (edRes.data) setEducation(edRes.data);
    if (exRes.data) setExperience(exRes.data);
    if (prRes.data) setProjects(prRes.data);
    if (ceRes.data) setCertificates(ceRes.data);
    if (skRes.data) setSkills(skRes.data);
    if (lgRes.data) setLearningGoals(lgRes.data);
    setLoading(false);
  }, [targetUserId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!loading && profile) {
      syncCandidateRecord();
    }
  }, [loading, profile, syncCandidateRecord]);

  return { profile, education, experience, projects, certificates, skills, learningGoals, loading, refetch: fetchAll };
};
