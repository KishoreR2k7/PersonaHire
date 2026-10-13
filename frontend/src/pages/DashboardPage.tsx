import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  FileCheck,
  FileEdit,
  MessagesSquare,
  Briefcase,
  Compass,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { DashboardStats } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: () => api.getDashboardStats(),
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>
          <div className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>
          <div className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Format dimensions for Radar Chart
  const radarData = stats?.readiness_dimensions
    ? [
        { subject: 'Resume Quality', value: stats.readiness_dimensions.resume_quality },
        { subject: 'Tech Skills', value: stats.readiness_dimensions.technical_skills },
        { subject: 'Communication', value: stats.readiness_dimensions.communication },
        { subject: 'Project Depth', value: stats.readiness_dimensions.project_depth },
        { subject: 'ATS Alignment', value: stats.readiness_dimensions.ats_readiness },
        { subject: 'Interview Acumen', value: stats.readiness_dimensions.interview_acumen },
      ]
    : [];

  const targetRole = user?.profile?.target_role || 'Software Engineer';

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Candidate'}
            </h1>
            <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-primary text-xs font-semibold rounded-full">
              Target: {targetRole}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track your placement readiness metrics and take your next best career action.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/resumes/analyze"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-subtle transition-all flex items-center space-x-1.5"
          >
            <FileCheck className="w-3.5 h-3.5 text-primary" />
            <span>Upload Resume</span>
          </Link>
          <Link
            to="/interviews/setup"
            className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
          >
            <MessagesSquare className="w-3.5 h-3.5" />
            <span>New Mock Interview</span>
          </Link>
        </div>
      </div>

      {/* Overview Cards (Design matching product prompt) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Resume Score */}
        <div className="p-5 rounded-2xl bg-surface border border-slate-200 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Resume score</span>
              <FileCheck className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {stats?.latest_resume_score !== null && stats?.latest_resume_score !== undefined
                  ? `${stats.latest_resume_score}`
                  : '—'}
              </span>
              <span className="text-sm font-medium text-slate-400">/100</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {stats?.latest_resume_score ? 'Explainable rubric score' : 'No analysis yet'}
            </span>
            <Link to="/resumes/analyze" className="font-semibold text-primary hover:underline">
              {stats?.latest_resume_score ? 'View report →' : 'Analyze now →'}
            </Link>
          </div>
        </div>

        {/* Card 2: Interviews Completed */}
        <div className="p-5 rounded-2xl bg-surface border border-slate-200 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Interviews completed</span>
              <MessagesSquare className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {String(stats?.interviews_completed || 0).padStart(2, '0')}
              </span>
              <span className="text-xs text-slate-400 font-medium">Practice sessions</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Avg Score: {stats?.average_interview_score ? `${stats.average_interview_score}/100` : 'None yet'}
            </span>
            <Link to="/interviews" className="font-semibold text-primary hover:underline">
              Practice →
            </Link>
          </div>
        </div>

        {/* Card 3: Placement Readiness */}
        <div className="p-5 rounded-2xl bg-surface border border-slate-200 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Placement Readiness</span>
              <Award className="w-4 h-4 text-primary" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-primary">
                {stats?.readiness_percentage || 50}%
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Active Prep
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Tasks: {stats?.tasks_completed_count || 0}/{stats?.total_tasks_count || 0} finished
            </span>
            <Link to="/roadmap" className="font-semibold text-primary hover:underline">
              Roadmap →
            </Link>
          </div>
        </div>
      </div>

      {/* Your Next Best Action Card (Product Design Spec) */}
      <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 shadow-subtle">
        <div className="flex items-center space-x-2 text-[11px] font-bold text-primary uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Your next best action</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <h3 className="text-base font-bold text-slate-900">
              {stats?.next_best_action?.title || 'Improve your project descriptions'}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {stats?.next_best_action?.description ||
                'Highlight your technical decisions, measurable results, and the tools you used using the XYZ formula.'}
            </p>
          </div>
          <Link
            to={stats?.next_best_action?.cta_route || '/resumes/studio'}
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-sm transition-all whitespace-nowrap self-start sm:self-auto flex items-center space-x-1.5"
          >
            <span>{stats?.next_best_action?.cta_label || 'Take Action'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Analytics & Readiness Dimensions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart: Placement Readiness Dimensions */}
        <div className="p-6 rounded-2xl bg-surface border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Readiness Competency Radar</h2>
              <p className="text-[11px] text-slate-500">Multidimensional evaluation across key placement standards</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">0 - 100 Scale</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#CBD5E1" tick={{ fill: '#94A3B8', fontSize: 9 }} />
                <Radar name="Readiness" dataKey="value" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="p-6 rounded-2xl bg-surface border border-slate-200 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recent Placement Activities</h2>
                <p className="text-[11px] text-slate-500">Chronological activity and preparation milestones</p>
              </div>
              <Link to="/history" className="text-xs font-semibold text-primary hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {stats?.recent_activities && stats.recent_activities.length > 0 ? (
                stats.recent_activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start space-x-3 text-xs">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 truncate">{act.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(act.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No activities recorded yet. Start by uploading your resume or practicing a mock interview!
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Roadmap Progress</span>
            <span className="font-semibold text-slate-700">
              {stats?.tasks_completed_count || 0} / {stats?.total_tasks_count || 0} tasks completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
