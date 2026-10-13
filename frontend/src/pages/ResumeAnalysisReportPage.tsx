import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileCheck,
  FileEdit,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Award,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client';
import { ResumeAnalysis } from '../types';

export const ResumeAnalysisReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: analysis, isLoading, error, refetch } = useQuery<ResumeAnalysis>({
    queryKey: ['resumeAnalysis', id],
    queryFn: () => api.getLatestAnalysis(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Generating explainable resume analysis report...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="p-8 bg-surface border border-slate-200 rounded-2xl text-center max-w-lg mx-auto">
        <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900">Analysis Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          This resume hasn't been analyzed yet or the report could not be retrieved.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/resumes/analyze"
            className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            Back to Analyzer
          </Link>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const categoryMaxWeights: Record<string, { label: string; max: number; weight: string }> = {
    projects_experience: { label: 'Projects & Practical Depth', max: 25, weight: '25%' },
    skills_relevance: { label: 'Skills & Technical Relevance', max: 20, weight: '20%' },
    work_achievements: { label: 'Work Experience & Honors', max: 20, weight: '20%' },
    ats_readability: { label: 'ATS Readability & Parsing', max: 15, weight: '15%' },
    education_certs: { label: 'Education & Accreditations', max: 10, weight: '10%' },
    writing_impact: { label: 'Writing Quality & XYZ Impact', max: 10, weight: '10%' },
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success bg-emerald-50 border-emerald-200';
    if (score >= 65) return 'text-primary bg-indigo-50 border-indigo-200';
    return 'text-warning bg-amber-50 border-amber-200';
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header & Score Hero */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Explainable Evaluation Report</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resume Diagnostic Report</h1>
          <p className="text-xs text-slate-500 mt-1">
            Generated using verified document extraction and placement rubric scoring.
          </p>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex flex-col items-center p-4 rounded-2xl border bg-slate-50 border-slate-200 min-w-[120px]">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overall Score</span>
            <div className="text-4xl font-black text-slate-900 mt-1">
              {analysis.overall_score}
              <span className="text-sm font-semibold text-slate-400">/100</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 border ${getScoreColor(analysis.overall_score)}`}>
              {analysis.overall_score >= 80 ? 'Placement Ready' : analysis.overall_score >= 65 ? 'Competitive' : 'Needs Polish'}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to={`/resumes/studio`}
              className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Open in Resume Studio</span>
            </Link>
            <Link
              to="/job-matcher"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Match with Job Description →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Category Rubric Scores */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card">
        <h2 className="text-sm font-bold text-slate-900 mb-1">Category Rubric Breakdown</h2>
        <p className="text-xs text-slate-500 mb-6">
          Scored transparently across 6 weighted dimensions. Points reflect content depth, keyword precision, and verification.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categoryMaxWeights).map(([key, meta]) => {
            const rawScore = (analysis.category_scores as any)?.[key] || 0;
            const pct = Math.round((rawScore / meta.max) * 100);
            return (
              <div key={key} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>{meta.label}</span>
                  <span className="text-slate-400 font-normal">({meta.weight})</span>
                </div>
                <div className="flex items-baseline justify-between mt-2 mb-1.5">
                  <span className="text-xl font-bold text-slate-900">{rawScore} <span className="text-xs font-medium text-slate-400">/ {meta.max} pts</span></span>
                  <span className="text-xs font-semibold text-slate-600">{pct}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weak Bullet Point Rewrites (Google XYZ / STAR Format) */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card">
        <div className="flex items-center space-x-2 mb-1">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-slate-900">High-Impact Bullet Point Rewrites</h2>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          AI-suggested improvements applying Google's XYZ formula: "Accomplished [X] measured by [Y], by doing [Z]".
        </p>

        <div className="space-y-4">
          {analysis.weak_bullet_rewrites && analysis.weak_bullet_rewrites.length > 0 ? (
            analysis.weak_bullet_rewrites.map((rw, index) => (
              <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-start space-x-2">
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase flex-shrink-0 mt-0.5">
                    Original
                  </span>
                  <p className="text-xs text-slate-600 italic">"{rw.original}"</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase flex-shrink-0 mt-0.5">
                    Rewritten
                  </span>
                  <p className="text-xs font-semibold text-slate-900">{rw.improved}</p>
                </div>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/80">
                  <strong className="text-slate-700">Rationale:</strong> {rw.reason}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No weak bullet points identified.</p>
          )}
        </div>
      </div>

      {/* Two Columns: Strengths & ATS Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <h2 className="text-sm font-bold text-slate-900">Verified Strengths</h2>
          </div>
          <ul className="space-y-2.5">
            {analysis.strengths?.map((str, idx) => (
              <li key={idx} className="flex items-start text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-success mr-2.5 mt-1.5 flex-shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ATS & Formatting Concerns */}
        <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h2 className="text-sm font-bold text-slate-900">ATS Parsing & Formatting Concerns</h2>
          </div>
          <ul className="space-y-2.5">
            {analysis.ats_concerns?.map((ats, idx) => (
              <li key={idx} className="flex items-start text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-warning mr-2.5 mt-1.5 flex-shrink-0" />
                <span>{ats}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Prioritized Improvement Checklist */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card">
        <h2 className="text-sm font-bold text-slate-900 mb-1">Prioritized Action Checklist</h2>
        <p className="text-xs text-slate-500 mb-4">
          Recommended sequence of modifications to maximize placement screening pass rate.
        </p>

        <div className="space-y-2.5">
          {analysis.prioritized_checklist?.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs gap-3"
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    item.priority === 'high'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {item.priority}
                </span>
                <span className="text-slate-800 font-medium">{item.task}</span>
              </div>
              <span className="text-xs font-semibold text-primary whitespace-nowrap">
                {item.estimated_impact}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
