import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  RotateCcw,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { api } from '../api/client';
import { InterviewEvaluation } from '../types';

export const InterviewEvaluationPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  const { data: evaluation, isLoading, error } = useQuery<InterviewEvaluation>({
    queryKey: ['interviewEvaluation', sessionId],
    queryFn: () => api.getInterviewEvaluation(sessionId!),
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (evaluation) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#3730A3', '#10B981', '#F59E0B'],
      });
    }
  }, [evaluation]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500 mt-3">Synthesizing interview coaching evaluation...</p>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="p-8 bg-surface border border-slate-200 rounded-2xl text-center max-w-lg mx-auto">
        <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900">Evaluation Pending</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          This interview has not concluded or evaluation metrics are still processing.
        </p>
        <Link
          to="/interviews"
          className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg shadow-sm"
        >
          Back to Interviews
        </Link>
      </div>
    );
  }

  const rubricDimensions = [
    { label: 'Communication & Clarity', score: evaluation.communication_clarity_score },
    { label: 'Technical Correctness', score: evaluation.technical_correctness_score },
    { label: 'Question Relevance', score: evaluation.relevance_score },
    { label: 'Depth of Explanation', score: evaluation.depth_score },
    { label: 'Problem-Solving Structure', score: evaluation.problem_solving_score },
    { label: 'STAR Format Adherence', score: evaluation.star_method_adherence },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner & Score */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Mock Interview Evaluation</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Performance Scorecard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Objective coaching feedback calibrated against real-world technical and behavioral rubrics.
          </p>
        </div>

        <div className="flex items-center space-x-6">
          <div className="p-4 rounded-2xl border bg-slate-50 border-slate-200 text-center min-w-[130px]">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overall Score</span>
            <div className="text-4xl font-extrabold text-slate-900 mt-1">
              {evaluation.overall_performance_score}
              <span className="text-sm font-semibold text-slate-400">/100</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
              {evaluation.overall_performance_score >= 80 ? 'Highly Qualified' : 'Strong Potential'}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to="/interviews/setup"
              className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Practice Another Round</span>
            </Link>
            <Link
              to="/roadmap"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all text-center"
            >
              Update Preparation Plan
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Verdict */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card">
        <h2 className="text-sm font-bold text-slate-900 mb-2">Interviewer's Assessment Verdict</h2>
        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          {evaluation.summary_verdict}
        </p>
      </div>

      {/* Rubric Breakdown Grid */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card">
        <h2 className="text-sm font-bold text-slate-900 mb-1">Evaluated Competencies</h2>
        <p className="text-xs text-slate-500 mb-6">
          Multi-axis assessment evaluating your verbal structure, technical precision, and composure.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rubricDimensions.map((dim, idx) => (
            <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-semibold text-slate-700 block mb-1">{dim.label}</span>
              <div className="flex items-baseline justify-between mt-2 mb-1.5">
                <span className="text-xl font-bold text-slate-900">{dim.score}%</span>
                <span className="text-[11px] text-slate-400">Target: 80%+</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${dim.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strong vs Weak Answers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Answers */}
        <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card space-y-3">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <h2 className="text-sm font-bold text-slate-900">Standout Answers</h2>
          </div>
          <div className="space-y-3">
            {evaluation.strong_answers?.map((sa, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                <span className="font-semibold text-slate-800 block">Q: {sa.question}</span>
                <p className="text-slate-600 italic">"{sa.answer_snippet}..."</p>
                <p className="text-[11px] text-emerald-700 font-medium pt-1 border-t border-slate-200">
                  Highlight: {sa.highlight}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Answers */}
        <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card space-y-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h2 className="text-sm font-bold text-slate-900">Answers to Polish</h2>
          </div>
          <div className="space-y-3">
            {evaluation.weak_answers?.map((wa, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                <span className="font-semibold text-slate-800 block">Q: {wa.question}</span>
                <p className="text-slate-600"><strong>Opportunity:</strong> {wa.reason}</p>
                <p className="text-[11px] text-primary font-medium pt-1 border-t border-slate-200">
                  Coaching Advice: {wa.suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Improved Example Answers */}
      {evaluation.improved_sample_answers && evaluation.improved_sample_answers.length > 0 && (
        <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-slate-900">Improved Sample Responses</h2>
          </div>
          <div className="space-y-3">
            {evaluation.improved_sample_answers.map((item, idx) => (
              <div key={idx} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs space-y-1.5">
                <span className="font-bold text-slate-900 block">Q: {item.question}</span>
                <p className="text-slate-700 leading-relaxed font-medium">"{item.improved_response}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Follow-up Exercises */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card">
        <div className="flex items-center space-x-2 mb-3">
          <BookOpen className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-slate-900">Personalized Practice Exercises</h2>
        </div>
        <ul className="space-y-2">
          {evaluation.personalized_exercises?.map((ex, idx) => (
            <li key={idx} className="flex items-start text-xs text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2.5 mt-1.5 flex-shrink-0" />
              <span>{ex}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
