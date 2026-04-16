import { useState, forwardRef, useImperativeHandle } from "react";
import { Plus, Award, Pencil, Brain } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import EditModal, { FormField, FormInput, SaveButton, DeleteButton } from "./EditModal";
import { useSkillExtractor } from "@/hooks/useSkillExtractor";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  certificates: Tables<"certificates">[];
  refetch: () => void;
}

const CertificateSection = forwardRef<{ openAdd: () => void }, Props>(({ certificates, refetch }, ref) => {
  const { user } = useAuth();
  const { extractSkills, isLoading: extractingSkills, result: skillResult } = useSkillExtractor();
  useImperativeHandle(ref, () => ({ openAdd: () => { resetForm(); setAdding(true); } }));
  const [editing, setEditing] = useState<Tables<"certificates"> | null>(null);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [extractingCert, setExtractingCert] = useState<string | null>(null);

  const resetForm = () => { setTitle(""); setIssuer(""); setIssueDate(""); };
  const openAdd = () => { resetForm(); setAdding(true); };
  const openEdit = (c: Tables<"certificates">) => {
    setTitle(c.title); setIssuer(c.issuer || ""); setIssueDate(c.issue_date || ""); setEditing(c);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const data = { title, issuer, issue_date: issueDate || null, user_id: user.id };
    if (editing) {
      await supabase.from("certificates").update(data).eq("id", editing.id);
      setEditing(null);
    } else {
      await supabase.from("certificates").insert(data);
      setAdding(false);
    }
    setSaving(false);
    refetch();
  };

  const del = async (id: string) => {
    setSaving(true);
    await supabase.from("certificates").delete().eq("id", id);
    setSaving(false);
    setEditing(null);
    refetch();
  };

  const handleExtractSkills = async (cert: Tables<"certificates">) => {
    setExtractingCert(cert.id);
    try {
      const content = `${cert.title} ${cert.issuer || ""}`.trim();
      if (!content) {
        throw new Error("Certificate has no content to analyze");
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
      setExtractingCert(null);
    }
  };

  return (
    <>
      <div className="bg-card rounded-lg border p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Licenses & Certifications</h2>
          {user && (
            <button onClick={openAdd} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        {certificates.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No certificates added yet.</p>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-rank-bg flex items-center justify-center">
                  <Award className="h-5 w-5 text-rank-gold" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-card-foreground">{cert.title}</p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => handleExtractSkills(cert)}
                        disabled={extractingCert === cert.id}
                        className="p-1 rounded-md hover:bg-secondary transition-all disabled:opacity-50"
                        title="Extract skills from certificate"
                      >
                        <Brain className={`h-3.5 w-3.5 ${extractingCert === cert.id ? 'animate-pulse text-primary' : 'text-muted-foreground'}`} />
                      </button>
                      {user?.id === cert.user_id && (
                        <button onClick={() => openEdit(cert)} className="p-1 rounded-md hover:bg-secondary transition-all">
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                  {cert.issuer && <p className="text-sm text-muted-foreground">{cert.issuer}</p>}
                  {cert.issue_date && <p className="text-xs text-muted-foreground">Issued {cert.issue_date}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditModal title={editing ? "Edit Certificate" : "Add Certificate"} open={adding || !!editing} onClose={() => { setAdding(false); setEditing(null); }}>
        <form onSubmit={save} className="space-y-4">
          <FormField label="Title *"><FormInput value={title} onChange={setTitle} required /></FormField>
          <FormField label="Issuer"><FormInput value={issuer} onChange={setIssuer} /></FormField>
          <FormField label="Issue Date"><FormInput type="date" value={issueDate} onChange={setIssueDate} /></FormField>
          <SaveButton loading={saving} />
          {editing && <DeleteButton onClick={() => del(editing.id)} loading={saving} />}
        </form>
      </EditModal>
    </>
  );
});

export default CertificateSection;
