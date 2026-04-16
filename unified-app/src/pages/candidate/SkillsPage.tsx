import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const SkillsPage = () => {
  const skillsUrl = "http://localhost:5176";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Skill Intelligence</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Open the dedicated skills dashboard or browse the embedded skills view below.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/" className="rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-secondary transition">
              Back to Dashboard
            </Link>
            <a href={skillsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-95 transition-opacity">
              Open Skills Page <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skills Dashboard Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This page connects to the standalone skills analytics UI. Start the skills app in a second terminal to view the live dashboard here.
            </p>
            <div className="overflow-hidden rounded-2xl border border-border">
              <iframe
                src={skillsUrl}
                className="w-full min-h-[70vh]"
                title="Skills Dashboard"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Integration Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>The skills page is a dedicated UI module that shares the same Supabase backend.</li>
              <li>Candidate skills loaded from the current profile can be surfaced in the shared skill analytics engine.</li>
              <li>Open the skills app with <code>npm --workspace skills-page run dev</code> and keep it running alongside this app.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SkillsPage;
