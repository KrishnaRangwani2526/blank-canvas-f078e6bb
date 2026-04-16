import { useState } from "react";
import { Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import EditModal, { FormField, FormTextarea, SaveButton } from "./EditModal";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  profile: Tables<"profiles"> | null;
  refetch: () => void;
}

const AboutSection = ({ profile, refetch }: Props) => {
  const { user } = useAuth();
  const isOwner = user?.id === profile?.user_id;
  const [editing, setEditing] = useState(false);
  const [about, setAbout] = useState("");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const openEdit = () => { setAbout(profile?.about || ""); setEditing(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({ about }).eq("user_id", user.id);
    setSaving(false);
    setEditing(false);
    refetch();
  };

  const text = profile?.about || "";
  const isLong = text.length > 200;

  return (
    <>
      <div className="bg-card rounded-lg border p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-card-foreground">About</h2>
          {isOwner && (
            <button onClick={openEdit} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        {text ? (
          <>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {expanded || !isLong ? text : text.slice(0, 200) + "..."}
            </p>
            {isLong && (
              <button onClick={() => setExpanded(!expanded)} className="text-sm text-primary hover:underline mt-2">
                {expanded ? "Show less" : "...see more"}
              </button>
            )}
          </>
        ) : isOwner ? (
          <p className="text-sm text-muted-foreground italic cursor-pointer hover:text-primary" onClick={openEdit}>
            Click to add an about section...
          </p>
        ) : null}
      </div>

      <EditModal title="Edit About" open={editing} onClose={() => setEditing(false)}>
        <form onSubmit={save} className="space-y-4">
          <FormField label="About"><FormTextarea value={about} onChange={setAbout} rows={6} placeholder="Tell people about yourself..." /></FormField>
          <SaveButton loading={saving} />
        </form>
      </EditModal>
    </>
  );
};

export default AboutSection;
