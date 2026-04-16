// @ts-nocheck
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/useNotifications";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Circle } from "lucide-react";

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useNotifications();

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["candidate-notifications"] }),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-sm text-muted-foreground">Loading notifications...</CardContent>
          </Card>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-sm text-muted-foreground">
              No notifications yet. New job postings will appear here as soon as recruiters publish them.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card key={notification.id} className={`${notification.is_read ? "" : "border-primary"}`}>
                <CardHeader className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Circle className={`h-3 w-3 ${notification.is_read ? "text-muted-foreground" : "text-primary"}`} />
                    <CardTitle className="text-base font-semibold">{notification.type || "Update"}</CardTitle>
                  </div>
                  {!notification.is_read && (
                    <Button variant="outline" size="sm" onClick={() => markRead.mutate(notification.id)}>
                      Mark read
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(notification.created_at).toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
