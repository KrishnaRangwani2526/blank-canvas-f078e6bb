import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StreakData {
  github: {
    today_commits: number;
    weekly_commits: number;
    active_days: number;
    streak: number;
  };
  leetcode: {
    today_solved: number;
    weekly_solved: number;
    streak: number;
  };
  kaggle: {
    weekly_activity: number;
    last_active_days_ago: number | null;
    note: string;
  };
}

export const useStreakData = () => {
  return useQuery({
    queryKey: ["streak-data"],
    queryFn: async (): Promise<StreakData> => {
      // First get the user's profile to get their platform URLs
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("github_url, leetcode_url, kaggle_url")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      // Call the streak-extractor API
      const response = await fetch("http://localhost:5000/analyze-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          github_url: profile.github_url,
          leetcode_url: profile.leetcode_url,
          kaggle_url: profile.kaggle_url,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch streak data");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to analyze profile");
      }

      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};