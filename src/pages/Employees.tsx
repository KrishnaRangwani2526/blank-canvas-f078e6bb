// @ts-nocheck
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function Employees() {
  const [search, setSearch] = useState("");
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = employees.filter((e: any) =>
    (e.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.role || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold">Employees</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">{employees.length} team members</p>
          </div>
          <Button className="gap-2 w-full sm:w-auto" onClick={() => toast.info("Employee invitation will be available soon.")}>
            <UserPlus className="h-4 w-4" /> Add Employee
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-10 w-10 mx-auto text-muted-foreground opacity-40 mb-3" />
              <p className="text-muted-foreground">No employees yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((emp: any) => (
              <Card key={emp.id} className="hover:shadow-md hover:border-primary/40 transition-all overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm">
                      <span className="text-sm font-bold text-primary-foreground">{emp.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-semibold truncate">{emp.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{emp.role || "Employee"}</p>
                    </div>
                    <Badge variant={emp.status === "active" ? "default" : "secondary"} className="capitalize shrink-0">{emp.status}</Badge>
                  </div>
                  {emp.department && (
                    <div className="mt-3 pt-3 border-t border-border/60">
                      <p className="text-xs text-muted-foreground">{emp.department}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
