// @ts-nocheck
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HRCandidateProfile } from "@/components/HRCandidateProfile";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface CandidateData {
  id: string;
  name: string;
  email: string;
  bio?: string;
  profile_pic?: string;
  cover_image?: string;
  about?: string;
  skills: string[];
  education: any[];
  projects: any[];
  certificates: any[];
  streak_consistency?: number;
  github_streak?: number;
  leetcode_streak?: number;
  kaggle_streak?: number;
  aspiring_streak?: number;
  universal_rank?: number;
  ats_score?: number;
}

export default function HRCandidateProfilePage() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [selectedJobRank, setSelectedJobRank] = useState<number | undefined>();
  const [selectedAtsScore, setSelectedAtsScore] = useState<number | undefined>();

  const { data: candidate, isLoading } = useQuery({
    queryKey: ["candidate", candidateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", candidateId!)
        .single();
      if (error) throw error;
      return data as CandidateData;
    },
    enabled: !!candidateId,
  });

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    try {
      // In a real implementation, this would send to a backend API
      // and create a message in the database
      toast.success(`Message sent to ${candidate?.name}`);
      setMessageText("");
      setMessageOpen(false);
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleAddComment = (projectId: string, comment: string) => {
    try {
      // In a real implementation, this would save the comment to the database
      toast.success("Comment added successfully");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">Loading candidate profile...</div>
      </DashboardLayout>
    );
  }

  if (!candidate) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Button onClick={() => navigate(-1)} variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <p className="text-muted-foreground">Candidate not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate(-1)} variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
            <Button onClick={() => setMessageOpen(true)} className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Message Candidate
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Message to {candidate.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="min-h-32"
                />
                <Button className="w-full gap-2" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <HRCandidateProfile
          candidate={candidate}
          ranking={{
            universal_rank: candidate.universal_rank,
            ats_score: selectedAtsScore ?? candidate.ats_score,
            job_rank: selectedJobRank,
          }}
          streaks={{
            github: candidate.github_streak || 0,
            leetcode: candidate.leetcode_streak || 0,
            kaggle: candidate.kaggle_streak || 0,
            aspiring: candidate.aspiring_streak || 0,
          }}
          onMessageClick={() => setMessageOpen(true)}
          onCommentAdd={handleAddComment}
        />
      </div>
    </DashboardLayout>
  );
}
