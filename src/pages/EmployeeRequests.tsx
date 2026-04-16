// @ts-nocheck
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, X } from "lucide-react";
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

  const pending = requests.filter((r) => r.status === "pending");
  const resolved = requests.filter((r) => r.status !== "pending");

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-heading font-bold">Employee Requests</h1>

        <Card>
          <CardHeader><CardTitle className="font-heading text-lg">Pending ({pending.length})</CardTitle></CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending requests.</p>
            ) : (
              <div className="space-y-3">
                {pending.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium">{req.name}</p>
                      <p className="text-sm text-muted-foreground">{req.email} · {req.role || "No role specified"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1" onClick={() => updateRequest.mutate({ id: req.id, status: "accepted" })}>
                        <Check className="h-3 w-3" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => updateRequest.mutate({ id: req.id, status: "rejected" })}>
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
            <CardHeader><CardTitle className="font-heading text-lg">Resolved</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {resolved.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium text-sm">{req.name}</p>
                      <p className="text-xs text-muted-foreground">{req.email}</p>
                    </div>
                    <Badge variant={req.status === "accepted" ? "default" : "destructive"} className="capitalize">{req.status}</Badge>
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
