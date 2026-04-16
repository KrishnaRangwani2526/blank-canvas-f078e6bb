import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Plus, ExternalLink, Brain, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useSkillExtractor } from "@/hooks/useSkillExtractor";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

const ProjectsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { projects, refetch } = useProfile();
  const { extractSkills, isLoading: extractingSkills } = useSkillExtractor();
  const navigate = useNavigate();
  const [extractingProj, setExtractingProj] = useState<string | null>(null);
  const [deletingProj, setDeletingProj] = useState<string | null>(null);

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const handleExtractSkills = async (project: Tables<"projects">) => {
    setExtractingProj(project.id);
    try {
      const content = `${project.title} ${project.description || ""} ${project.tech_stack?.join(" ") || ""}`.trim();
      if (!content) {
        throw new Error("Project has no content to analyze");
      }

      const result = await extractSkills(content);

      // Add extracted skills to user's skills
      if (result.skills.length > 0 && user) {
        const skillsToAdd = result.skills.map(skill => ({
          user_id: user.id,
          name: skill.name,
        }));

        await supabase.from("skills").upsert(skillsToAdd, {
          onConflict: "user_id,name",
          ignoreDuplicates: false
        });

        refetch();
        toast.success(`Added ${result.skills.length} skills from project`);
      }
    } catch (error) {
      console.error("Skill extraction failed:", error);
      toast.error("Failed to extract skills from project");
    } finally {
      setExtractingProj(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setDeletingProj(projectId);
    try {
      await supabase.from("projects").delete().eq("id", projectId);
      refetch();
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project");
    } finally {
      setDeletingProj(null);
    }
  };

  const handleAddGitHubRepo = () => {
    // This would open a modal or navigate to add project page
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <div className="w-56 md:w-64 flex-shrink-0">
            <div className="sticky top-20 overflow-y-auto max-h-[calc(100vh-5rem)] scrollbar-hide">
              <LeftSidebar />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Projects</h1>
                <p className="text-muted-foreground">Manage your projects and extract skills from them</p>
              </div>
              <Button onClick={handleAddGitHubRepo} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add GitHub Repo
              </Button>
            </div>

            {projects.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <span className="h-12 w-12 text-muted-foreground mb-4">GitHub</span>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Add your GitHub repositories or create project entries to showcase your work
                  </p>
                  <Button onClick={handleAddGitHubRepo}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Project
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExtractSkills(project)}
                            disabled={extractingProj === project.id}
                            className="h-8 w-8 p-0"
                          >
                            <Brain className={`h-4 w-4 ${extractingProj === project.id ? 'animate-pulse text-primary' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProject(project.id)}
                            disabled={deletingProj === project.id}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      {project.tech_stack && project.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.tech_stack.slice(0, 3).map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {project.tech_stack.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.tech_stack.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {project.start_date && project.end_date
                            ? `${project.start_date} - ${project.end_date}`
                            : project.start_date
                            ? `Started ${project.start_date}`
                            : "Date not specified"
                          }
                        </span>
                        {project.project_link && (
                          <a
                            href={project.project_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;