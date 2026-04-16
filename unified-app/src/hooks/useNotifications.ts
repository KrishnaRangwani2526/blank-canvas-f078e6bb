import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CandidateNotification {
  id: string;
  company_id: string;
  created_at: string;
  is_read: boolean;
  message: string;
  metadata: any;
  type: string;
}

export function useNotifications() {
  const { user } = useAuth();

  return useQuery<CandidateNotification[]>({
    queryKey: ["candidate-notifications", user?.id],
    queryFn: async () => {
      const query = supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);

      const { data, error } = user?.id
        ? await query.or(`metadata->>recipient_type.eq.global,metadata->>recipient_id.eq.${user.id}`)
        : await query;

      if (error) throw error;

      return (data ?? []) as CandidateNotification[];
    },
    enabled: Boolean(user?.id)
  });
}
