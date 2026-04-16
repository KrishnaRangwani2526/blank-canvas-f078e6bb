// @ts-nocheck
import { useState } from "react";
import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Link } from "react-router-dom";
import { Diamond, ChevronDown, ChevronUp, TrendingUp, Award, FolderGit2, GitBranch, Brain, PieChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SkillsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { skills, certificates, projects, refetch } = useProfile();
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const totalSkills = skills.length;

  // Fetch universal rank data: for each skill, how many users have it
  const { data: rankData = {} } = useQuery({
    queryKey: ["skill-universal-ranks", user?.id, skills.map(s => s.name).join(",")],
    queryFn: async () => {
      if (skills.length === 0) return {};
      // Get all skills across all users to compute ranks
      const { data: allSkills } = await supabase.from("skills").select("name, user_id");
      if (!allSkills) return {};

      // Count usage per skill name (case-insensitive)
      const usageMap: Record<string, number> = {};
      allSkills.forEach(s => {
        const key = s.name.toLowerCase();
        usageMap[key] = (usageMap[key] || 0) + 1;
      });

      // For universal rank: sort all unique skill names by usage desc, assign rank
      const sorted = Object.entries(usageMap).sort((a, b) => b[1] - a[1]);
      const rankMap: Record<string, number> = {};
      sorted.forEach(([name], i) => { rankMap[name] = i + 1; });

      const result: Record<string, { usageCount: number; universalRank: number; totalUniqueSkills: number }> = {};
      skills.forEach(s => {
        const key = s.name.toLowerCase();
        result[s.name] = {
          usageCount: usageMap[key] || 1,
          universalRank: rankMap[key] || 0,
          totalUniqueSkills: sorted.length,
        };
      });
      return result;
    },
    enabled: skills.length > 0,
  });

  // Determine where each skill comes from
  const getSkillSources = (skillName: string) => {
    const sources: { type: string; icon: any; label: string }[] = [];
    const lower = skillName.toLowerCase();
    certificates.forEach(c => {
      if (c.name?.toLowerCase().includes(lower) || c.issuer?.toLowerCase().includes(lower)) {
        sources.push({ type: "certificate", icon: Award, label: `Certificate: ${c.name}` });
      }
    });
    projects.forEach(p => {
      const inTech = (p.tech_stack || []).some((t: string) => t.toLowerCase() === lower);
      const inTitle = p.title?.toLowerCase().includes(lower);
      const inDesc = p.description?.toLowerCase().includes(lower);
      if (inTech || inTitle || inDesc) {
        sources.push({ type: p.github_link ? "git" : "project", icon: p.github_link ? GitBranch : FolderGit2, label: `${p.github_link ? "Repo" : "Project"}: ${p.title}` });
      }
    });
    if (sources.length === 0) sources.push({ type: "ai", icon: Brain, label: "Extracted via AI" });
    return sources;
  };

  // Sort skills by universal rank (most used first)
  const sortedSkills = [...skills].sort((a, b) => {
    const ra = rankData[a.name]?.usageCount || 0;
    const rb = rankData[b.name]?.usageCount || 0;
    return rb - ra;
  });

  // Category breakdown for analytics
  const categories = skills.reduce((acc, s) => {
    const cat = s.category || "other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="w-56 md:w-64 flex-shrink-0">
            <div className="sticky top-20 overflow-y-auto max-h-[calc(100vh-5rem)] scrollbar-hide">
              <LeftSidebar />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">Skills Dashboard</h1>
              <p className="text-sm text-muted-foreground">{totalSkills} skills · Ranked by usage across all developers</p>
            </div>

            {/* Analytics Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-card rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{totalSkills}</p>
                <p className="text-xs text-muted-foreground">Total Skills</p>
              </div>
              <div className="bg-card rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{Object.keys(categories).length}</p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
              <div className="bg-card rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{categories["language"] || 0}</p>
                <p className="text-xs text-muted-foreground">Languages</p>
              </div>
              <div className="bg-card rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{categories["framework"] || 0}</p>
                <p className="text-xs text-muted-foreground">Frameworks</p>
              </div>
            </div>

            {/* Percentage Analytics - category breakdown */}
            {totalSkills > 0 && (
              <div className="bg-card rounded-lg border p-5">
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-primary" /> Category Breakdown
                </h2>
                <div className="space-y-2">
                  {Object.entries(categories).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
                    const pct = Math.round((count / totalSkills) * 100);
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-foreground capitalize">{cat}</span>
                          <span className="text-muted-foreground">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ranked Skill List */}
            <div className="bg-card rounded-lg border">
              <div className="p-5 border-b">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Diamond className="h-4 w-4 text-primary" /> Skills Ranked by Usage
                </h2>
              </div>
              {sortedSkills.length === 0 ? (
                <div className="p-8 text-center">
                  <Diamond className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No skills yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Extract skills from <Link to="/projects" className="text-primary hover:underline">projects</Link> or certificates on your dashboard.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {sortedSkills.map((skill, index) => {
                    const rd = rankData[skill.name];
                    const portfolioPct = Math.round(((1) / totalSkills) * 100);
                    const isExpanded = expandedSkill === skill.id;
                    const sources = getSkillSources(skill.name);

                    return (
                      <div key={skill.id}>
                        <button
                          onClick={() => setExpandedSkill(isExpanded ? null : skill.id)}
                          className="w-full flex items-center justify-between px-5 py-3 hover:bg-secondary/30 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-mono text-muted-foreground w-6 flex-shrink-0">#{index + 1}</span>
                            <Diamond className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium text-foreground truncate">{skill.name}</span>
                            {skill.category && <Badge variant="outline" className="text-[10px] flex-shrink-0">{skill.category}</Badge>}
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            {rd && (
                              <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> {rd.usageCount} user{rd.usageCount !== 1 ? "s" : ""}
                              </span>
                            )}
                            <span className="text-xs font-medium text-foreground">{portfolioPct}%</span>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-5 pb-4 pt-1 bg-secondary/10 space-y-3">
                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-3">
                              <div className="text-center p-2 rounded-md bg-card border">
                                <p className="text-lg font-bold text-foreground">{rd?.usageCount || 1}</p>
                                <p className="text-[10px] text-muted-foreground">Times Used</p>
                              </div>
                              <div className="text-center p-2 rounded-md bg-card border">
                                <p className="text-lg font-bold text-foreground">{portfolioPct}%</p>
                                <p className="text-[10px] text-muted-foreground">of Portfolio</p>
                              </div>
                              <div className="text-center p-2 rounded-md bg-card border">
                                <p className="text-lg font-bold text-foreground">
                                  {rd ? `#${rd.universalRank}` : "—"}
                                </p>
                                <p className="text-[10px] text-muted-foreground">Universal Rank</p>
                              </div>
                            </div>

                            {/* Sources */}
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1.5">Where this skill comes from:</p>
                              <div className="space-y-1">
                                {sources.map((src, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                                    <src.icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                    <span>{src.label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Percentage bar */}
                            <div>
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                                <span>Portfolio weight</span>
                                <span>{portfolioPct}%</span>
                              </div>
                              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${portfolioPct}%` }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Skills are added via AI skill extractor from certificates, projects, and repos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsPage;
