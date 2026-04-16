import { useState } from "react";
import { Plus, Pencil, Briefcase, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import EditModal, { FormField, FormInput, FormTextarea, SaveButton, DeleteButton } from "./EditModal";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  experience: Tables<"experience">[];
  refetch: () => void;
}

const ExperienceSection = ({ experience, refetch }: Props) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState<Tables<"experience"> | null>(null);
  const [adding, setAdding] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetForm = () => { setCompany(""); setRole(""); setDescription(""); setLocation(""); setStartDate(""); setEndDate(""); setIsCurrent(false); };

  const openAdd = () => { resetForm(); setAdding(true); };
  const openEdit = (exp: Tables<"experience">) => {
    setCompany(exp.company); setRole(exp.role); setDescription(exp.description || "");
    setLocation(exp.location || ""); setStartDate(exp.start_date || ""); setEndDate(exp.end_date || "");
    setIsCurrent(exp.is_current || false); setEditing(exp);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const data = { company, role, description, location, start_date: startDate || null, end_date: isCurrent ? null : endDate || null, is_current: isCurrent, user_id: user.id };

    if (editing) {
      await supabase.from("experience").update(data).eq("id", editing.id);
      setEditing(null);
    } else {
      await supabase.from("experience").insert(data);
      setAdding(false);
    }
    setSaving(false);
    refetch();
  };

  const del = async (id: string) => {
    setSaving(true);
    await supabase.from("experience").delete().eq("id", id);
    setSaving(false);
    setEditing(null);
    refetch();
  };

  const form = (
    <form onSubmit={save} className="space-y-4">
      <FormField label="Company *"><FormInput value={company} onChange={setCompany} required /></FormField>
      <FormField label="Role *"><FormInput value={role} onChange={setRole} required /></FormField>
      <FormField label="Description"><FormTextarea value={description} onChange={setDescription} /></FormField>
      <FormField label="Location"><FormInput value={location} onChange={setLocation} /></FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Start Date"><FormInput type="date" value={startDate} onChange={setStartDate} /></FormField>
        <FormField label="End Date">
          {isCurrent ? <p className="text-sm text-muted-foreground pt-2">Present</p> : <FormInput type="date" value={endDate} onChange={setEndDate} />}
        </FormField>
      </div>
      <label className="flex items-center gap-2 text-sm text-card-foreground">
        <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} className="rounded" />
        Currently working here
      </label>
      <SaveButton loading={saving} />
      {editing && <DeleteButton onClick={() => del(editing.id)} loading={saving} />}
    </form>
  );

  return (
    <>
      <div className="bg-card rounded-lg border p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Experience</h2>
          {user && (
            <button onClick={openAdd} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        {experience.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No experience added yet.</p>
        ) : (
          <div className="space-y-4">
            {experience.map((exp, i) => (
              <div key={exp.id} className="flex gap-3 relative group">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${exp.is_current ? "bg-primary/10" : "bg-secondary"}`}>
                    <Briefcase className={`h-5 w-5 ${exp.is_current ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  {i < experience.length - 1 && <div className="w-0.5 flex-1 bg-border mt-2" />}
                </div>
                <div className="pb-4 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-card-foreground">{exp.role}</p>
                    {user?.id === exp.user_id && (
                      <button onClick={() => openEdit(exp)} className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-secondary transition-all">
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                  <p className="text-xs text-muted-foreground">
                    {exp.start_date} - {exp.is_current ? "Present" : exp.end_date || "N/A"}
                  </p>
                  {exp.location && <p className="text-xs text-muted-foreground">{exp.location}</p>}
                  {exp.is_current && (
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full font-medium">Currently working</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditModal title={editing ? "Edit Experience" : "Add Experience"} open={adding || !!editing} onClose={() => { setAdding(false); setEditing(null); }}>
        {form}
      </EditModal>
    </>
  );
};

export default ExperienceSection;
