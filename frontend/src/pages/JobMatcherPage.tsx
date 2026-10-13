import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Eye,
  Layers,
  HelpCircle
} from 'lucide-react';
import { api } from '../api/client';
import { Resume, JobMatch } from '../types';

export const JobMatcherPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [jobTitle, setJobTitle] = useState('Full Stack Software Engineer');
  const [companyName, setCompanyName] = useState('Tech Solutions Corp');
  const [jobText, setJobText] = useState(
    `We are seeking a Full Stack Software Engineer to build scalable microservices and intuitive web interfaces.\nRequirements:\n- Strong knowledge of Python (FastAPI/Django) and modern TypeScript (React/Next.js)\n- Experience with relational databases like PostgreSQL and in-memory caches like Redis\n- Familiarity with containerization (Docker) and CI/CD deployment pipelines\n- Understanding of RESTful API architecture, testing (pytest), and system design trade-offs\n- Solid communication skills and passion for collaborating in agile cross-functional teams.`
  );
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [isMatching, setIsMatching] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<JobMatch | null>(null);

  const { data: resumes } = useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: () => api.getResumes(),
  });

  const { data: pastMatches } = useQuery<JobMatch[]>({
    queryKey: ['jobMatches'],
    queryFn: () => api.getJobMatches(),
  });

  // Auto-select first resume
  React.useEffect(() => {
    if (resumes && resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  const handleRunMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId || !jobText.trim()) return;
    setIsMatching(true);
    try {
      const matchResult = await api.matchJob(selectedResumeId, jobTitle, companyName, jobText);
      setCurrentMatch(matchResult);
      queryClient.invalidateQueries({ queryKey: ['jobMatches'] });
    } catch (err) {
      console.error(err);
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Description Matcher</h1>
        <p className="text-xs text-slate-500 mt-1">
          Compare your resume against any job posting to detect keyword coverage, missing skills, and tailored interview prep questions.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card">
        <form onSubmit={handleRunMatch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Select Resume</label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {resumes?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Job Title</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              >
              </input>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Company (Optional)</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Google, Stripe, Startup"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Paste Job Description</label>
            <textarea
              rows={6}
              required
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste full job specification, required qualifications, and key responsibilities..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-mono leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isMatching || !selectedResumeId}
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-2 disabled:opacity-70"
            >
              {isMatching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Calculating Match Rubric...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Alignment Analysis</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Match Results Display */}
      {currentMatch && (
        <div className="space-y-6">
          {/* Hero Score Banner */}
          <div className="bg-surface border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Alignment Rubric Result</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {currentMatch.job_title} {currentMatch.company_name ? `at ${currentMatch.company_name}` : ''}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Keyword Coverage: <strong className="text-slate-800">{currentMatch.keyword_coverage}%</strong> • Scored on core skills, experience, and domain alignment.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-center min-w-[130px]">
                <div className="text-xs font-semibold text-primary">Match Score</div>
                <div className="text-4xl font-extrabold text-slate-900 mt-0.5">
                  {currentMatch.match_score}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Rubric Fit Index</div>
              </div>
            </div>
          </div>

          {/* Matched & Missing Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <h3 className="text-sm font-bold text-slate-900">
                  Matched Competencies ({currentMatch.matched_skills.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentMatch.matched_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card">
              <div className="flex items-center space-x-2 mb-3">
                <XCircle className="w-4 h-4 text-warning" />
                <h3 className="text-sm font-bold text-slate-900">
                  Target Competency Gaps ({currentMatch.missing_skills.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentMatch.missing_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium rounded-lg"
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Suggested Role-Specific Interview Questions */}
          <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card">
            <div className="flex items-center space-x-2 mb-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-slate-900">Role-Specific Interview Questions for this JD</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Anticipate questions recruiters and technical interviewers are most likely to ask based on this spec.
            </p>

            <div className="space-y-3">
              {currentMatch.suggested_interview_questions?.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-900">
                    <span>Q{idx + 1}: {item.question}</span>
                    <span className="text-[10px] bg-indigo-50 text-primary px-2 py-0.5 rounded border border-indigo-200">
                      {item.target_skill}
                    </span>
                  </div>
                  <p className="text-slate-500"><strong className="text-slate-700">Coaching Tip:</strong> {item.tips}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Historical Job Matches */}
      {pastMatches && pastMatches.length > 0 && !currentMatch && (
        <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Previous Job Matches</h3>
          <div className="space-y-3">
            {pastMatches.map((m) => (
              <div
                key={m.id}
                onClick={() => setCurrentMatch(m)}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-primary transition-all text-xs"
              >
                <div>
                  <h4 className="font-semibold text-slate-900">{m.job_title}</h4>
                  <p className="text-slate-500 text-[11px]">{m.company_name || 'Target Company'} • {new Date(m.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-slate-800 text-sm">{m.match_score}% Match</span>
                  <span className="text-primary font-semibold text-xs">View Report →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
