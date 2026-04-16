import { supabase } from "@/integrations/supabase/client";

type ExtractedSkill = {
  name?: string | null;
  category?: string | null;
};

export const normalizeTechStack = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export const formatTechStackForStorage = (value: unknown): string | null => {
  const normalized = normalizeTechStack(value);
  return normalized.length ? normalized.join(", ") : null;
};

export const joinTechStack = (value: unknown): string => normalizeTechStack(value).join(" ");

export const isGitHubRepoLink = (value: unknown): boolean => {
  return typeof value === "string" && /github\.com/i.test(value);
};

export const saveExtractedSkills = async (userId: string, skills: ExtractedSkill[]) => {
  const uniqueSkills = Array.from(
    new Map(
      skills
        .map((skill) => ({
          user_id: userId,
          name: skill.name?.trim() || "",
          category: skill.category?.trim() || null,
        }))
        .filter((skill) => skill.name)
        .map((skill) => [skill.name.toLowerCase(), skill]),
    ).values(),
  );

  if (uniqueSkills.length === 0) {
    return 0;
  }

  const { data: existingSkills, error: existingError } = await supabase
    .from("skills")
    .select("name")
    .eq("user_id", userId);

  if (existingError) {
    throw existingError;
  }

  const existingNames = new Set((existingSkills || []).map((skill) => skill.name.trim().toLowerCase()));
  const skillsToInsert = uniqueSkills.filter((skill) => !existingNames.has(skill.name.toLowerCase()));

  if (skillsToInsert.length === 0) {
    return 0;
  }

  const { error: insertError } = await supabase.from("skills").insert(skillsToInsert);

  if (insertError) {
    throw insertError;
  }

  return skillsToInsert.length;
};