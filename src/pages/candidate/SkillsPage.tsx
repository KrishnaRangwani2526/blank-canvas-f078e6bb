// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Link } from "react-router-dom";
import { Diamond, ChevronDown, ChevronUp, TrendingUp, Award, FolderGit2, GitBranch, Brain, PieChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isGitHubRepoLink, normalizeTechStack } from "@/lib/profile-data";

const SkillsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { skills, certificates, projects } = useProfile();
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.innerWidth >= 768) return;
    const scrollTimer = window.setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(scrollTimer);
  }, []);

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const totalSkills = skills.length;

  // Fetch universal rank data: evaluate skill proficiency by comparing this candidate's portfolio vs all other candidates
  const { data: rankData = {} } = useQuery({
    queryKey: ["skill-universal-ranks", user?.id, skills.map(s => s.name).join(",")],
    queryFn: async () => {
      if (skills.length === 0 || !user?.id) return {};

      // Fetch all projects and certificates to measure skill depth across everyone
      const [{ data: allProjects }, { data: allCerts }] = await Promise.all([
        supabase.from("projects").select("user_id, tech_stack, title, description"),
        supabase.from("certificates").select("user_id, title, issuer")
      ]);

      const userSkillScores: Record<string, Record<string, number>> = {};
      const checkMatch = (str: string | null | undefined, skillLower: string) => str?.toLowerCase().includes(skillLower);

      skills.forEach(skillObj => {
        const lower = skillObj.name.toLowerCase();
        const scores: Record<string, number> = {};

        // Measure depth in projects
        allProjects?.forEach(p => {
          let matches = 0;
          if (normalizeTechStack(p.tech_stack).some((t: string) => t.toLowerCase() === lower)) matches++;
          if (checkMatch(p.title, lower)) matches++;
          if (checkMatch(p.description, lower)) matches++;
          
          if (matches > 0) scores[p.user_id] = (scores[p.user_id] || 0) + matches;
        });

        // Measure depth in certificates
        allCerts?.forEach(c => {
          let matches = 0;
          if (checkMatch(c.title, lower)) matches++;
          if (checkMatch(c.issuer, lower)) matches++;
          
          if (matches > 0) scores[c.user_id] = (scores[c.user_id] || 0) + matches;
        });

        userSkillScores[skillObj.name] = scores;
      });

      const result: Record<string, { usageCount: number; universalRank: number; totalUsers: number }> = {};
      
      const currentUserId = user.id;

      skills.forEach(s => {
        const scoresObj = userSkillScores[s.name] || {};
        const scoreList = Object.entries(scoresObj).map(([uid, score]) => ({uid, score}));
        
        let myScore = scoresObj[currentUserId];
        
        // If they have the skill saved but zero projects matching, give baseline score of 1
        if (!myScore) {
           myScore = 1;
           scoreList.push({ uid: currentUserId, score: 1 });
        }
        
        // Sort descending
        scoreList.sort((a,b) => b.score - a.score);

        const myRankIndex = scoreList.findIndex(x => x.uid === currentUserId);
        
        result[s.name] = {
           usageCount: myScore,
           universalRank: myRankIndex !== -1 ? myRankIndex + 1 : scoreList.length + 1,
           totalUsers: scoreList.length || 1
        };
      });

      return result;
    },
    enabled: skills.length > 0 && !!user?.id,
  });

  // Determine where each skill comes from
  const getSkillSources = (skillName: string) => {
    const sources: { type: string; icon: any; label: string }[] = [];
    const lower = skillName.toLowerCase();
    certificates.forEach(c => {
      if (c.title?.toLowerCase().includes(lower) || c.issuer?.toLowerCase().includes(lower)) {
        sources.push({ type: "certificate", icon: Award, label: `Certificate: ${c.title}` });
      }
    });
    projects.forEach(p => {
      const inTech = normalizeTechStack(p.tech_stack).some((t: string) => t.toLowerCase() === lower);
      const inTitle = p.title?.toLowerCase().includes(lower);
      const inDesc = p.description?.toLowerCase().includes(lower);
      const isRepo = isGitHubRepoLink(p.project_link);
      if (inTech || inTitle || inDesc) {
        sources.push({ type: isRepo ? "git" : "project", icon: isRepo ? GitBranch : FolderGit2, label: `${isRepo ? "Repo" : "Project"}: ${p.title}` });
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
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 md:w-64 flex-shrink-0">
            <div className="md:sticky md:top-20 overflow-visible md:overflow-y-auto md:max-h-[calc(100vh-5rem)] scrollbar-hide">
              <LeftSidebar />
            </div>
          </div>

          <div ref={contentRef} className="flex-1 min-w-0 space-y-4 scroll-mt-20">
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
                                <TrendingUp className="h-3 w-3" /> Top {Math.max(1, Math.round((rd.universalRank / rd.totalUsers) * 100))}% Rank
                              </span>
                            )}
                            <span className="text-xs font-medium text-foreground">{portfolioPct}%</span>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-5 pb-4 pt-1 bg-secondary/10 space-y-3">
                            {/* Stats row */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="text-center p-2 rounded-md bg-card border">
                                <p className="text-lg font-bold text-foreground">{rd?.usageCount || 1}</p>
                                <p className="text-[10px] text-muted-foreground">Times Used in Profile</p>
                              </div>
                              <div className="text-center p-2 rounded-md bg-card border">
                                <p className="text-lg font-bold text-foreground">{portfolioPct}%</p>
                                <p className="text-[10px] text-muted-foreground">of Portfolio</p>
                              </div>
                              <div className="text-center p-2 rounded-md bg-card border">
                                <p className="text-lg font-bold text-foreground">
                                  {rd ? `#${rd.universalRank} / ${rd.totalUsers}` : "—"}
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
                                    <span className="break-words">{src.label}</span>
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
