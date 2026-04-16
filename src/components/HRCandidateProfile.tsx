import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { AlertCircle, Code, Trophy, Zap, BookOpen, Award, ChevronDown, MessageSquare } from "lucide-react";

interface Streak {
  github: number;
  leetcode: number;
  kaggle: number;
  aspiring: number;
}

interface RankingInfo {
  universal_rank?: number;
  job_rank?: number;
  ats_score?: number;
}

interface ProjectComment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
}

interface Project {
  id: string;
  title: string;
  description: string;
  link?: string;
  comments?: ProjectComment[];
}

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  year: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  bio?: string;
  profile_pic?: string;
  cover_image?: string;
  about?: string;
  skills: string[];
  education: Education[];
  projects: Project[];
  certificates: Certificate[];
  streak_consistency?: number;
}

interface HRCandidateProfileProps {
  candidate: Candidate;
  ranking: RankingInfo;
  streaks: Streak;
  onMessageClick?: () => void;
  onCommentAdd?: (projectId: string, comment: string) => void;
  isHR?: boolean;
  onReleaseResult?: () => void;
  onJoinRequest?: () => void;
}

export function HRCandidateProfile({
  candidate,
  ranking,
  streaks,
  onMessageClick,
  onCommentAdd,
  isHR,
  onReleaseResult,
  onJoinRequest,
}: HRCandidateProfileProps) {
  const [expandedStreak, setExpandedStreak] = useState(false);
  const [projectComments, setProjectComments] = useState<Record<string, string>>({});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Profile - Left side (3 columns) */}
      <div className="lg:col-span-3 space-y-6">
        {/* Header with Cover Image */}
        {candidate.cover_image && (
          <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg overflow-hidden">
            <img src={candidate.cover_image} alt="cover" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Profile Intro Card */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {candidate.profile_pic && (
                  <img
                    src={candidate.profile_pic}
                    alt={candidate.name}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                )}
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">{candidate.name}</h1>
                  <p className="text-secondary-foreground">{candidate.email}</p>
                  {candidate.bio && (
                    <p className="text-sm text-muted-foreground italic">{candidate.bio}</p>
                  )}
                </div>
              </div>
              <Button onClick={onMessageClick} variant="default" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>

            {candidate.about && (
              <div className="pt-4 border-t">
                <p className="text-sm">{candidate.about}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="skills" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>

          {/* Skills Section */}
          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Technical Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills?.map((skill) => (
                    <Badge key={skill} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education Section */}
          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidate.education?.map((edu) => (
                  <div key={edu.id} className="border-l-2 border-primary pl-4 space-y-1">
                    <p className="font-semibold">{edu.degree} in {edu.field}</p>
                    <p className="text-sm text-muted-foreground">{edu.school}</p>
                    <p className="text-xs text-muted-foreground">{edu.year}</p>
                  </div>
                ))}
                {!candidate.education || candidate.education.length === 0 && (
                  <p className="text-muted-foreground">No education information provided</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Section */}
          <TabsContent value="projects">
            <div className="space-y-4">
              {candidate.projects?.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            View Project →
                          </a>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{project.description}</p>

                    {/* Comments Section */}
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Comments ({project.comments?.length || 0})
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4 pt-4 border-t space-y-3">
                        {/* Existing Comments */}
                        {project.comments?.map((comment) => (
                          <div key={comment.id} className="bg-muted/50 p-3 rounded">
                            <p className="text-xs font-semibold">{comment.author}</p>
                            <p className="text-sm mt-1">{comment.text}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(comment.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        ))}

                        {/* Add Comment */}
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Add a comment..."
                            value={projectComments[project.id] || ""}
                            onChange={(e) =>
                              setProjectComments({
                                ...projectComments,
                                [project.id]: e.target.value,
                              })
                            }
                            className="min-h-20"
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              if (projectComments[project.id]) {
                                onCommentAdd?.(project.id, projectComments[project.id]);
                                setProjectComments({ ...projectComments, [project.id]: "" });
                              }
                            }}
                          >
                            Post Comment
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              ))}
              {!candidate.projects || candidate.projects.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No projects added yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Certificates Section */}
          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>Certificates & Awards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {candidate.certificates?.map((cert) => (
                    <div key={cert.id} className="flex items-start gap-3 p-3 border rounded">
                      <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">{cert.issuer} • {cert.date}</p>
                      </div>
                    </div>
                  ))}
                  {!candidate.certificates || candidate.certificates.length === 0 && (
                    <p className="text-muted-foreground">No certificates added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Ranking Sidebar - Right side (1 column) */}
      <div className="lg:col-span-1 space-y-4">
        {/* Core HR Actions Card */}
        {isHR && (
          <Card className="border-primary/50 bg-primary/5 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                HR Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={onReleaseResult} 
                className="w-full justify-start text-left font-semibold"
              >
                Release Interview Result
              </Button>
              <Button 
                onClick={onJoinRequest} 
                variant="outline" 
                className="w-full justify-start text-left font-semibold border-primary/50 text-primary hover:bg-primary/10"
              >
                Send Join Request
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ATS Score Card */}
        {ranking.ats_score !== undefined && (
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                ATS Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {ranking.ats_score.toFixed(1)}
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Profile Completeness & Match</p>
            </CardContent>
          </Card>
        )}

        {/* Universal Rank Card */}
        {ranking.universal_rank !== undefined && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Universal Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">#{ranking.universal_rank}</div>
              <p className="text-xs text-muted-foreground mt-2">Across all candidates</p>
            </CardContent>
          </Card>
        )}

        {/* Job Rank Card */}
        {ranking.job_rank !== undefined && (
          <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4" />
                Job Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">#{ranking.job_rank}</div>
              <p className="text-xs text-muted-foreground mt-2">For this position</p>
            </CardContent>
          </Card>
        )}

        {/* Streaks Section - Collapsible */}
        <Collapsible>
          <Card>
            <CardHeader className="pb-3">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full hover:bg-muted/50 p-1 rounded">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Platform Streaks
                  </CardTitle>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${expandedStreak ? "rotate-180" : ""}`}
                  />
                </button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-2 pt-0">
                {streaks.github > 0 && (
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      <span className="text-xs font-medium">GitHub</span>
                    </div>
                    <span className="text-sm font-bold">{streaks.github}d</span>
                  </div>
                )}
                {streaks.leetcode > 0 && (
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-xs font-medium">LeetCode</span>
                    </div>
                    <span className="text-sm font-bold">{streaks.leetcode}d</span>
                  </div>
                )}
                {streaks.kaggle > 0 && (
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span className="text-xs font-medium">Kaggle</span>
                    </div>
                    <span className="text-sm font-bold">{streaks.kaggle}d</span>
                  </div>
                )}
                {streaks.aspiring > 0 && (
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span className="text-xs font-medium">Aspiring</span>
                    </div>
                    <span className="text-sm font-bold">{streaks.aspiring}d</span>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Streak Consistency Card */}
        {candidate.streak_consistency !== undefined && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Consistency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {candidate.streak_consistency.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-2">Learning consistency</p>
            </CardContent>
          </Card>
        )}

        {/* Resume Card */}
        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" size="sm" variant="outline">
              View Resume
            </Button>
            <Button className="w-full" size="sm" variant="outline">
              Download Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
