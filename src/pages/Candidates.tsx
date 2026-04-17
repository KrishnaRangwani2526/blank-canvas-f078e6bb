import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, Eye, Trash2, Users, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Candidates() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["candidates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("hr_deleted_candidates");
    if (stored) {
      try { setDeletedIds(JSON.parse(stored)); } catch (e) {}
    }
  }, []);

  const handleDelete = (id: string, name: string) => {
    const newDeleted = [...deletedIds, id];
    setDeletedIds(newDeleted);
    localStorage.setItem("hr_deleted_candidates", JSON.stringify(newDeleted));
    toast.success(`${name} has been removed from your dashboard.`);
  };

  const filtered = candidates.filter((c: any) =>
    !deletedIds.includes(c.id) &&
    (c.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-heading font-bold">Candidates</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{filtered.length} profiles available</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading candidates...</p>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-10 w-10 mx-auto text-muted-foreground opacity-40 mb-3" />
              <p className="text-muted-foreground">No candidates found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((candidate: any) => (
              <Card key={candidate.id} className="hover:shadow-md hover:border-primary/40 transition-all overflow-hidden">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm">
                      <span className="text-sm font-bold text-primary-foreground">{(candidate.full_name || "?")[0]?.toUpperCase()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading font-semibold truncate">{candidate.full_name || "Unknown"}</p>
                      {candidate.location && (
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" /> {candidate.location}
                        </p>
                      )}
                    </div>
                  </div>
                  {candidate.bio && <p className="text-sm text-muted-foreground line-clamp-2">{candidate.bio}</p>}
                  <div className="flex gap-2 pt-2 border-t border-border/60">
                    <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => navigate(`/candidates/${candidate.user_id}`)}>
                      <Eye className="h-3 w-3" /> View
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleDelete(candidate.id, candidate.full_name || "Unknown")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
