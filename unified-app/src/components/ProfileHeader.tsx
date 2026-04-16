import { useState, useRef } from "react";
import { Camera, MapPin, Plus, ChevronDown, Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import EditModal, { FormField, FormInput, FormTextarea, SaveButton } from "./EditModal";
import type { Tables } from "@/integrations/supabase/types";
import coverImg from "@/assets/cover-default.jpg";
import avatarImg from "@/assets/avatar-default.jpg";

interface Props {
  profile: Tables<"profiles"> | null;
  refetch: () => void;
  onAddEducation?: () => void;
  onAddProject?: () => void;
  onAddCertificate?: () => void;
}

const seekingOptions = ["Job", "Internship", "Freelance"];
const workModeOptions = ["Onsite", "Remote", "Hybrid"];

const ProfileHeader = ({ profile, refetch, onAddEducation, onAddProject, onAddCertificate }: Props) => {
  const { user } = useAuth();
  const isOwner = user?.id === profile?.user_id;
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [editBio, setEditBio] = useState(false);
  const [editName, setEditName] = useState(false);
  const [editOpenToWork, setEditOpenToWork] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  // Open to work state
  const [openToWork, setOpenToWork] = useState(false);
  const [seekingType, setSeekingType] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [workLocation, setWorkLocation] = useState("");

  const openEditName = () => {
    setName(profile?.full_name || "");
    setLocation(profile?.location || "");
    setEditName(true);
  };

  const openEditBio = () => {
    setBio(profile?.bio || "");
    setEditBio(true);
  };

  const openEditOpenToWork = () => {
    setOpenToWork(profile?.open_to_work || false);
    setSeekingType(profile?.seeking_type || "");
    setWorkMode(profile?.work_mode || "");
    setWorkLocation(profile?.location || "");
    setEditOpenToWork(true);
  };

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({ full_name: name, location }).eq("user_id", user.id);
    setSaving(false);
    setEditName(false);
    refetch();
  };

  const saveBio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({ bio }).eq("user_id", user.id);
    setSaving(false);
    setEditBio(false);
    refetch();
  };

  const saveOpenToWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({
      open_to_work: openToWork,
      seeking_type: seekingType,
      work_mode: workMode,
      location: workLocation,
    }).eq("user_id", user.id);
    setSaving(false);
    setEditOpenToWork(false);
    refetch();
  };

  const uploadImage = async (file: File, bucket: "avatars" | "covers", field: "avatar_url" | "cover_url") => {
    if (!user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) return;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    await supabase.from("profiles").update(
      field === "avatar_url" ? { avatar_url: publicUrl } : { cover_url: publicUrl }
    ).eq("user_id", user.id);
    refetch();
  };

  return (
    <>
      <div className="bg-card rounded-lg border overflow-visible animate-fade-in">
        <div className="relative h-48 md:h-56">
          <img src={profile?.cover_url || coverImg} alt="Cover" className="w-full h-full object-cover rounded-t-lg" />
          {isOwner && (
            <>
              <button onClick={() => coverRef.current?.click()} className="absolute top-3 right-3 bg-card/80 backdrop-blur p-2 rounded-full hover:bg-card transition-colors">
                <Camera className="h-4 w-4 text-card-foreground" />
              </button>
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "covers", "cover_url")} />
            </>
          )}
        </div>

        <div className="relative px-6 pb-5">
          <div className="relative -mt-16 mb-3 w-fit">
            <img src={profile?.avatar_url || avatarImg} alt={profile?.full_name || "User"} className="w-32 h-32 rounded-full border-4 border-card object-cover" />
            {isOwner && (
              <>
                <button onClick={() => avatarRef.current?.click()} className="absolute bottom-1 right-1 bg-primary text-primary-foreground p-1.5 rounded-full hover:opacity-90 transition-opacity">
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "avatars", "avatar_url")} />
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-card-foreground">{profile?.full_name || "Your Name"}</h1>
                {isOwner && (
                  <button onClick={openEditName} className="p-1 rounded-md hover:bg-secondary transition-colors" title="Edit name">
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-muted-foreground text-sm">{profile?.bio || "Add a bio..."}</p>
                {isOwner && (
                  <button onClick={openEditBio} className="p-1 rounded-md hover:bg-secondary transition-colors" title="Edit bio">
                    <Pencil className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
              {profile?.location && (
                <div className="flex items-center gap-1 text-muted-foreground text-xs mt-2">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>

            {isOwner && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={openEditOpenToWork}
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Open to
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowAddProfile(!showAddProfile)}
                    className="flex items-center gap-1 px-4 py-2 border rounded-full text-sm font-medium text-card-foreground hover:bg-secondary transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Add Profile <ChevronDown className="h-3 w-3" />
                  </button>
                  {showAddProfile && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-card rounded-lg shadow-lg border p-2 z-[100] animate-fade-in">
                      <button onClick={() => { setShowAddProfile(false); onAddCertificate?.(); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm text-card-foreground">🎓 Add Certificate</button>
                      <button onClick={() => { setShowAddProfile(false); onAddProject?.(); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm text-card-foreground">💻 Add Project</button>
                      <button onClick={() => { setShowAddProfile(false); onAddEducation?.(); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm text-card-foreground">📚 Add Education</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {profile?.open_to_work && (
            <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20 cursor-pointer" onClick={isOwner ? openEditOpenToWork : undefined}>
              <p className="text-sm font-medium text-accent">Open to work</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.seeking_type && <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">{profile.seeking_type}</span>}
                {profile.work_mode && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{profile.work_mode}</span>}
                {profile.location && <span className="text-xs text-muted-foreground">{profile.location}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Name Modal */}
      <EditModal title="Edit Name & Location" open={editName} onClose={() => setEditName(false)}>
        <form onSubmit={saveName} className="space-y-4">
          <FormField label="Full Name"><FormInput value={name} onChange={setName} required /></FormField>
          <FormField label="Location"><FormInput value={location} onChange={setLocation} placeholder="City, Country" /></FormField>
          <SaveButton loading={saving} />
        </form>
      </EditModal>

      {/* Edit Bio Modal */}
      <EditModal title="Edit Bio" open={editBio} onClose={() => setEditBio(false)}>
        <form onSubmit={saveBio} className="space-y-4">
          <FormField label="Bio"><FormTextarea value={bio} onChange={setBio} placeholder="Web Developer | AI Enthusiast..." /></FormField>
          <SaveButton loading={saving} />
        </form>
      </EditModal>

      {/* Open to Work Modal */}
      <EditModal title="Open to Work Settings" open={editOpenToWork} onClose={() => setEditOpenToWork(false)}>
        <form onSubmit={saveOpenToWork} className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-card-foreground">Open to Work</label>
            <button
              type="button"
              onClick={() => setOpenToWork(!openToWork)}
              className={`w-10 h-5 rounded-full transition-colors ${openToWork ? "bg-accent" : "bg-muted"}`}
            >
              <div className={`w-4 h-4 bg-card rounded-full transition-transform mx-0.5 ${openToWork ? "translate-x-5" : ""}`} />
            </button>
          </div>

          <FormField label="Seeking">
            <div className="flex flex-wrap gap-2">
              {seekingOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSeekingType(opt)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    seekingType === opt ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground border-border hover:bg-muted"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Work Mode">
            <div className="flex flex-wrap gap-2">
              {workModeOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setWorkMode(opt)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    workMode === opt ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground border-border hover:bg-muted"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Work Location">
            <FormInput value={workLocation} onChange={setWorkLocation} placeholder="City, Country" />
          </FormField>

          <SaveButton loading={saving} />
        </form>
      </EditModal>
    </>
  );
};

export default ProfileHeader;
