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
  AlertCircle,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  Zap,
  Trash2,
  Sparkles,
  Check
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const ProfileSettingsPage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();

  // Profile Form States
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [college, setCollege] = useState(user?.profile?.college || '');
  const [degree, setDegree] = useState(user?.profile?.degree || 'B.Tech');
  const [branch, setBranch] = useState(user?.profile?.branch || 'Computer Science & Engineering');
  const [gradYear, setGradYear] = useState(user?.profile?.graduation_year?.toString() || '2026');
  const [targetRole, setTargetRole] = useState(user?.profile?.target_role || 'Software Engineer');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // AI Provider & Groq API States
  const [groqKeyInput, setGroqKeyInput] = useState('');
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [selectedGroqModel, setSelectedGroqModel] = useState('llama-3.3-70b-versatile');
  const [modelOptions, setModelOptions] = useState<string[]>([
    'llama-3.3-70b-versatile',
    'openai/gpt-oss-120b',
    'llama-3.1-8b-instant',
    'qwen/qwen3.8-27b',
    'mixtral-8x7b-32768'
  ]);
  const [isTestingGroq, setIsTestingGroq] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    latency_ms?: number;
    model?: string;
  } | null>(null);
  const [isSavingGroq, setIsSavingGroq] = useState(false);
  const [groqSuccessMsg, setGroqSuccessMsg] = useState<string | null>(null);
  const [isClearingGroq, setIsClearingGroq] = useState(false);

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

  useEffect(() => {
    if (aiStatus?.groq_model) {
      setSelectedGroqModel(aiStatus.groq_model);
      if (!modelOptions.includes(aiStatus.groq_model)) {
        setModelOptions((prev) => [aiStatus.groq_model, ...prev]);
      }
    }
  }, [aiStatus?.groq_model]);

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

  const handleTestGroq = async () => {
    setIsTestingGroq(true);
    setTestResult(null);
    setGroqSuccessMsg(null);
    try {
      const res = await api.testGroqConnection(
        groqKeyInput.trim() || undefined,
        selectedGroqModel
      );
      setTestResult(res);

      if (res.available_models && res.available_models.length > 0) {
        // Filter models to prioritize chat models
        const chatModels = res.available_models.filter(
          (m) => !['whisper', 'guard', 'audio', 'orpheus'].some((s) => m.toLowerCase().includes(s))
        );
        setModelOptions(Array.from(new Set([...chatModels, ...res.available_models, ...modelOptions])));
      }
      if (res.model) {
        setSelectedGroqModel(res.model);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || 'Unable to test Groq connection.',
      });
    } finally {
      setIsTestingGroq(false);
    }
  };

  const handleSaveGroqConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groqKeyInput.trim() && !aiStatus?.groq_available) {
      setTestResult({
        success: false,
        error: 'Please enter a valid Groq API Key starting with gsk_ before saving.',
      });
      return;
    }

    setIsSavingGroq(true);
    setGroqSuccessMsg(null);
    setTestResult(null);
    try {
      const keyToSave = groqKeyInput.trim() || (aiStatus?.groq_available ? undefined : '');
      if (keyToSave) {
        await api.updateGroqConfig(keyToSave, selectedGroqModel);
      } else {
        await api.updateGroqConfig(groqKeyInput.trim(), selectedGroqModel);
      }
      await refetchAi();
      setGroqKeyInput('');
      setGroqSuccessMsg('Groq API Key and Model saved successfully!');
      setTimeout(() => setGroqSuccessMsg(null), 4000);
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || 'Failed to save Groq configuration.',
      });
    } finally {
      setIsSavingGroq(false);
    }
  };

  const handleClearGroq = async () => {
    if (!confirm('Are you sure you want to remove your Groq API key? The website will fall back to OpenRouter or the offline Heuristic Engine.')) {
      return;
    }
    setIsClearingGroq(true);
    try {
      await api.clearGroqConfig();
      await refetchAi();
      setGroqKeyInput('');
      setTestResult(null);
      setGroqSuccessMsg('Groq API Key removed.');
      setTimeout(() => setGroqSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsClearingGroq(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings & Preferences</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your candidate profile, target career roles, and AI provider credentials.
        </p>
      </div>

      {/* Groq Cloud API & Provider Configuration */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary">
              <Zap className="w-5 h-5 fill-primary/20 text-primary" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-900">Groq Cloud API Key</h2>
                <span className="px-2 py-0.5 text-[10px] bg-indigo-100 text-primary font-bold rounded-full">
                  Primary Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload your Groq API key to power ultra-fast mock interviews, resume ATS scoring, and Whisper speech transcription.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => refetchAi()}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              title="Refresh provider status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Diagnostics</span>
            </button>
          </div>
        </div>

        {/* Current Status Pill */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full flex-shrink-0 ${
                aiStatus?.groq_available ? 'bg-success ring-4 ring-emerald-100' : 'bg-amber-400 ring-4 ring-amber-100'
              }`}
            />
            <div>
              <div className="text-xs font-semibold text-slate-800 flex items-center space-x-2">
                <span>{aiStatus?.groq_available ? 'Groq API Active & Connected' : 'No Groq API Key Uploaded'}</span>
                {aiStatus?.groq_key_masked && (
                  <span className="font-mono text-[11px] px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded font-bold">
                    {aiStatus.groq_key_masked}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {aiStatus?.groq_available
                  ? `Active Model: ${aiStatus.groq_model || 'llama-3.3-70b-versatile'} | Speech-to-Text: ${aiStatus.groq_stt_model || 'whisper-large-v3-turbo'}`
                  : 'Currently routing requests through the built-in heuristic fallback engine.'}
              </p>
            </div>
          </div>

          {aiStatus?.groq_available && (
            <button
              onClick={handleClearGroq}
              disabled={isClearingGroq}
              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center space-x-1 px-2.5 py-1 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isClearingGroq ? 'Removing...' : 'Remove Key'}</span>
            </button>
          )}
        </div>

        {/* Groq Upload & Settings Form */}
        <form onSubmit={handleSaveGroqConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* API Key Input */}
            <div className="sm:col-span-2">
              <label className="text-slate-700 font-semibold text-xs mb-1.5 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-primary" />
                  <span>Groq API Key (starts with gsk_)</span>
                </span>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-primary hover:underline font-normal flex items-center space-x-1"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </label>

              <div className="relative">
                <input
                  type={showGroqKey ? 'text' : 'password'}
                  value={groqKeyInput}
                  onChange={(e) => setGroqKeyInput(e.target.value)}
                  placeholder={aiStatus?.groq_key_masked ? `Configured (${aiStatus.groq_key_masked}) - paste new to replace` : 'gsk_...'}
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowGroqKey(!showGroqKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showGroqKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Model Selector */}
            <div>
              <label className="text-slate-700 font-semibold text-xs mb-1.5 block">
                Groq Model
              </label>
              <select
                value={selectedGroqModel}
                onChange={(e) => setSelectedGroqModel(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                {modelOptions.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Test / Error / Success Feedback Banners */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start space-x-3 text-xs ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 flex-1">
                <div className="font-semibold">
                  {testResult.success ? 'Connectivity Verified!' : 'Connection Error'}
                </div>
                <div className="text-[11px] leading-relaxed">
                  {testResult.message || testResult.error}
                </div>
                {testResult.latency_ms !== undefined && (
                  <div className="text-[10px] font-mono text-emerald-700">
                    Response Roundtrip Latency: {testResult.latency_ms}ms
                  </div>
                )}
              </div>
            </div>
          )}

          {groqSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-xs text-emerald-800">
              <Check className="w-4 h-4 text-success flex-shrink-0" />
              <span className="font-semibold">{groqSuccessMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Keys are securely saved in server configuration (.env).</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleTestGroq}
                disabled={isTestingGroq}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingGroq ? 'animate-spin text-primary' : ''}`} />
                <span>{isTestingGroq ? 'Testing Live...' : 'Test Connection'}</span>
              </button>

              <button
                type="submit"
                disabled={isSavingGroq || (!groqKeyInput.trim() && !aiStatus?.groq_available)}
                className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingGroq ? 'Saving to Website...' : 'Save & Activate'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Diagnostics & Failover Architecture Overview */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <span>AI Architecture & Failover Diagnostics</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Primary Provider:</span>
                <span className="px-2 py-0.5 bg-indigo-50 text-primary border border-indigo-200 rounded font-mono font-bold text-[11px]">
                  Groq Cloud (LPU)
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Configured Model:</span>
                <span className="font-mono text-slate-800 font-semibold">{aiStatus?.groq_model || selectedGroqModel}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Status:</span>
                <span className={aiStatus?.groq_available ? 'text-success font-semibold' : 'text-slate-400'}>
                  {aiStatus?.groq_available ? 'Connected' : 'Fallback Ready'}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Automatic Fallback:</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded font-mono font-bold text-[11px]">
                  OpenRouter / Offline Engine
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Active Routing:</span>
                <span className="font-bold text-primary capitalize">
                  {aiStatus?.active_provider === 'groq' ? 'Groq LPU (Primary)' : (aiStatus?.active_provider || 'Heuristic Engine')}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Voice STT:</span>
                <span className="font-mono text-slate-800">
                  {aiStatus?.stt_available ? 'Groq Whisper Active' : 'Web Speech Fallback'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Profile Form */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card">
        <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center space-x-2">
          <User className="w-4 h-4 text-primary" />
          <span>Candidate Placement Profile</span>
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Your profile helps Persona Hire calibrate interview difficulty and tailor skill improvement roadmaps.
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
