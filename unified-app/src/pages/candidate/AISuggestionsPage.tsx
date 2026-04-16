import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAtsAnalyzer } from "@/hooks/useAtsAnalyzer";
import { Brain, ArrowLeft, Lightbulb, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const AISuggestionsPage = () => {
  const navigate = useNavigate();
  const { analyzeProfile, result, loading } = useAtsAnalyzer();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleGetSuggestions = async () => {
    setShowSuggestions(true);
    await analyzeProfile();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Brain className="h-5 w-5 text-destructive" />
              </div>
              AI Suggestions
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Get personalized tips to improve your rank and ATS score</p>
          </div>
        </div>

        {!showSuggestions ? (
          <Card className="bg-card border-border p-8 text-center">
            <p className="text-foreground mb-6">Analyze your profile to get AI-powered suggestions for improvement</p>
            <Button onClick={handleGetSuggestions} disabled={loading} className="gap-2">
              {loading ? "Analyzing..." : "Get AI Suggestions"}
            </Button>
          </Card>
        ) : loading ? (
          <Card className="bg-card border-border p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Generating suggestions...</p>
          </Card>
        ) : result ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    Top Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                        <span className="text-xs font-bold text-primary rounded-full w-6 h-6 flex items-center justify-center bg-primary/10 flex-shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-sm text-foreground flex-1">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Learning Roadmap */}
            {result.learning_roadmap.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Learning Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.learning_roadmap.map((item, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg border-l-4 border-blue-500/50 bg-blue-50/5">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 rounded-full w-6 h-6 flex items-center justify-center bg-blue-500/10 flex-shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-sm text-foreground flex-1">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Profile Gaps */}
            {result.profile_gaps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.profile_gaps.map((gap) => (
                    <div
                      key={gap.area}
                      className={`p-3 rounded-lg border-l-4 ${
                        gap.severity === "high"
                          ? "bg-red-50/50 border-l-red-500 dark:bg-red-950/20"
                          : gap.severity === "medium"
                            ? "bg-amber-50/50 border-l-amber-500 dark:bg-amber-950/20"
                            : "bg-blue-50/50 border-l-blue-500 dark:bg-blue-950/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm text-foreground">{gap.area}</p>
                        <span
                          className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                            gap.severity === "high"
                              ? "bg-red-500/20 text-red-700 dark:text-red-400"
                              : gap.severity === "medium"
                                ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                                : "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                          }`}
                        >
                          {gap.severity}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{gap.detail}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="text-center">
              <Button variant="outline" onClick={() => setShowSuggestions(false)}>
                ← Get suggestions again
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AISuggestionsPage;
