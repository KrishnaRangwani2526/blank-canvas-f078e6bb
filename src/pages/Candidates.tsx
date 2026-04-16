import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, Eye, Trash2 } from "lucide-react";
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
      try {
        setDeletedIds(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const handleDelete = (id: string, name: string) => {
    const newDeleted = [...deletedIds, id];
    setDeletedIds(newDeleted);
    localStorage.setItem("hr_deleted_candidates", JSON.stringify(newDeleted));
    toast.success(`${name} has been removed from your dashboard.`);
  };

  const filtered = candidates.filter((c) =>
    !deletedIds.includes(c.id) &&
    (c.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold">Candidates</h1>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or skills..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading candidates...</p>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No candidates found. Dummy candidates will be seeded.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((candidate) => (
              <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{(candidate.full_name || "?")[0]}</span>
                    </div>
                    <div>
                      <p className="font-heading font-semibold">{candidate.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{candidate.location || ""}</p>
                    </div>
                  </div>
                  {candidate.bio && <p className="text-sm text-muted-foreground line-clamp-2">{candidate.bio}</p>}
                  <div className="flex gap-2 w-full mt-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => navigate(`/candidates/${candidate.user_id}`)}>
                      <Eye className="h-3 w-3" /> View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
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
