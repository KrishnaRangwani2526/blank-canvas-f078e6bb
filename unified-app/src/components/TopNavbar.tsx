import { Bell, Building2, ChevronDown, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";

export function TopNavbar() {
  const { user, signOut, company } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 shrink-0">
      <SidebarTrigger />

      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Building2 className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-heading font-bold text-foreground hidden sm:inline">HireFlow</span>
      </div>

      <div className="flex-1 max-w-md mx-auto hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search candidates, jobs..." className="pl-9 bg-secondary border-0" />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <NotificationsDropdown />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-medium text-primary-foreground">
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <span className="hidden sm:inline text-sm">{company?.name || "Account"}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="text-xs text-muted-foreground">{user?.email}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/dashboard")}>Dashboard</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/hr")}>HR Management</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
