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
  aspiring: {
    streak: number;
    total_activities: number;
    streak_days: number[];
  };
}

// Helper function to calculate streak from activity dates
const calculateStreakFromDates = (dates: string[]): { streak: number; activeArray: number[] } => {
  if (dates.length === 0) return { streak: 0, activeArray: Array(30).fill(0) };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const activeArray = Array(30).fill(0);
  const activeDates = new Set<string>();

  // Convert all dates to YYYY-MM-DD and add to set
  dates.forEach(dateStr => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    activeDates.add(date.toISOString().split('T')[0]);
  });

  // Fill active array for last 30 days
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    activeArray[29 - i] = activeDates.has(dateStr) ? 1 : 0;
  }

  // Calculate current streak
  let streak = 0;
  for (let i = 29; i >= 0; i--) {
    if (activeArray[i] === 1) {
      streak++;
    } else if (streak > 0) {
      break;
    }
  }

  return { streak, activeArray };
};

export const useStreakData = () => {
  return useQuery({
    queryKey: ["streak-data"],
    queryFn: async (): Promise<StreakData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("github_url, leetcode_url, kaggle_url")
        .eq("user_id", user.id)
        .single();

      // Fetch activity data from learning goals, projects, and certificates
      const [goalsRes, projectsRes, certsRes] = await Promise.all([
        supabase
          .from("learning_goals")
          .select("created_at")
          .eq("user_id", user.id),
        supabase
          .from("projects")
          .select("created_at")
          .eq("user_id", user.id),
        supabase
          .from("certificates")
          .select("created_at")
          .eq("user_id", user.id),
      ]);

      // Combine all activity dates for "aspiring" streak (learning/building activity)
      const allActivityDates = [
        ...(goalsRes.data?.map(g => g.created_at) || []),
        ...(projectsRes.data?.map(p => p.created_at) || []),
        ...(certsRes.data?.map(c => c.created_at) || []),
      ];

      const { streak: aspiringStreak, activeArray: aspiringArray } = calculateStreakFromDates(allActivityDates);

      // For GitHub, LeetCode, and Kaggle - show 0s if profiles not connected, otherwise show aspiring activity
      // In production, these would be populated by actual GitHub/LeetCode/Kaggle API calls
      const hasGithub = !!profile?.github_url;
      const hasLeetcode = !!profile?.leetcode_url;
      const hasKaggle = !!profile?.kaggle_url;

      return {
        github: {
          today_commits: hasGithub ? 0 : 0, // Would be fetched from GitHub API
          weekly_commits: hasGithub ? 0 : 0,
          active_days: hasGithub ? 0 : 0,
          streak: hasGithub ? 0 : 0,
        },
        leetcode: {
          today_solved: hasLeetcode ? 0 : 0, // Would be fetched from LeetCode API
          weekly_solved: hasLeetcode ? 0 : 0,
          streak: hasLeetcode ? 0 : 0,
        },
        kaggle: {
          weekly_activity: hasKaggle ? 0 : 0, // Would be fetched from Kaggle API
          last_active_days_ago: hasKaggle ? null : null,
          note: hasKaggle ? "No data yet" : "No Kaggle profile linked",
        },
        aspiring: {
          streak: aspiringStreak,
          total_activities: allActivityDates.length,
          streak_days: aspiringArray,
        },
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
