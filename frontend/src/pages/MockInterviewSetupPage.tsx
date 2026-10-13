import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MessagesSquare,
  Sparkles,
  Mic,
  FileText,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { api } from '../api/client';
import { Resume } from '../types';

export const MockInterviewSetupPage: React.FC = () => {
  const navigate = useNavigate();

  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [interviewType, setInterviewType] = useState('technical');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [interactionMode, setInteractionMode] = useState<'text' | 'voice'>('voice');
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [isStarting, setIsStarting] = useState(false);

  const { data: resumes } = useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: () => api.getResumes(),
  });

  React.useEffect(() => {
    if (resumes && resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true);
    try {
      const session = await api.startInterview({
        resume_id: selectedResumeId || undefined,
        target_role: targetRole,
        interview_type: interviewType,
        difficulty: difficulty,
        duration_minutes: durationMinutes,
        total_questions: totalQuestions,
        interaction_mode: interactionMode,
      });
      navigate(`/interviews/live/${session.session_id}`, {
        state: {
          interviewer_reply: session.interviewer_reply,
          interviewer_thought: session.interviewer_thought,
        },
      });
    } catch (err) {
      console.error(err);
      setIsStarting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-primary flex items-center justify-center mx-auto mb-3 shadow-sm">
          <MessagesSquare className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Mock Interview Studio</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Practice multi-turn placement interviews calibrated against your actual resume projects and target role.
        </p>
      </div>

      {/* Setup Form */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card">
        <form onSubmit={handleStart} className="space-y-6">
          {/* Target Role & Resume */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Job Role</label>
              <input
                type="text"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Frontend Engineer, SDE-1"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Context Resume</label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {resumes?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interview Type Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">Interview Format</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'technical', title: 'Technical & CS', desc: 'Core CS concepts, API architecture, code decisions' },
                { id: 'project', title: 'Project Deep-Dive', desc: 'Probing decisions made in your uploaded resume projects' },
                { id: 'behavioral', title: 'Behavioral & STAR', desc: 'Conflict resolution, leadership, deadline handling' },
                { id: 'hr', title: 'HR & Culture Fit', desc: 'Motivation, company alignment, career trajectory' },
                { id: 'mixed', title: 'Comprehensive Mixed', desc: 'A realistic blend of technical, project, and behavioral' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setInterviewType(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    interviewType === t.id
                      ? 'bg-indigo-50 border-primary text-primary'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-bold">{t.title}</div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-normal">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty & Session Length */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Difficulty Tier</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="beginner">Junior / Campus Intern</option>
                <option value="intermediate">Entry-Level / SDE-1</option>
                <option value="advanced">Rigorous / SDE-2</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Number of Questions</label>
              <select
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={3}>3 Questions (Express Practice)</option>
                <option value={5}>5 Questions (Standard Round)</option>
                <option value={8}>8 Questions (In-Depth Simulation)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Response Mode</label>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setInteractionMode('voice')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center space-x-1 transition-all ${
                    interactionMode === 'voice' ? 'bg-white text-primary shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Speech & Voice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInteractionMode('text')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center space-x-1 transition-all ${
                    interactionMode === 'text' ? 'bg-white text-primary shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Text Only</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-3 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
            <span>
              Voice answers are powered by Groq Whisper API (whisper-large-v3-turbo) for high accuracy, with Web Speech fallback.
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isStarting}
              className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              <span>{isStarting ? 'Preparing Interview Room...' : 'Enter AI Mock Interview Room'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
