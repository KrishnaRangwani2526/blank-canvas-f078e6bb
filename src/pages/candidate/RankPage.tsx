import Navbar from "@/components/Navbar";
import { Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const RankPage = () => {
  const { user } = useAuth();

  // Fetch target user's skills count
  const { data: mySkillsCount = 0 } = useQuery({
    queryKey: ["my-skills-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from("skills")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      return count || 0;
    },
    enabled: Boolean(user?.id),
  });

  // Calculate global rank
  const { data: globalRank = 0 } = useQuery({
    queryKey: ["global-rank-full", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { data: mySkills } = await supabase
        .from("skills")
        .select("id")
        .eq("user_id", user.id);
      const myCount = mySkills?.length || 0;
      if (myCount === 0) return 0;

      const { data: allSkills } = await supabase
        .from("skills")
        .select("user_id");
      
      if (!allSkills) return 0;
      const counts: Record<string, number> = {};
      allSkills.forEach((s) => { counts[s.user_id] = (counts[s.user_id] || 0) + 1; });
      
      let rank = 1;
      Object.entries(counts).forEach(([uid, count]) => {
        if (uid !== user.id && count > myCount) rank++;
      });
      return rank;
    },
    enabled: Boolean(user?.id),
  });

  // Fetch total users for ranking top %
  const { data: totalUsers = 0 } = useQuery({
    queryKey: ["total-users-for-rank"],
    queryFn: async () => {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  // Fetch projects count
  const { data: projectCount = 0 } = useQuery({
    queryKey: ["user-projects-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      return count || 0;
    },
    enabled: Boolean(user?.id),
  });

  // Fetch certifications count
  const { data: certCount = 0 } = useQuery({
    queryKey: ["user-certs-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from("certificates")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      return count || 0;
    },
    enabled: Boolean(user?.id),
  });

  const getTopPercentage = () => {
    if (globalRank === 0 || totalUsers === 0) return null;
    const percentage = (globalRank / totalUsers) * 100;
    if (percentage <= 1) return "Top 1% of all developers worldwide";
    if (percentage <= 5) return "Top 5% of all developers worldwide";
    if (percentage <= 10) return "Top 10% of all developers worldwide";
    if (percentage <= 25) return "Top 25% of all developers worldwide";
    if (percentage <= 50) return "Top 50% of all developers worldwide";
    return `Top ${Math.ceil(percentage)}% of all developers worldwide`;
  };

  const topPercentageText = getTopPercentage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-card rounded-xl border p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-rank-bg flex items-center justify-center mb-4">
            <Trophy className="h-10 w-10 text-rank-gold" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Global Ranking</h1>
          <p className="text-5xl font-extrabold text-primary my-4">
            {globalRank === 0 ? "#0" : `#${globalRank.toLocaleString()}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {globalRank === 0 
              ? "Add skills to get ranked" 
              : topPercentageText || "Keep adding skills to improve your rank"}
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              ["Skills", mySkillsCount], 
              ["Projects", projectCount], 
              ["Certifications", certCount]
            ].map(([l, v]) => (
              <div key={l as string} className="bg-secondary rounded-lg p-3">
                <p className="text-lg font-bold text-foreground">{v}</p>
                <p className="text-xs text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankPage;
