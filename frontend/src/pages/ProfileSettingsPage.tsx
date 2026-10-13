import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  Settings,
  Cpu,
  ShieldCheck,
  Save,
  CheckCircle2,
  RefreshCw,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const ProfileSettingsPage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [college, setCollege] = useState(user?.profile?.college || '');
  const [degree, setDegree] = useState(user?.profile?.degree || 'B.Tech');
  const [branch, setBranch] = useState(user?.profile?.branch || 'Computer Science & Engineering');
  const [gradYear, setGradYear] = useState(user?.profile?.graduation_year?.toString() || '2026');
  const [targetRole, setTargetRole] = useState(user?.profile?.target_role || 'Software Engineer');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: aiStatus, refetch: refetchAi } = useQuery({
    queryKey: ['aiDiagnostics'],
    queryFn: () => api.getDiagnostics(),
  });

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setCollege(user.profile?.college || '');
      setDegree(user.profile?.degree || 'B.Tech');
      setBranch(user.profile?.branch || 'Computer Science & Engineering');
      setGradYear(user.profile?.graduation_year?.toString() || '2026');
      setTargetRole(user.profile?.target_role || 'Software Engineer');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateProfile({
        college,
        degree,
        branch,
        graduation_year: parseInt(gradYear) || 2026,
        target_role: targetRole,
        onboarding_completed: true,
      });
      await refreshUser();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings & Preferences</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your candidate profile, target career roles, and AI provider diagnostics.
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card">
        <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center space-x-2">
          <User className="w-4 h-4 text-primary" />
          <span>Candidate Information</span>
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Your profile helps Persona Hire calibrate interview difficulty and suggest relevant skill improvements.
        </p>

        {saveSuccess && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
            <span>Profile settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-700 font-semibold mb-1 block">Full Name</label>
              <input
                type="text"
                disabled
                value={fullName}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold mb-1 block">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-700 font-semibold mb-1 block">College / University</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="Institute of Technology"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold mb-1 block">Degree</label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="B.Tech"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold mb-1 block">Graduation Year</label>
              <input
                type="number"
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                placeholder="2026"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-semibold mb-1 block">Target Placement Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full Stack Software Engineer"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-70"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* AI Provider Architecture & Diagnostics */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-slate-900">AI Architecture & Provider Diagnostics</h2>
          </div>
          <button
            onClick={() => refetchAi()}
            className="text-xs text-primary font-semibold hover:underline flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Check Connectivity</span>
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Persona Hire employs an enterprise-grade provider failover layer: Groq as primary high-speed provider, with automatic fallback to OpenRouter.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Primary Provider:</span>
              <span className="px-2 py-0.5 bg-indigo-50 text-primary border border-indigo-200 rounded font-mono font-bold">
                Groq API
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Model ID:</span>
              <span className="font-mono text-slate-800">{aiStatus?.groq_model || 'llama-3.3-70b-versatile'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Configured:</span>
              <span className={aiStatus?.groq_available ? 'text-success font-semibold' : 'text-slate-400'}>
                {aiStatus?.groq_available ? 'API Key Active' : 'Fallback Engine Ready'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Automatic Failover:</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded font-mono font-bold">
                OpenRouter API
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Model ID:</span>
              <span className="font-mono text-slate-800">{aiStatus?.openrouter_model || 'meta-llama/llama-3.3-70b'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Active Routing:</span>
              <span className="font-bold text-primary capitalize">
                {aiStatus?.active_provider || 'Heuristic Engine'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Sign Out of Persona Hire</h3>
          <p className="text-[11px] text-slate-500">End your current session on this device.</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
