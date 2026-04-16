import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useResumeMaker } from "@/hooks/useResumeMaker";
import { ResumePreviewModal } from "@/components/ResumePreviewModal";
import { FileText, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ResumePage = () => {
  const navigate = useNavigate();
  const { generateResume, resume, loading } = useResumeMaker();
  const [showResume, setShowResume] = useState(false);

  const handleGenerate = async () => {
    setShowResume(true);
    await generateResume();
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
                <FileText className="h-5 w-5 text-primary" />
              </div>
              My Resume
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Generate and preview your professional resume</p>
          </div>
        </div>

        {!showResume ? (
          <Card className="bg-card border-border p-8 text-center">
            <p className="text-foreground mb-6">Click below to generate your resume based on your profile data</p>
            <Button onClick={handleGenerate} disabled={loading} className="gap-2">
              {loading ? "Generating..." : "Generate My Resume"}
            </Button>
          </Card>
        ) : (
          <>
            <ResumePreviewModal resume={resume} loading={loading} />
            <div className="text-center mt-8">
              <Button variant="outline" onClick={() => setShowResume(false)}>
                ← Generate again
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResumePage;
