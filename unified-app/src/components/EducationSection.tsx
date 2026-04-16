import { useState, forwardRef, useImperativeHandle } from "react";
import { Plus, Pencil, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import EditModal, { FormField, FormInput, SaveButton, DeleteButton } from "./EditModal";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  education: Tables<"education">[];
  refetch: () => void;
}

const EducationSection = forwardRef<{ openAdd: () => void }, Props>(({ education, refetch }, ref) => {
  const { user } = useAuth();
  useImperativeHandle(ref, () => ({ openAdd: () => { resetForm(); setAdding(true); } }));
  const [editing, setEditing] = useState<Tables<"education"> | null>(null);
  const [adding, setAdding] = useState(false);
  const [school, setSchool] = useState("");
  const [degree, setDegree] = useState("");
  const [field, setField] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = () => { setSchool(""); setDegree(""); setField(""); setStartDate(""); setEndDate(""); };
  const openAdd = () => { resetForm(); setAdding(true); };
  const openEdit = (e: Tables<"education">) => {
    setSchool(e.school); setDegree(e.degree || ""); setField(e.field_of_study || "");
    setStartDate(e.start_date || ""); setEndDate(e.end_date || ""); setEditing(e);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const data = { school, degree, field_of_study: field, start_date: startDate || null, end_date: endDate || null, user_id: user.id };
    if (editing) {
      await supabase.from("education").update(data).eq("id", editing.id);
      setEditing(null);
    } else {
      await supabase.from("education").insert(data);
      setAdding(false);
    }
    setSaving(false);
    refetch();
  };

  const del = async (id: string) => {
    setSaving(true);
    await supabase.from("education").delete().eq("id", id);
    setSaving(false);
    setEditing(null);
    refetch();
  };

  return (
    <>
      <div className="bg-card rounded-lg border p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Education</h2>
          {user && (
            <button onClick={openAdd} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        {education.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No education added yet.</p>
        ) : (
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="flex gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-card-foreground">{edu.school}</p>
                    {user?.id === edu.user_id && (
                      <button onClick={() => openEdit(edu)} className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-secondary transition-all">
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{edu.degree}{edu.field_of_study ? ` · ${edu.field_of_study}` : ""}</p>
                  <p className="text-xs text-muted-foreground">{edu.start_date} - {edu.end_date || "Present"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditModal title={editing ? "Edit Education" : "Add Education"} open={adding || !!editing} onClose={() => { setAdding(false); setEditing(null); }}>
        <form onSubmit={save} className="space-y-4">
          <FormField label="School *"><FormInput value={school} onChange={setSchool} required /></FormField>
          <FormField label="Degree"><FormInput value={degree} onChange={setDegree} /></FormField>
          <FormField label="Field of Study"><FormInput value={field} onChange={setField} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date"><FormInput type="date" value={startDate} onChange={setStartDate} /></FormField>
            <FormField label="End Date"><FormInput type="date" value={endDate} onChange={setEndDate} /></FormField>
          </div>
          <SaveButton loading={saving} />
          {editing && <DeleteButton onClick={() => del(editing.id)} loading={saving} />}
        </form>
      </EditModal>
    </>
  );
});

export default EducationSection;
