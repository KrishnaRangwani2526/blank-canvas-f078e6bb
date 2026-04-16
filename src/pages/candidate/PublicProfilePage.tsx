import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, MapPin, Briefcase, Award, FolderGit2, GraduationCap, ArrowLeft, Diamond, UserPlus, MessageSquare, Clock, Check, Send, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

const PublicProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { profile, education, experience, projects, certificates, skills, loading } = useProfile(userId);
  
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [projectComments, setProjectComments] = useState<Record<string, string>>({});

  // Fetch connection status
  const { data: connectionStatus } = useQuery({
    queryKey: ["connection-status", user?.id, userId],
    queryFn: async () => {
      if (!user || !userId || user.id === userId) return null;
      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${user.id})`)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!userId && user.id !== userId,
  });

  // Fetch project comments
  const { data: allComments = [] } = useQuery({
    queryKey: ["project-comments", userId],
    queryFn: async () => {
      if (!projects || projects.length === 0) return [];
      const projectIds = projects.map(p => p.id);
      const { data, error } = await supabase
        .from("project_comments")
        .select(`*, user:profiles!project_comments_user_id_fkey(full_name)`)
        .in("project_id", projectIds);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!projects && projects.length > 0,
  });

  // Universal Rank via Python API
  const { data: universalRanking } = useQuery({
    queryKey: ["universal-rank"],
    queryFn: async () => {
      try {
        const response = await fetch("http://localhost:8000/rank/universal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}) // Rank everyone to get relative global rank
        });
        if (!response.ok) return null;
        return await response.json();
      } catch (e) {
        console.warn("Python Ranking Engine is offline or failed", e);
        return null;
      }
    },
    retry: false // Don't block UI if engine is offline
  });

  const candidateOverallRank = universalRanking?.candidate_ranks?.find((c: any) => c.candidate_id === userId);

  // Mutations
  const sendRequestMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("connections")
        .insert({
          requester_id: user?.id,
          recipient_id: userId,
          status: 'pending'
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Connection request sent!");
      queryClient.invalidateQueries({ queryKey: ["connection-status"] });
    },
    onError: (error: any) => toast.error(error.message)
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("messages")
        .insert({
          sender_id: user?.id,
          recipient_id: userId,
          content: messageText
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Message sent successfully!");
      setMessageText("");
      setMessageDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.message)
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ projectId, content }: { projectId: string, content: string }) => {
      const { error } = await supabase
        .from("project_comments")
        .insert({
          project_id: projectId,
          user_id: user?.id,
          content
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Comment added");
      queryClient.invalidateQueries({ queryKey: ["project-comments"] });
    },
    onError: (error: any) => toast.error(error.message)
  });

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    sendMessageMutation.mutate();
  };

  const handleAddComment = (projectId: string) => {
    const content = projectComments[projectId];
    if (!content?.trim()) return;
    addCommentMutation.mutate({ projectId, content });
    setProjectComments({ ...projectComments, [projectId]: "" });
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!profile) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Profile not found</p></div>;

  const isOwnProfile = user?.id === userId;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 mb-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {/* Header */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-primary/20">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{profile.display_name || profile.full_name || "User"}</h1>
                  {candidateOverallRank && (
                    <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 font-semibold gap-1 px-2 py-0.5 whitespace-nowrap">
                      <Trophy className="h-3 w-3" /> Universal Rank #{candidateOverallRank.universal_rank}
                    </Badge>
                  )}
                </div>
                {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  {profile.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {profile.location}</span>}
                  {profile.open_to_work && <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20">Open to Work</Badge>}
                </div>
              </div>
            </div>

            {/* Actions for other users */}
            {!isOwnProfile && user && (
              <div className="flex w-full sm:w-auto gap-2">
                {!connectionStatus && (
                  <Button onClick={() => sendRequestMutation.mutate()} disabled={sendRequestMutation.isPending} className="flex-1 sm:flex-none gap-2">
                    <UserPlus className="h-4 w-4" /> Connect
                  </Button>
                )}
                
                {connectionStatus?.status === 'pending' && connectionStatus.requester_id === user.id && (
                  <Button disabled variant="outline" className="flex-1 sm:flex-none gap-2">
                    <Clock className="h-4 w-4" /> Pending
                  </Button>
                )}
                
                {connectionStatus?.status === 'pending' && connectionStatus.recipient_id === user.id && (
                  <Button variant="outline" className="flex-1 sm:flex-none gap-2 border-primary text-primary" asChild>
                    <Link to="/network">Respond</Link>
                  </Button>
                )}

                {connectionStatus?.status === 'accepted' && (
                  <>
                    <Button variant="outline" className="flex-1 sm:flex-none gap-2 bg-primary/5 border-primary/20" disabled>
                      <Check className="h-4 w-4" /> Connected
                    </Button>
                    <Button variant="default" onClick={() => setMessageDialogOpen(true)} className="flex-1 sm:flex-none gap-2">
                      <MessageSquare className="h-4 w-4" /> Message
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
          {profile.about && <p className="text-sm text-foreground/80 mt-6 pt-4 border-t">{profile.about}</p>}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Diamond className="h-5 w-5 text-primary" /> Skills
            </h2>
            <div className="flex flex-wrap gap-3">
              {skills.map(s => {
                let skillRank = null;
                if (universalRanking?.skill_rankings?.[s.name]) {
                   const rankMatch = universalRanking.skill_rankings[s.name].find((c: any) => c.candidate_id === userId);
                   if (rankMatch) skillRank = rankMatch.rank;
                }
                
                return (
                  <Badge key={s.id} variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-2 border-primary/10 hover:border-primary/30 transition-colors">
                    {s.name}
                    {skillRank && (
                      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                        #{skillRank}
                      </span>
                    )}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" /> Experience
            </h2>
            <div className="space-y-6">
              {experience.map(e => (
                <div key={e.id} className="relative pl-6 border-l-2 border-muted">
                  <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 ring-4 ring-background" />
                  <p className="text-base font-semibold">{e.role}</p>
                  <p className="text-sm text-primary font-medium">{e.company}</p>
                  <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                    <span>{e.start_date || 'Unknown'} - {e.is_current ? 'Present' : (e.end_date || 'Unknown')}</span>
                    {e.location && <span>• {e.location}</span>}
                  </div>
                  {e.description && <p className="text-sm mt-2 text-foreground/80">{e.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-primary" /> Projects
            </h2>
            <div className="grid gap-6">
              {projects.map(p => {
                const projectCommentsList = allComments.filter((c: any) => c.project_id === p.id);
                return (
                  <div key={p.id} className="border rounded-lg p-5 bg-background">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-base font-semibold">{p.title}</h3>
                      {p.url && (
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                          View Live ↗
                        </a>
                      )}
                    </div>
                    {p.description && <p className="text-sm text-foreground/80 mb-3">{p.description}</p>}
                    {Array.isArray(p.tech_stack) && (p.tech_stack as string[]).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(p.tech_stack as string[]).map((t: string) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                      </div>
                    )}

                    {/* Project Comments */}
                    {user && (
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-2 -ml-3 mt-2">
                            <MessageSquare className="h-4 w-4" /> 
                            Comments ({projectCommentsList.length})
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 pt-4 mt-2 border-t">
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {projectCommentsList.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic">No comments yet. Be the first to comment!</p>
                            ) : (
                              projectCommentsList.map((c: any) => (
                                <div key={c.id} className="bg-muted/40 p-3 rounded-lg text-sm">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-xs">{c.user?.full_name || 'Anonymous'}</span>
                                    <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-foreground/80">{c.content}</p>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Textarea 
                              placeholder="Leave a comment on this project..."
                              className="min-h-[40px] text-sm"
                              value={projectComments[p.id] || ""}
                              onChange={(e) => setProjectComments({ ...projectComments, [p.id]: e.target.value })}
                            />
                            <Button size="icon" className="shrink-0" onClick={() => handleAddComment(p.id)} disabled={addCommentMutation.isPending}>
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Education & Certs - Minimal row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Education */}
          {education.length > 0 && (
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" /> Education
              </h2>
              <div className="space-y-3">
                {education.map(e => (
                  <div key={e.id} className="border-b last:border-0 pb-3 last:pb-0">
                    <p className="text-sm font-semibold">{e.degree}</p>
                    <p className="text-xs text-muted-foreground">{e.school}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates */}
          {certificates.length > 0 && (
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" /> Certificates
              </h2>
              <div className="space-y-3">
                {certificates.map(c => (
                  <div key={c.id} className="border-b last:border-0 pb-3 last:pb-0">
                    <p className="text-sm font-semibold">{c.name}</p>
                    {c.issuer && <p className="text-xs text-muted-foreground">{c.issuer}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {profile?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={`Write your message...`}
              className="min-h-[120px]"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendMessage} disabled={sendMessageMutation.isPending || !messageText.trim()}>
              {sendMessageMutation.isPending ? "Sending..." : "Send"}
              <Send className="h-4 w-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicProfilePage;
