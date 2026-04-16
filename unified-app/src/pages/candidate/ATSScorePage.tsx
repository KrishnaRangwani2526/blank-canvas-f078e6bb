import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAtsAnalyzer } from "@/hooks/useAtsAnalyzer";
import { ATSResultModal } from "@/components/ATSResultModal";
import { BarChart3, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ATSScorePage = () => {
  const navigate = useNavigate();
  const { analyzeProfile, result, loading } = useAtsAnalyzer();
  const [showResult, setShowResult] = useState(false);

  const handleAnalyze = async () => {
    setShowResult(true);
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
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              My ATS Score
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Analyze your profile and get actionable insights</p>
          </div>
        </div>

        {!showResult ? (
          <Card className="bg-card border-border p-8 text-center">
            <p className="text-foreground mb-6">Click below to calculate your ATS score based on your current profile</p>
            <Button onClick={handleAnalyze} disabled={loading} className="gap-2">
              {loading ? "Analyzing..." : "Calculate My ATS Score"}
            </Button>
          </Card>
        ) : (
          <>
            <ATSResultModal result={result} loading={loading} />
            <div className="text-center mt-8">
              <Button variant="outline" onClick={() => setShowResult(false)}>
                ← Analyze again
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ATSScorePage;
