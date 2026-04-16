// @ts-nocheck
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Search, MapPin, Building, Globe, Send, MessageSquare, Check, X, Clock, UserPlus, ArrowLeft } from "lucide-react";
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

  // Fetch connections for current user
  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ["network-connections", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("connections")
        .select(`
          *,
          requester:profiles!connections_requester_id_fkey(*),
          recipient:profiles!connections_recipient_id_fkey(*)
        `)
        .or(`requester_id.eq.${user?.id},recipient_id.eq.${user?.id}`);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Mutations
  const sendRequestMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      const { error } = await supabase
        .from("connections")
        .insert({
          requester_id: user?.id,
          recipient_id: recipientId,
          status: 'pending'
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Connection request sent!");
      queryClient.invalidateQueries({ queryKey: ["network-connections"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send request");
    }
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase
        .from("connections")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(`Request ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ["network-connections"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update request");
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      const { error } = await supabase
        .from("messages")
        .insert({
          sender_id: user?.id,
          recipient_id: recipientId,
          content: messageText
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Message sent successfully!");
      setMessageText("");
      setMessageDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send message");
    }
  });

  // Process data for rendering
  const pendingReceived = connections.filter(c => c.recipient_id === user?.id && c.status === 'pending');
  const pendingSent = connections.filter(c => c.requester_id === user?.id && c.status === 'pending');
  const activeConnections = connections.filter(c => c.status === 'accepted');
  
  // Get IDs of people we already have a connection relationship with
  const connectedIds = connections.map(c => 
    c.requester_id === user?.id ? c.recipient_id : c.requester_id
  );

  // Discoverable profiles are ones we aren't connected to and don't have pending requests with
  const discoverableProfiles = profiles.filter(p => !connectedIds.includes(p.user_id));

  // Filter by search
  const filteredProfiles = discoverableProfiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMessageOpen = (targetUser: any) => {
    setSelectedUser(targetUser);
    setMessageDialogOpen(true);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedUser) return;
    sendMessageMutation.mutate(selectedUser.user_id);
  };

  return (
    <DashboardLayout>
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
            <TabsTrigger value="connections">
              My Network ({activeConnections.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests {pendingReceived.length > 0 && `(${pendingReceived.length})`}
            </TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* DISCOVER TAB */}
          <TabsContent value="discover" className="mt-6 space-y-4">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search candidates by name, role, or location..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {profilesLoading ? (
              <div className="flex justify-center p-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>
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
                        <img 
                          src={profile.avatar_url || 'https://via.placeholder.com/150'} 
                          alt={profile.full_name || 'User Avatar'} 
                          className="h-20 w-20 rounded-full border-4 border-background object-cover mb-3"
                        />
                        <Link to={`/profile/${profile.user_id}`} className="block">
                          <h3 className="font-semibold text-lg hover:text-primary transition-colors">{profile.full_name || 'Anonymous User'}</h3>
                        </Link>
                        {profile.bio && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{profile.bio}</p>}
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                          <MapPin className="h-3 w-3" />
                          <span>{profile.location || 'Remote'}</span>
                        </div>
                        
                        <Button 
                          className="w-full mt-4 gap-2" 
                          size="sm"
                          onClick={() => sendRequestMutation.mutate(profile.user_id)}
                          disabled={sendRequestMutation.isPending}
                        >
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
                  <div className="flex justify-center p-6"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div></div>
                ) : activeConnections.length === 0 ? (
                  <div className="text-center p-8 bg-muted/30 rounded-lg">
                    <h3 className="text-lg font-medium">No connections yet</h3>
                    <p className="text-muted-foreground">Start connecting with people in the Discover tab</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab("discover")}>Explore Network</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeConnections.map(conn => {
                      const isRequester = conn.requester_id === user?.id;
                      const partner = isRequester ? conn.recipient : conn.requester;
                      
                      return (
                        <div key={conn.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/20 transition-colors">
                          <div className="flex items-center gap-4">
                            <img 
                              src={partner?.avatar_url || 'https://via.placeholder.com/150'} 
                              alt={partner?.full_name || 'User Avatar'} 
                              className="h-12 w-12 rounded-full object-cover"
                            />
                            <div>
                              <Link to={`/profile/${partner?.user_id}`} className="font-medium hover:text-primary transition-colors">
                                {partner?.full_name || 'Anonymous User'}
                              </Link>
                              <p className="text-sm text-muted-foreground">{partner?.bio || 'No bio provided'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleMessageOpen(partner)}>
                              <MessageSquare className="h-4 w-4 mr-2" /> Message
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => {
                                if (confirm("Are you sure you want to remove this connection?")) {
                                  updateRequestMutation.mutate({ id: conn.id, status: 'rejected' });
                                }
                              }}
                            >
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
              <CardHeader>
                <CardTitle>Received Requests ({pendingReceived.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingReceived.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 text-center">No pending invitations.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingReceived.map(conn => (
                      <div key={conn.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <img 
                            src={conn.requester?.avatar_url || 'https://via.placeholder.com/150'} 
                            alt={conn.requester?.full_name || 'User'} 
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div>
                            <Link to={`/profile/${conn.requester?.user_id}`} className="font-medium hover:text-primary">
                              {conn.requester?.full_name || 'Anonymous User'}
                            </Link>
                            <p className="text-xs text-muted-foreground">{conn.requester?.bio}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="default"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => updateRequestMutation.mutate({ id: conn.id, status: 'accepted' })}
                          >
                            <Check className="h-4 w-4 mr-1" /> Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateRequestMutation.mutate({ id: conn.id, status: 'rejected' })}
                          >
                            <X className="h-4 w-4 mr-1" /> Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sent Requests ({pendingSent.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingSent.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 text-center">No pending sent requests.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingSent.map(conn => (
                      <div key={conn.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                        <div className="flex items-center gap-4 opacity-70">
                          <img 
                            src={conn.recipient?.avatar_url || 'https://via.placeholder.com/150'} 
                            alt={conn.recipient?.full_name || 'User'} 
                            className="h-10 w-10 rounded-full object-cover grayscale"
                          />
                          <div>
                            <span className="font-medium">{conn.recipient?.full_name || 'Anonymous User'}</span>
                            <p className="text-xs text-muted-foreground">Request sent {new Date(conn.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" /> Pending
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => updateRequestMutation.mutate({ id: conn.id, status: 'rejected' })}
                          >
                            Withdraw
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MESSAGES TAB */}
          <TabsContent value="messages" className="mt-6">
             <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Direct messages with your connections</CardDescription>
              </CardHeader>
              <CardContent className="p-0 border-t h-[500px] flex items-center justify-center bg-muted/10">
                {/* Full messaging implementation will replace this placeholder */}
                <div className="text-center space-y-4">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium">Messaging coming soon</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    We're building a seamless real-time messaging experience. For now, use the "Message" button on a connection to send a quick ping.
                  </p>
                </div>
              </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Messaging Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {selectedUser?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder={`Write a message to ${selectedUser?.full_name}...`}
              className="min-h-[120px]"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
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
    </DashboardLayout>
  );
}
