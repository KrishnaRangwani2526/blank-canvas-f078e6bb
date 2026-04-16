import { useState, forwardRef, useImperativeHandle } from "react";
import { Plus, Pencil, FolderGit2, ExternalLink, Brain } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import EditModal, { FormField, FormInput, FormTextarea, SaveButton, DeleteButton } from "./EditModal";
import { useSkillExtractor } from "@/hooks/useSkillExtractor";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  projects: Tables<"projects">[];
  refetch: () => void;
}

const ProjectSection = forwardRef<{ openAdd: () => void }, Props>(({ projects, refetch }, ref) => {
  const { user } = useAuth();
  const { extractSkills, isLoading: extractingSkills } = useSkillExtractor();
  useImperativeHandle(ref, () => ({ openAdd: () => { resetForm(); setAdding(true); } }));
  const [editing, setEditing] = useState<Tables<"projects"> | null>(null);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [techStack, setTechStack] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [extractingProj, setExtractingProj] = useState<string | null>(null);

  const resetForm = () => { setTitle(""); setDescription(""); setLink(""); setTechStack(""); setStartDate(""); setEndDate(""); };

  const openAdd = () => { resetForm(); setAdding(true); };
  const openEdit = (p: Tables<"projects">) => {
    setTitle(p.title); setDescription(p.description || ""); setLink(p.project_link || "");
    setTechStack((p.tech_stack || []).join(", ")); setStartDate(p.start_date || ""); setEndDate(p.end_date || "");
    setEditing(p);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const data = {
      title, description, project_link: link,
      tech_stack: techStack.split(",").map(s => s.trim()).filter(Boolean),
      start_date: startDate || null, end_date: endDate || null, user_id: user.id,
    };

    if (editing) {
      await supabase.from("projects").update(data).eq("id", editing.id);
      setEditing(null);
    } else {
      await supabase.from("projects").insert(data);
      setAdding(false);
    }
    setSaving(false);
    refetch();
  };

  const del = async (id: string) => {
    setSaving(true);
    await supabase.from("projects").delete().eq("id", id);
    setSaving(false);
    setEditing(null);
    refetch();
  };

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
      }
    } catch (error) {
      console.error("Skill extraction failed:", error);
    } finally {
      setExtractingProj(null);
    }
  };

  const form = (
    <form onSubmit={save} className="space-y-4">
      <FormField label="Title *"><FormInput value={title} onChange={setTitle} required /></FormField>
      <FormField label="Description"><FormTextarea value={description} onChange={setDescription} /></FormField>
      <FormField label="Project Link"><FormInput value={link} onChange={setLink} placeholder="https://..." /></FormField>
      <FormField label="Tech Stack (comma separated)"><FormInput value={techStack} onChange={setTechStack} placeholder="React, Node.js, Python" /></FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Start Date"><FormInput type="date" value={startDate} onChange={setStartDate} /></FormField>
        <FormField label="End Date"><FormInput type="date" value={endDate} onChange={setEndDate} /></FormField>
      </div>
      <SaveButton loading={saving} />
      {editing && <DeleteButton onClick={() => del(editing.id)} loading={saving} />}
    </form>
  );

  return (
    <>
      <div className="bg-card rounded-lg border p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Projects</h2>
          {user && (
            <button onClick={openAdd} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No projects added yet.</p>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="flex gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FolderGit2 className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-card-foreground">{project.title}</p>
                    {project.project_link && (
                      <a href={project.project_link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ml-auto">
                      <button
                        onClick={() => handleExtractSkills(project)}
                        disabled={extractingProj === project.id}
                        className="p-1 rounded-md hover:bg-secondary transition-all disabled:opacity-50"
                        title="Extract skills from project"
                      >
                        <Brain className={`h-3.5 w-3.5 ${extractingProj === project.id ? 'animate-pulse text-primary' : 'text-muted-foreground'}`} />
                      </button>
                      {user?.id === project.user_id && (
                        <button onClick={() => openEdit(project)} className="p-1 rounded-md hover:bg-secondary transition-all">
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                  {project.description && <p className="text-xs text-muted-foreground mt-0.5">{project.description}</p>}
                  <p className="text-xs text-muted-foreground">{project.start_date} - {project.end_date || "Present"}</p>
                  {project.tech_stack && project.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {project.tech_stack.map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditModal title={editing ? "Edit Project" : "Add Project"} open={adding || !!editing} onClose={() => { setAdding(false); setEditing(null); }}>
        {form}
      </EditModal>
    </>
  );
});

export default ProjectSection;
