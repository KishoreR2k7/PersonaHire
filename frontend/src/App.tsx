import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ResumeAnalyzerPage } from './pages/ResumeAnalyzerPage';
import { ResumeAnalysisReportPage } from './pages/ResumeAnalysisReportPage';
import { ResumeStudioPage } from './pages/ResumeStudioPage';
import { JobMatcherPage } from './pages/JobMatcherPage';
import { MockInterviewSetupPage } from './pages/MockInterviewSetupPage';
import { LiveMockInterviewPage } from './pages/LiveMockInterviewPage';
import { InterviewEvaluationPage } from './pages/InterviewEvaluationPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { AppLayout } from './components/layout/AppLayout';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Authenticated Layout Routes */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/resumes/analyze" element={<ResumeAnalyzerPage />} />
        <Route path="/resumes/:id/report" element={<ResumeAnalysisReportPage />} />
        <Route path="/resumes/studio" element={<ResumeStudioPage />} />
        <Route path="/job-matcher" element={<JobMatcherPage />} />
        <Route path="/interviews" element={<MockInterviewSetupPage />} />
        <Route path="/interviews/setup" element={<MockInterviewSetupPage />} />
        <Route path="/interviews/live/:sessionId" element={<LiveMockInterviewPage />} />
        <Route path="/interviews/:sessionId/evaluation" element={<InterviewEvaluationPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<ProfileSettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
export default App;
