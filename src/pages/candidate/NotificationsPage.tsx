import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/useNotifications";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Circle, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: notifications = [], isLoading } = useNotifications();

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["candidate-notifications", user?.id] }),
  });

  const removeNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Notification removed");
      queryClient.invalidateQueries({ queryKey: ["candidate-notifications", user?.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove notification");
    }
  });

  const acceptJoinRequest = useMutation({
    mutationFn: async (notification: any) => {
      const metadata = notification.metadata;
      if (!metadata || !metadata.company_id || !user) throw new Error("Invalid request");

      // 1. Fetch user's profile to get name and email
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();

      // 2. Insert into employees
      const { error: empError } = await supabase.from("employees").insert({
        company_id: metadata.company_id,
        name: profile?.full_name || user.email || "Employee",
        email: profile?.email || user.email,
        role: metadata.role || "Software Engineer",
        status: "active",
        joined_at: new Date().toISOString()
      });
      if (empError) throw empError;

      // 3. Insert into candidate's experience
      const { error: expError } = await supabase.from("experience").insert({
        user_id: user.id,
        company: metadata.company_name,
        role: metadata.role || "Software Engineer",
        start_date: new Date().getFullYear().toString(),
        description: `Joined ${metadata.company_name} as ${metadata.role || 'Software Engineer'}`
      });
      if (expError) throw expError;

      // 4. Mark notification as read and updated
      await supabase.from("notifications").update({ 
        is_read: true, 
        metadata: { ...metadata, status: 'accepted' }
      }).eq("id", notification.id);
    },
    onSuccess: () => {
      toast.success("Successfully joined the company! Profile updated.");
      queryClient.invalidateQueries({ queryKey: ["candidate-notifications", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["candidate-experience"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to process request");
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-sm text-muted-foreground flex justify-center">
              <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
            </CardContent>
          </Card>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-sm text-muted-foreground">
              No notifications yet. New activity will appear here.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all duration-300 ${
                  notification.is_read 
                    ? "bg-slate-50/50 border-transparent shadow-none opacity-50 grayscale-[20%]" 
                    : "border-primary/30 bg-primary/[0.03] shadow-sm"
                }`}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-4 py-4">
                  <div className={`flex items-start gap-3 flex-1 ${notification.is_read ? 'opacity-60' : 'opacity-100'}`}>
                    <Circle className={`h-3 w-3 mt-1.5 shrink-0 ${notification.is_read ? "text-muted-foreground" : "fill-primary text-primary"}`} />
                    <div className="space-y-1 w-full">
                      <CardTitle className={`text-sm ${notification.is_read ? "font-medium text-muted-foreground" : "font-semibold"}`}>
                        {notification.type || "Update"}
                      </CardTitle>
                      <p className={`text-sm ${notification.is_read ? "text-muted-foreground" : "text-foreground/90"}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground pt-1">{new Date(notification.created_at).toLocaleString()}</p>
                      
                      {/* Interactive Section for Join Requests */}
                      {notification.type === "job_invite" && notification.metadata?.status !== 'accepted' && (
                        <div className="mt-4 pt-3 border-t border-primary/20 flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                            onClick={() => acceptJoinRequest.mutate(notification)}
                            disabled={acceptJoinRequest.isPending}
                          >
                            <Check className="h-4 w-4" /> Accept Offer
                          </Button>
                        </div>
                      )}
                      {notification.type === "job_invite" && notification.metadata?.status === 'accepted' && (
                        <div className="mt-2 text-xs font-semibold text-green-600 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Offer Accepted
                        </div>
                      )}

                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {!notification.is_read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => markRead.mutate(notification.id)} 
                        className="shrink-0 h-8 text-xs font-medium text-primary hover:bg-primary/10"
                      >
                        Mark as read
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeNotification.mutate(notification.id)} 
                      className="shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Remove notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
