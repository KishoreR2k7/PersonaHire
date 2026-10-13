import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  History,
  FileText,
  MessagesSquare,
  Briefcase,
  Eye,
  Award,
  Calendar,
  Clock
} from 'lucide-react';
import { api } from '../api/client';
import { Resume, InterviewSessionItem, JobMatch } from '../types';

export const HistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'resumes' | 'interviews' | 'jobs'>('all');

  const { data: resumes } = useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: () => api.getResumes(),
  });

  const { data: interviews } = useQuery<InterviewSessionItem[]>({
    queryKey: ['interviews'],
    queryFn: () => api.getInterviews(),
  });

  const { data: jobMatches } = useQuery<JobMatch[]>({
    queryKey: ['jobMatches'],
    queryFn: () => api.getJobMatches(),
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Activity & Session History</h1>
        <p className="text-xs text-slate-500 mt-1">
          Archive of your previous resume reports, interactive mock interviews, and tailored job matches.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: 'All Activities' },
          { id: 'resumes', label: `Resumes (${resumes?.length || 0})` },
          { id: 'interviews', label: `Mock Interviews (${interviews?.length || 0})` },
          { id: 'jobs', label: `Job Matches (${jobMatches?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mock Interviews Section */}
      {(activeTab === 'all' || activeTab === 'interviews') && (
        <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <MessagesSquare className="w-4 h-4 text-primary" />
              <span>Mock Interview Sessions</span>
            </h2>
            <Link to="/interviews/setup" className="text-xs font-semibold text-primary hover:underline">
              New Interview →
            </Link>
          </div>

          <div className="space-y-3">
            {interviews && interviews.length > 0 ? (
              interviews.map((intv) => (
                <div
                  key={intv.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h3 className="font-bold text-slate-900">{intv.target_role}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {intv.interview_type.toUpperCase()} • {intv.difficulty} tier • {intv.total_questions} questions
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(intv.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {intv.overall_score && (
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">{intv.overall_score}/100</span>
                        <div className="text-[10px] text-slate-400">Score</div>
                      </div>
                    )}
                    <Link
                      to={`/interviews/${intv.id}/evaluation`}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 shadow-subtle flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-primary" />
                      <span>View Evaluation</span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-3">No mock interviews completed yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Resumes Section */}
      {(activeTab === 'all' || activeTab === 'resumes') && (
        <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Resumes & Reports</span>
            </h2>
            <Link to="/resumes/analyze" className="text-xs font-semibold text-primary hover:underline">
              Analyze New →
            </Link>
          </div>

          <div className="space-y-3">
            {resumes && resumes.length > 0 ? (
              resumes.map((res) => (
                <div
                  key={res.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h3 className="font-bold text-slate-900">{res.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {res.file_type?.toUpperCase() || 'PDF'} • Uploaded on {new Date(res.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {res.latest_score && (
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">{res.latest_score}/100</span>
                        <div className="text-[10px] text-slate-400">Score</div>
                      </div>
                    )}
                    <Link
                      to={`/resumes/${res.id}/report`}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 shadow-subtle flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-primary" />
                      <span>Report</span>
                    </Link>
                    <Link
                      to="/resumes/studio"
                      className="px-3 py-1.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover shadow-subtle"
                    >
                      Edit in Studio
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-3">No resumes uploaded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Job Matches Section */}
      {(activeTab === 'all' || activeTab === 'jobs') && (
        <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <span>Job Description Matches</span>
            </h2>
            <Link to="/job-matcher" className="text-xs font-semibold text-primary hover:underline">
              Match New JD →
            </Link>
          </div>

          <div className="space-y-3">
            {jobMatches && jobMatches.length > 0 ? (
              jobMatches.map((jm) => (
                <div
                  key={jm.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <h3 className="font-bold text-slate-900">{jm.job_title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {jm.company_name || 'Target Company'} • {new Date(jm.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-900 text-sm">{jm.match_score}% Match</span>
                    <Link
                      to="/job-matcher"
                      className="text-primary font-semibold hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-3">No job matches conducted yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
