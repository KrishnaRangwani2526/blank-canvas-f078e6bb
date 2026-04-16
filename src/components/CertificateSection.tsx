// @ts-nocheck
import { useState, forwardRef, useImperativeHandle } from "react";
import { Plus, Award, Pencil, Brain, ExternalLink, Image } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSkillExtractor } from "@/hooks/useSkillExtractor";
import { saveExtractedSkills } from "@/lib/profile-data";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import EditModal, { FormField, FormInput, FormTextarea, SaveButton, DeleteButton } from "./EditModal";

interface Props {
  certificates: Tables<"certificates">[];
  refetch: () => void;
}

const isImageUrl = (url: string | null) => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url) || url.includes('/storage/v1/object/public/');
};

const CertificateSection = forwardRef<{ openAdd: () => void }, Props>(({ certificates, refetch }, ref) => {
  const { user } = useAuth();
  const { extractSkills } = useSkillExtractor();
  useImperativeHandle(ref, () => ({ openAdd: () => { resetForm(); setAdding(true); } }));
  const [editing, setEditing] = useState<Tables<"certificates"> | null>(null);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [description, setDescription] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [extractingCert, setExtractingCert] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const resetForm = () => { setTitle(""); setIssuer(""); setIssueDate(""); setDescription(""); setCredentialUrl(""); setFile(null); };
  const openAdd = () => { resetForm(); setAdding(true); };
  const openEdit = (c: Tables<"certificates">) => {
    setTitle(c.title); setIssuer(c.issuer || ""); setIssueDate(c.issue_date || "");
    setCredentialUrl(c.credential_url || ""); setDescription(c.description || ""); setEditing(c); setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    
    let finalUrl = credentialUrl;
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/certificates/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
        finalUrl = publicUrl;
      } else {
        toast.error("Failed to upload file");
      }
    }

    const data = { title, issuer, issue_date: issueDate || null, description: description || null, credential_url: finalUrl || null, user_id: user.id };
    let savedCert = null;
    if (editing) {
      const { error } = await supabase.from("certificates").update(data).eq("id", editing.id);
      if (error) throw error;
      setEditing(null);
    } else {
      const { data: newCert, error } = await supabase.from("certificates").insert(data).select().single();
      if (error) throw error;
      savedCert = newCert;
      setAdding(false);
    }
    setSaving(false);
    refetch();

    // Auto-extract skills after adding a new certificate
    if (savedCert && !editing) {
      try {
        const content = `${savedCert.title || ""} ${savedCert.issuer || ""} ${savedCert.description || ""}`.trim();
        if (content) {
          toast.info("Scanning certificate for skills...");
          const result = await extractSkills(content);
          if (result?.skills?.length && user) {
            const insertedCount = await saveExtractedSkills(user.id, result.skills);
            refetch();
            if (insertedCount > 0) toast.success(`Auto-extracted ${insertedCount} skills from certificate!`);
          }
        }
      } catch (err) {
        console.error("Auto skill extraction failed:", err);
      }
    }
  };

  const del = async (id: string) => {
    setSaving(true);
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) throw error;
    setSaving(false);
    setEditing(null);
    refetch();
  };

  const handleExtractSkills = async (cert: Tables<"certificates">) => {
    setExtractingCert(cert.id);
    try {
      const content = `${cert.title || ""} ${cert.issuer || ""} ${cert.description || ""}`.trim();
      if (!content) throw new Error("Certificate has no content to analyze");
      const result = await extractSkills(content);
      if (result?.skills?.length && user) {
        const insertedCount = await saveExtractedSkills(user.id, result.skills);
        refetch();
        toast.success(insertedCount > 0 ? `Added ${insertedCount} skills from certificate` : "Skills were extracted, but all were already in your profile");
      } else {
        toast.error("No skills were detected from this certificate");
      }
    } catch (error) {
      console.error("Skill extraction failed:", error);
    } finally {
      setExtractingCert(null);
    }
  };

  const form = (
    <form onSubmit={save} className="space-y-4">
      <FormField label="Title *"><FormInput value={title} onChange={setTitle} required /></FormField>
      <FormField label="Description"><FormTextarea value={description} onChange={setDescription} /></FormField>
      <FormField label="Issuer"><FormInput value={issuer} onChange={setIssuer} /></FormField>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Issue Date"><FormInput type="date" value={issueDate} onChange={setIssueDate} /></FormField>
        <FormField label="Upload File (PDF/Img)">
          <input 
            type="file" 
            accept=".pdf,image/jpeg,image/png,image/webp" 
            onChange={handleFileChange} 
            className="w-full px-3 py-1.5 rounded-md border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
          />
        </FormField>
      </div>
      <FormField label="Or Credential URL"><FormInput value={credentialUrl} onChange={setCredentialUrl} placeholder="https://..." /></FormField>
      <SaveButton loading={saving} />
      {editing && <DeleteButton onClick={() => del(editing.id)} loading={saving} />}
    </form>
  );

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
                {/* Certificate Image or Icon */}
                {isImageUrl(cert.credential_url) ? (
                  <button 
                    onClick={() => setExpandedImage(cert.credential_url)}
                    className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                  >
                    <img 
                      src={cert.credential_url!} 
                      alt={cert.title} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-rank-bg flex items-center justify-center flex-shrink-0">
                    <Award className="h-5 w-5 text-rank-gold" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-card-foreground">{cert.title}</p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      {user?.id === cert.user_id && (
                        <button onClick={() => openEdit(cert)} className="p-1 rounded-md hover:bg-secondary transition-all">
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                  {cert.issuer && <p className="text-sm text-muted-foreground">{cert.issuer}</p>}
                  {cert.issue_date && <p className="text-xs text-muted-foreground">Issued {cert.issue_date}</p>}
                  {cert.credential_url && !isImageUrl(cert.credential_url) && (
                    <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-1 hover:underline">
                      <ExternalLink className="h-3 w-3" /> View Credential
                    </a>
                  )}
                  <button
                    onClick={() => handleExtractSkills(cert)}
                    disabled={extractingCert === cert.id}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs hover:bg-secondary transition-all disabled:opacity-50"
                  >
                    <Brain className={`h-3.5 w-3.5 ${extractingCert === cert.id ? 'animate-pulse text-primary' : 'text-muted-foreground'}`} />
                    {extractingCert === cert.id ? "Extracting..." : "Add Skill"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {expandedImage && (
        <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4" onClick={() => setExpandedImage(null)}>
          <img src={expandedImage} alt="Certificate" className="max-w-full max-h-[90vh] rounded-xl shadow-2xl" />
        </div>
      )}

      <EditModal title={editing ? "Edit Certificate" : "Add Certificate"} open={adding || !!editing} onClose={() => { setAdding(false); setEditing(null); }}>
        {form}
      </EditModal>
    </>
  );
});

export default CertificateSection;
