import { useRef } from "react";
import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import ProfileHeader from "@/components/ProfileHeader";
import WorkInfo from "@/components/WorkInfo";
import AboutSection from "@/components/AboutSection";
import AnalyticsSection from "@/components/AnalyticsSection";
import TopSkills from "@/components/TopSkills";
import ExperienceSection from "@/components/ExperienceSection";
import ProjectSection from "@/components/ProjectSection";
import CertificateSection from "@/components/CertificateSection";
import EducationSection from "@/components/EducationSection";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, education, experience, projects, certificates, skills, learningGoals, loading, refetch } = useProfile();

  const eduRef = useRef<{ openAdd: () => void }>(null);
  const projRef = useRef<{ openAdd: () => void }>(null);
  const certRef = useRef<{ openAdd: () => void }>(null);

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Fixed */}
          <div className="w-56 md:w-64 flex-shrink-0">
            <div className="sticky top-20 overflow-y-auto max-h-[calc(100vh-5rem)] scrollbar-hide">
              <LeftSidebar />
            </div>
          </div>

          {/* Right - Profile Content (scrollable) */}
          <div className="flex-1 min-w-0 space-y-4">
            <ProfileHeader
              profile={profile}
              refetch={refetch}
              onAddEducation={() => eduRef.current?.openAdd()}
              onAddProject={() => projRef.current?.openAdd()}
              onAddCertificate={() => certRef.current?.openAdd()}
            />
            <WorkInfo profile={profile} refetch={refetch} />
            <AnalyticsSection />
            <AboutSection profile={profile} refetch={refetch} />
            <TopSkills />
            <ExperienceSection experience={experience} refetch={refetch} />
            <ProjectSection ref={projRef} projects={projects} refetch={refetch} />
            <CertificateSection ref={certRef} certificates={certificates} refetch={refetch} />
            <EducationSection ref={eduRef} education={education} refetch={refetch} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
