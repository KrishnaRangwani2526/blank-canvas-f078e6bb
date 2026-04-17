// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Search, MapPin, Globe, Send, MessageSquare, Check, X, Clock, UserPlus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function NetworkPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [activeChatUser, setActiveChatUser] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch all profiles except current user
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["network-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("user_id", user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch connections for current user (without joins - fetch profiles separately)
  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ["network-connections", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .or(`requester_id.eq.${user?.id},recipient_id.eq.${user?.id}`);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch messages for current user
  const { data: messages = [] } = useQuery({
    queryKey: ["network-messages", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  // Helper: get profile by user_id
  const getProfile = (userId: string) => profiles.find(p => p.user_id === userId);

  // Mutations
  const sendRequestMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      const { error } = await supabase.from("connections").insert({
        requester_id: user?.id,
        recipient_id: recipientId,
        status: 'pending'
      });
      if (error) throw error;
      // Create notification for recipient
      await supabase.from("notifications").insert({
        user_id: recipientId,
        type: "connection_request",
        message: `${user?.user_metadata?.full_name || 'Someone'} sent you a connection request`,
        metadata: { sender_id: user?.id }
      });
    },
    onSuccess: () => {
      toast.success("Connection request sent!");
      queryClient.invalidateQueries({ queryKey: ["network-connections"] });
    },
    onError: (error: any) => toast.error(error.message || "Failed to send request"),
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase.from("connections").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(`Request ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ["network-connections"] });
    },
    onError: (error: any) => toast.error(error.message || "Failed to update request"),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: string, content: string }) => {
      const { error } = await supabase.from("messages").insert({
        sender_id: user?.id,
        recipient_id: recipientId,
        content
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-messages"] });
      setChatMessage("");
      setMessageText("");
      setMessageDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to send message"),
  });

  // Process connection data
  const pendingReceived = connections.filter(c => c.recipient_id === user?.id && c.status === 'pending');
  const pendingSent = connections.filter(c => c.requester_id === user?.id && c.status === 'pending');
  const activeConnections = connections.filter(c => c.status === 'accepted');
  const connectedIds = connections.map(c => c.requester_id === user?.id ? c.recipient_id : c.requester_id);
  const discoverableProfiles = profiles.filter(p => !connectedIds.includes(p.user_id));

  const filteredProfiles = discoverableProfiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Messages: get unique conversations
  const getConversations = () => {
    const convMap = new Map<string, { userId: string; lastMessage: any; unreadCount: number }>();
    messages.forEach(msg => {
      const otherId = msg.sender_id === user?.id ? msg.recipient_id : msg.sender_id;
      const existing = convMap.get(otherId);
      if (!existing || new Date(msg.created_at) > new Date(existing.lastMessage.created_at)) {
        convMap.set(otherId, {
          userId: otherId,
          lastMessage: msg,
          unreadCount: (existing?.unreadCount || 0) + (msg.sender_id !== user?.id && !msg.is_read ? 1 : 0)
        });
      } else if (msg.sender_id !== user?.id && !msg.is_read) {
        existing.unreadCount++;
      }
    });
    return Array.from(convMap.values()).sort((a, b) => 
      new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    );
  };

  const conversations = getConversations();
  const activeChatMessages = activeChatUser 
    ? messages.filter(m => 
        (m.sender_id === user?.id && m.recipient_id === activeChatUser.user_id) ||
        (m.recipient_id === user?.id && m.sender_id === activeChatUser.user_id)
      )
    : [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatMessages.length]);

  const handleMessageOpen = (targetUser: any) => {
    setSelectedUser(targetUser);
    setMessageDialogOpen(true);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedUser) return;
    sendMessageMutation.mutate({ recipientId: selectedUser.user_id, content: messageText });
  };

  const handleSendChatMessage = () => {
    if (!chatMessage.trim() || !activeChatUser) return;
    sendMessageMutation.mutate({ recipientId: activeChatUser.user_id, content: chatMessage });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="w-full md:w-56 md:w-64 flex-shrink-0">
          <div className="md:sticky md:top-20 overflow-visible md:overflow-y-auto md:max-h-[calc(100vh-5rem)] scrollbar-hide">
            <LeftSidebar />
          </div>
        </div>
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold tracking-tight">Network</h1>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="discover">Discover</TabsTrigger>
                <TabsTrigger value="connections">My Network ({activeConnections.length})</TabsTrigger>
                <TabsTrigger value="requests">Requests {pendingReceived.length > 0 && `(${pendingReceived.length})`}</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>

              {/* DISCOVER TAB */}
              <TabsContent value="discover" className="mt-6 space-y-4">
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input placeholder="Search candidates by name, role, or location..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                {profilesLoading ? (
                  <div className="flex justify-center p-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
                ) : filteredProfiles.length === 0 ? (
                  <div className="text-center p-12 border border-dashed rounded-lg">
                    <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No new candidates found</h3>
                    <p className="text-muted-foreground">Try adjusting your search criteria</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProfiles.map(profile => (
                      <Card key={profile.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="h-20 bg-gradient-to-r from-blue-500/10 to-indigo-500/10" />
                          <div className="px-5 pb-5 -mt-10">
                            <img src={profile.avatar_url || 'https://via.placeholder.com/150'} alt={profile.full_name || 'User'} className="h-20 w-20 rounded-full border-4 border-background object-cover mb-3" />
                            <Link to={`/profile/${profile.user_id}`} className="block">
                              <h3 className="font-semibold text-lg hover:text-primary transition-colors">{profile.full_name || 'Anonymous User'}</h3>
                            </Link>
                            {profile.bio && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{profile.bio}</p>}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                              <MapPin className="h-3 w-3" />
                              <span>{profile.location || 'Remote'}</span>
                            </div>
                            <Button className="w-full mt-4 gap-2" size="sm" onClick={() => sendRequestMutation.mutate(profile.user_id)} disabled={sendRequestMutation.isPending}>
                              <UserPlus className="h-4 w-4" /> Connect
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* MY NETWORK TAB */}
              <TabsContent value="connections" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Connections</CardTitle>
                    <CardDescription>People you are currently connected with</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {connectionsLoading ? (
                      <div className="flex justify-center p-6"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>
                    ) : activeConnections.length === 0 ? (
                      <div className="text-center p-8 bg-muted/30 rounded-lg">
                        <h3 className="text-lg font-medium">No connections yet</h3>
                        <p className="text-muted-foreground">Start connecting with people in the Discover tab</p>
                        <Button variant="outline" className="mt-4" onClick={() => setActiveTab("discover")}>Explore Network</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activeConnections.map(conn => {
                          const partnerId = conn.requester_id === user?.id ? conn.recipient_id : conn.requester_id;
                          const partner = getProfile(partnerId);
                          return (
                            <div key={conn.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/20 transition-colors">
                              <div className="flex items-center gap-4">
                                <img src={partner?.avatar_url || 'https://via.placeholder.com/150'} alt={partner?.full_name || 'User'} className="h-12 w-12 rounded-full object-cover" />
                                <div>
                                  <Link to={`/profile/${partnerId}`} className="font-medium hover:text-primary transition-colors">{partner?.full_name || 'Anonymous User'}</Link>
                                  <p className="text-sm text-muted-foreground">{partner?.bio || 'No bio'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => { setActiveChatUser(partner || { user_id: partnerId }); setActiveTab("messages"); }}>
                                  <MessageSquare className="h-4 w-4 mr-2" /> Message
                                </Button>
                                <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => { if (confirm("Remove this connection?")) updateRequestMutation.mutate({ id: conn.id, status: 'rejected' }); }}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* REQUESTS TAB */}
              <TabsContent value="requests" className="mt-6 space-y-6">
                <Card>
                  <CardHeader><CardTitle>Received Requests ({pendingReceived.length})</CardTitle></CardHeader>
                  <CardContent>
                    {pendingReceived.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-4 text-center">No pending invitations.</p>
                    ) : (
                      <div className="space-y-4">
                        {pendingReceived.map(conn => {
                          const requester = getProfile(conn.requester_id);
                          return (
                            <div key={conn.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-4">
                                <img src={requester?.avatar_url || 'https://via.placeholder.com/150'} alt={requester?.full_name || 'User'} className="h-10 w-10 rounded-full object-cover" />
                                <div>
                                  <Link to={`/profile/${conn.requester_id}`} className="font-medium hover:text-primary">{requester?.full_name || 'Anonymous User'}</Link>
                                  <p className="text-xs text-muted-foreground">{requester?.bio}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateRequestMutation.mutate({ id: conn.id, status: 'accepted' })}>
                                  <Check className="h-4 w-4 mr-1" /> Accept
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => updateRequestMutation.mutate({ id: conn.id, status: 'rejected' })}>
                                  <X className="h-4 w-4 mr-1" /> Decline
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Sent Requests ({pendingSent.length})</CardTitle></CardHeader>
                  <CardContent>
                    {pendingSent.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-4 text-center">No pending sent requests.</p>
                    ) : (
                      <div className="space-y-4">
                        {pendingSent.map(conn => {
                          const recipient = getProfile(conn.recipient_id);
                          return (
                            <div key={conn.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                              <div className="flex items-center gap-4 opacity-70">
                                <img src={recipient?.avatar_url || 'https://via.placeholder.com/150'} alt={recipient?.full_name || 'User'} className="h-10 w-10 rounded-full object-cover grayscale" />
                                <div>
                                  <span className="font-medium">{recipient?.full_name || 'Anonymous User'}</span>
                                  <p className="text-xs text-muted-foreground">Sent {new Date(conn.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
                                <Button size="sm" variant="ghost" onClick={() => updateRequestMutation.mutate({ id: conn.id, status: 'rejected' })}>Withdraw</Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* MESSAGES TAB */}
              <TabsContent value="messages" className="mt-6">
                <Card>
                  <CardContent className="p-0">
                    <div className="flex h-[500px]">
                      {/* Conversation list */}
                      <div className="w-80 border-r overflow-y-auto">
                        <div className="p-3 border-b">
                          <h3 className="font-semibold text-sm">Conversations</h3>
                        </div>
                        {conversations.length === 0 ? (
                          <div className="p-6 text-center text-sm text-muted-foreground">
                            No messages yet. Connect with people and start chatting!
                          </div>
                        ) : (
                          conversations.map(conv => {
                            const partner = getProfile(conv.userId);
                            const isActive = activeChatUser?.user_id === conv.userId;
                            return (
                              <button
                                key={conv.userId}
                                onClick={() => setActiveChatUser(partner || { user_id: conv.userId, full_name: 'User' })}
                                className={`w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left ${isActive ? 'bg-secondary' : ''}`}
                              >
                                <img src={partner?.avatar_url || 'https://via.placeholder.com/40'} alt="" className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-sm truncate">{partner?.full_name || 'User'}</span>
                                    <span className="text-[10px] text-muted-foreground">{new Date(conv.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">{conv.lastMessage.content}</p>
                                </div>
                                {conv.unreadCount > 0 && (
                                  <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] flex-shrink-0">{conv.unreadCount}</Badge>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                      
                      {/* Chat area */}
                      <div className="flex-1 flex flex-col">
                        {activeChatUser ? (
                          <>
                            <div className="p-3 border-b flex items-center gap-3">
                              <img src={activeChatUser.avatar_url || 'https://via.placeholder.com/32'} alt="" className="h-8 w-8 rounded-full object-cover" />
                              <span className="font-semibold text-sm">{activeChatUser.full_name || 'User'}</span>
                            </div>
                            <ScrollArea className="flex-1 p-4">
                              <div className="space-y-3">
                                {activeChatMessages.map(msg => (
                                  <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${
                                      msg.sender_id === user?.id 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-secondary text-secondary-foreground'
                                    }`}>
                                      {msg.content}
                                      <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                                <div ref={chatEndRef} />
                              </div>
                            </ScrollArea>
                            <div className="p-3 border-t flex gap-2">
                              <Input 
                                placeholder="Type a message..." 
                                value={chatMessage} 
                                onChange={(e) => setChatMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                              />
                              <Button size="icon" onClick={handleSendChatMessage} disabled={!chatMessage.trim()}>
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 flex items-center justify-center">
                            <div className="text-center space-y-3">
                              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto opacity-30" />
                              <p className="text-muted-foreground text-sm">Select a conversation to start messaging</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Quick Message Dialog */}
          <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Message {selectedUser?.full_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Textarea placeholder={`Write a message to ${selectedUser?.full_name}...`} className="min-h-[120px]" value={messageText} onChange={(e) => setMessageText(e.target.value)} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSendMessage} disabled={sendMessageMutation.isPending || !messageText.trim()}>
                  {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                  <Send className="h-4 w-4 ml-2" />
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
