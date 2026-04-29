// @ts-nocheck
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function HRManagement() {
  const { data: hrMembers = [], isLoading } = useQuery({
    queryKey: ["hr-members"],
    queryFn: async () => {
      const { data, error } = await supabase.from("hr_members").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-2xl font-heading font-bold">HR Management</h1>
          <Button className="gap-2 w-full sm:w-auto" onClick={() => toast.info("HR member invitation will be available soon.")}>
            <UserPlus className="h-4 w-4" /> Add HR Member
          </Button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : hrMembers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No HR members yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hrMembers.map((hr) => (
              <Card key={hr.id}>
                <CardContent className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{hr.name?.[0]?.toUpperCase() || "H"}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading font-semibold truncate">{hr.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{hr.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{hr.role}</Badge>
                    <Badge variant={hr.status === "active" ? "default" : "secondary"} className="capitalize">{hr.status}</Badge>
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
