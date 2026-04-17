// @ts-nocheck
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, ClipboardList, Mail } from "lucide-react";
import { toast } from "sonner";

export default function EmployeeRequests() {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["employee-requests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employee_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateRequest = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("employee_requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["employee-requests"] });
      toast.success(`Request ${status}`);
    },
  });

  const pending = requests.filter((r: any) => r.status === "pending");
  const resolved = requests.filter((r: any) => r.status !== "pending");

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-heading font-bold">Employee Requests</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {pending.length} pending · {resolved.length} resolved
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base sm:text-lg flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              Pending ({pending.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending requests.</p>
            ) : (
              <div className="space-y-3">
                {pending.map((req: any) => (
                  <div key={req.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-secondary/50 border border-border/40">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{req.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{req.name}</p>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{req.email} · {req.role || "No role"}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:shrink-0">
                      <Button size="sm" className="flex-1 sm:flex-none gap-1" onClick={() => updateRequest.mutate({ id: req.id, status: "accepted" })}>
                        <Check className="h-3 w-3" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 sm:flex-none gap-1" onClick={() => updateRequest.mutate({ id: req.id, status: "rejected" })}>
                        <X className="h-3 w-3" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {resolved.length > 0 && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="font-heading text-base sm:text-lg">Resolved</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {resolved.map((req: any) => (
                  <div key={req.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/30">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{req.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{req.email}</p>
                    </div>
                    <Badge variant={req.status === "accepted" ? "default" : "destructive"} className="capitalize shrink-0">{req.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
