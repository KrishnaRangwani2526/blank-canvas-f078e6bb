import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function Employees() {
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold">Employees</h1>
          <Button className="gap-2" onClick={() => toast.info("Employee invitation will be available soon.")}>
            <UserPlus className="h-4 w-4" /> Add Employee
          </Button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : employees.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No employees yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <Card key={emp.id}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{emp.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-semibold truncate">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.role || "Employee"}</p>
                    </div>
                    <Badge variant={emp.status === "active" ? "default" : "secondary"} className="capitalize">{emp.status}</Badge>
                  </div>
                  {emp.department && <p className="text-xs text-muted-foreground mt-2">{emp.department}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
