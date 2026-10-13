import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  FileCheck,
  FileEdit,
  MessagesSquare,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemoStart = async () => {
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-900 flex flex-col">
      {/* Top Navigation */}
      <nav className="h-18 bg-surface border-b border-slate-200 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">Persona Hire</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-primary rounded-full">
              Placement Copilot
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
          <a href="#security" className="hover:text-primary transition-colors">Privacy & Security</a>
        </div>

        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm transition-all"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <button
                onClick={handleDemoStart}
                className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-primary bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Instant Demo</span>
              </button>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm transition-all flex items-center space-x-1"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 lg:px-12 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-semibold text-primary mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Career Tech for University Students</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
          Your potential. <br />
          <span className="text-primary">Your next opportunity.</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Assess your resume with explainable ATS rubrics, craft impact-driven bullet points, align with real job descriptions, and practice personalized AI mock interviews.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3.5 text-base font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <span>Start Placement Prep Free</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <button
            onClick={handleDemoStart}
            className="w-full sm:w-auto px-6 py-3.5 text-base font-semibold text-slate-700 bg-surface hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Explore Demo Experience</span>
          </button>
        </div>

        {/* Concept Preview UI Mockup Card */}
        <div className="bg-surface border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card text-left max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-primary">Overview</span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">Build your career, one step at a time.</h2>
              <p className="text-xs text-slate-500">Your next placement starts with knowing where you stand.</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold">
                ● Live Readiness Mode
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-slate-200">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-semibold text-slate-500">Resume score</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">78<span className="text-base font-medium text-slate-400">/100</span></div>
              <div className="text-[11px] text-slate-500 mt-1">Explainable rubric score</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-semibold text-slate-500">Interviews completed</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">04</div>
              <div className="text-[11px] text-slate-500 mt-1">AI coaching sessions</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-semibold text-slate-500">Placement Readiness</div>
              <div className="text-3xl font-extrabold text-primary mt-1">82%</div>
              <div className="text-[11px] text-slate-500 mt-1">Top quartile student tier</div>
            </div>
          </div>

          <div className="pt-6">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Your Next Best Action</span>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Improve your project descriptions</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Highlight your technical decisions, measurable results, and the tools you used using the XYZ formula.
                </p>
              </div>
              <Link
                to="/resumes/studio"
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover whitespace-nowrap self-start sm:self-auto shadow-sm"
              >
                Refine in Studio →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 bg-surface border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Core Modules</h2>
            <p className="text-3xl font-bold text-slate-900 mt-1">Built specifically for campus placement success</p>
            <p className="text-sm text-slate-500 mt-2">
              No generic chatbot conversations. Persona Hire brings deep structure to each step of your career preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-background hover:border-indigo-300 transition-all shadow-subtle group">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. AI Resume Analyzer</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Upload PDF or DOCX resumes. Text extraction with PyMuPDF and fallback VLM detection.
                Receive an explainable 0–100 rubric score across 6 weighted dimensions, identify missing skills, and get concrete rewrites for weak bullets.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-500">
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-success mr-2 flex-shrink-0" /> Explainable category-level scoring</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-success mr-2 flex-shrink-0" /> STAR & Google XYZ bullet rewrite recommendations</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-success mr-2 flex-shrink-0" /> ATS readability & formatting verification</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-background hover:border-indigo-300 transition-all shadow-subtle group">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <FileEdit className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. AI Resume Studio</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                An integrated resume builder with side-by-side live preview. Reorder sections, refine bullet points with AI assistance, optimize for ATS keyword density, and export professional PDFs.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-500">
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-success mr-2 flex-shrink-0" /> Interactive live side-by-side editing</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-success mr-2 flex-shrink-0" /> One-click AI action verb and impact rewrites</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-success mr-2 flex-shrink-0" /> Clean typography & paginated PDF export</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-background hover:border-indigo-300 transition-all shadow-subtle group">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <MessagesSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. One-to-One AI Mock Interview</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Realistic multi-turn interviews. The AI asks questions tailored to your actual resume projects and target role. Answer via text or speech, receive instant coaching, and tackle follow-ups.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-500">
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-success mr-2 flex-shrink-0" /> In-browser speech recognition and audio response</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-success mr-2 flex-shrink-0" /> Multi-turn follow-ups probing technical depth</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-success mr-2 flex-shrink-0" /> Post-interview STAR framework evaluation report</li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-background hover:border-indigo-300 transition-all shadow-subtle group">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">4. Job Description Matcher</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Paste any live job specification. Uncover matched vs missing skills, keyword coverage, tailored resume advice, and company-specific interview prep questions.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-500">
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-success mr-2 flex-shrink-0" /> Required vs preferred qualifications breakdown</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-success mr-2 flex-shrink-0" /> Tailored resume bullet point suggestions</li>
                <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-success mr-2 flex-shrink-0" /> Custom interview prep questions generated per role</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 max-w-6xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Workflow</h2>
          <p className="text-3xl font-bold text-slate-900 mt-1">Four simple steps to campus placement readiness</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Upload & Parse', desc: 'Drop your PDF/DOCX resume. Text is extracted safely and validated.' },
            { step: '02', title: 'Scoring & Feedback', desc: 'Get transparent rubric scores out of 100 with actionable bullet rewrites.' },
            { step: '03', title: 'Refine in Studio', desc: 'Polish your resume with ATS-friendly layouts and export a crisp PDF.' },
            { step: '04', title: 'Practice Mock Interview', desc: 'Engage in a multi-turn voice/text interview and review detailed coaching.' },
          ].map((item) => (
            <div key={item.step} className="p-6 rounded-2xl bg-surface border border-slate-200">
              <span className="text-2xl font-extrabold text-primary">{item.step}</span>
              <h3 className="text-base font-bold text-slate-900 mt-2">{item.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy and Security Section */}
      <section id="security" className="py-16 bg-surface border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-primary flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Student Privacy & Data Protection First</h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto mt-2 leading-relaxed">
            Your resume content and credentials stay secure. API keys are strictly maintained on the backend, 
            audio captured during mock interviews is processed transiently with explicit microphone consent, and no personal data is ever sold.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-surface border-t border-slate-200 py-8 px-6 lg:px-12 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-bold text-slate-800">Persona Hire</span>
            <span>— AI-Powered Placement Preparation Portal</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-600">
            <a href="#features" className="hover:text-primary">Features</a>
            <a href="#security" className="hover:text-primary">Privacy</a>
            <Link to="/login" className="hover:text-primary">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
