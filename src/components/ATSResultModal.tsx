import type { ATSResult } from "@/hooks/useAtsAnalyzer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, AlertCircle, CheckCircle2, GitBranch, Code2, Flame } from "lucide-react";

interface ATSResultModalProps {
  result: ATSResult | null;
  loading: boolean;
  title?: string;
}

export function ATSResultModal({ result, loading, title = "ATS Analysis" }: ATSResultModalProps) {
  if (!result && !loading) return null;

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Analyzing profile...</p>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Main Score */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">ATS Score</p>
              <p className="text-4xl font-bold text-primary">{result.ats_score}/100</p>
            </div>
            <TrendingUp className="h-10 w-10 text-primary/50" />
          </div>
          <p className="text-xs text-foreground mt-3 leading-relaxed">{result.summary}</p>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {result.score_breakdown.map((item) => (
            <div key={item.category} className="space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground">{item.category}</span>
                <span className="font-semibold text-primary">
                  {item.score}/{item.max}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${(item.score / item.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Profile Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.profile_summary.top_skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Top Skills</p>
              <div className="flex flex-wrap gap-1">
                {result.profile_summary.top_skills.slice(0, 8).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Streak Analysis */}
      {result.streak_analysis && (
        <Card className="bg-gradient-to-br from-orange-500/10 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="h-3.5 w-3.5 text-orange-500" /> Consistency & Streaks
              <Badge variant="outline" className="ml-auto text-[10px] capitalize">
                {result.streak_analysis.consistency_rating}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded-lg bg-card border border-border">
                <GitBranch className="h-4 w-4 mx-auto mb-1 text-foreground" />
                <p className="text-lg font-bold text-primary">{result.streak_analysis.github_streak}</p>
                <p className="text-[10px] text-muted-foreground">GitHub</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-card border border-border">
                <Code2 className="h-4 w-4 mx-auto mb-1 text-foreground" />
                <p className="text-lg font-bold text-primary">{result.streak_analysis.leetcode_streak}</p>
                <p className="text-[10px] text-muted-foreground">LeetCode</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-card border border-border">
                <Flame className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                <p className="text-lg font-bold text-primary">{result.streak_analysis.aspiring_streak}</p>
                <p className="text-[10px] text-muted-foreground">Aspiring</p>
              </div>
            </div>
            <p className="text-xs text-foreground leading-relaxed">{result.streak_analysis.insight}</p>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Overall Consistency</span>
                <span className="font-semibold text-primary">{result.consistency_score}/100</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${result.consistency_score}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-xs">
            {result.strengths.slice(0, 3).map((s) => (
              <li key={s} className="text-foreground">
                • {s}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Job Match (if applicable) */}
      {result.match_percentage !== undefined && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" /> Job Match
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">Match %</span>
                <span className="text-xl font-bold text-primary">{result.match_percentage}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${result.match_percentage}%` }}
                />
              </div>
            </div>
            {result.matched_skills && result.matched_skills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Matched Skills</p>
                <div className="flex flex-wrap gap-1">
                  {result.matched_skills.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="outline" className="border-green-500 text-green-700 dark:text-green-400 text-xs">
                      ✓ {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {result.missing_skills && result.missing_skills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Missing Skills</p>
                <div className="flex flex-wrap gap-1">
                  {result.missing_skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="outline" className="border-red-500 text-red-700 dark:text-red-400 text-xs">
                      ✗ {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
