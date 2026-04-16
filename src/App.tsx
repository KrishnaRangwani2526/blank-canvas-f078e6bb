import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from "@/components/ui/sonner";

// Pages
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';

// Candidate pages
import CandidateDashboard from './pages/candidate/Index';
import CandidateJobs from './pages/candidate/JobsPage';
import CandidateAnalytics from './pages/candidate/AnalyticsPage';
import CandidateRank from './pages/candidate/RankPage';
import CandidateStreak from './pages/candidate/StreakPage';
import CandidateTimeline from './pages/candidate/TimelinePage';
import CandidateSkills from './pages/candidate/SkillsPage';
import CandidateNotifications from './pages/candidate/NotificationsPage';
import CandidateAddPlatform from './pages/candidate/AddPlatformPage';
import CandidateProjects from './pages/candidate/ProjectsPage';
import CandidateLearning from './pages/candidate/LearningPage';
import CandidateAISuggestions from './pages/candidate/AISuggestionsPage';
import CandidateATSScore from './pages/candidate/ATSScorePage';
import CandidateResume from './pages/candidate/ResumePage';
import CandidateNetwork from './pages/candidate/NetworkPage';
import CandidateSettings from './pages/candidate/SettingsPage';
import CandidateSearch from './pages/candidate/SearchPage';
import CandidatePublicProfile from './pages/candidate/PublicProfilePage';

// HR pages
import HRDashboard from './pages/Dashboard';
import HRJobs from './pages/Jobs';
import HRCreateJob from './pages/CreateJob';
import HRJobDetail from './pages/JobDetail';
import HRJobCandidates from './pages/JobCandidates';
import HRCandidates from './pages/Candidates';
import HRCandidateProfile from './pages/HRCandidateProfilePage';
import HREmployees from './pages/Employees';
import HREmployeeRequests from './pages/EmployeeRequests';
import HRManagement from './pages/HRManagement';

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  if (role === 'candidate') {
    return (
      <Routes>
        <Route path="/" element={<CandidateDashboard />} />
        <Route path="/jobs" element={<CandidateJobs />} />
        <Route path="/analytics" element={<CandidateAnalytics />} />
        <Route path="/rank" element={<CandidateRank />} />
        <Route path="/streak" element={<CandidateStreak />} />
        <Route path="/timeline" element={<CandidateTimeline />} />
        <Route path="/skills" element={<CandidateSkills />} />
        <Route path="/notifications" element={<CandidateNotifications />} />
        <Route path="/add-platform" element={<CandidateAddPlatform />} />
        <Route path="/projects" element={<CandidateProjects />} />
        <Route path="/learning" element={<CandidateLearning />} />
        <Route path="/ai-suggestions" element={<CandidateAISuggestions />} />
        <Route path="/ats-score" element={<CandidateATSScore />} />
        <Route path="/resume" element={<CandidateResume />} />
        <Route path="/network" element={<CandidateNetwork />} />
        <Route path="/settings" element={<CandidateSettings />} />
        <Route path="/search" element={<CandidateSearch />} />
        <Route path="/profile/:userId" element={<CandidatePublicProfile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  if (role === 'hr') {
    return (
      <Routes>
        <Route path="/" element={<HRDashboard />} />
        <Route path="/jobs" element={<HRJobs />} />
        <Route path="/jobs/create" element={<HRCreateJob />} />
        <Route path="/jobs/:id" element={<HRJobDetail />} />
        <Route path="/jobs/:id/candidates" element={<HRJobCandidates />} />
        <Route path="/candidates" element={<HRCandidates />} />
        <Route path="/candidates/:id" element={<HRCandidateProfile />} />
        <Route path="/employees" element={<HREmployees />} />
        <Route path="/requests" element={<HREmployeeRequests />} />
        <Route path="/hr" element={<HRManagement />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground text-sm">Syncing profile...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster />
          <Sonner />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
