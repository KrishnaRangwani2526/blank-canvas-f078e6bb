import { MapPin, BookOpen, Pencil } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import EditModal, { FormField, FormInput, SaveButton } from "./EditModal";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  profile: Tables<"profiles"> | null;
  refetch: () => void;
}

const WorkInfo = ({ profile, refetch }: Props) => {
  const { user } = useAuth();
  const isOwner = user?.id === profile?.user_id;
  const [editing, setEditing] = useState(false);
  const [location, setLocation] = useState("");
  const [learning, setLearning] = useState("");
  const [saving, setSaving] = useState(false);

  const openEdit = () => {
    setLocation(profile?.location || "");
    setLearning(profile?.bio || "");
    setEditing(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({ location, bio: learning }).eq("user_id", user.id);
    setSaving(false);
    setEditing(false);
    refetch();
  };

  if (!profile?.location && !profile?.bio && !isOwner) return null;

  return (
    <>
      <div className="bg-card rounded-lg border p-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-6">
            {profile?.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Work Location</p>
                  <p className="text-sm font-medium text-card-foreground">{profile.location}</p>
                </div>
              </div>
            )}
            {profile?.bio && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Currently Learning</p>
                  <p className="text-sm font-medium text-card-foreground">{profile.bio}</p>
                </div>
              </div>
            )}
          </div>
          {isOwner && (
            <button onClick={openEdit} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <EditModal title="Edit Work Info" open={editing} onClose={() => setEditing(false)}>
        <form onSubmit={save} className="space-y-4">
          <FormField label="Work Location"><FormInput value={location} onChange={setLocation} placeholder="City, Country" /></FormField>
          <FormField label="Currently Learning"><FormInput value={learning} onChange={setLearning} placeholder="Machine Learning, Data Science..." /></FormField>
          <SaveButton loading={saving} />
        </form>
      </EditModal>
    </>
  );
};

export default WorkInfo;
