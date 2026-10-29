import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Sparkles, CheckCircle2, AlertCircle, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

interface NavbarProps {
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [aiStatus, setAiStatus] = useState<any>(null);

  useEffect(() => {
    api.getDiagnostics()
      .then((data) => setAiStatus(data))
      .catch(() => setAiStatus({ active_provider: 'local_heuristic' }));
  }, []);

  const getPageTitle = (pathname: string) => {
    if (pathname.includes('/dashboard')) return { title: 'Dashboard', desc: 'Placement preparation overview & progress' };
    if (pathname.includes('/resumes/analyze')) return { title: 'Resume Analyzer', desc: 'ATS scoring, gap analysis & rubric breakdown' };
    if (pathname.includes('/resumes/studio')) return { title: 'Resume Studio', desc: 'Live ATS resume builder & AI assistant' };
    if (pathname.includes('/job-matcher')) return { title: 'Job Matcher', desc: 'Align your resume with real job descriptions' };
    if (pathname.includes('/interviews/setup')) return { title: 'Interview Setup', desc: 'Configure role, difficulty & interview format' };
    if (pathname.includes('/interviews/live')) return { title: 'Mock Interview Session', desc: 'Interactive AI one-to-one interview' };
    if (pathname.includes('/interviews')) return { title: 'AI Mock Interviews', desc: 'Personalized practice interviews & evaluations' };
    if (pathname.includes('/roadmap')) return { title: 'Preparation Roadmap', desc: 'Actionable placement skill milestones' };
    if (pathname.includes('/history')) return { title: 'Activity History', desc: 'Past resume reports, interviews & matches' };
    if (pathname.includes('/settings')) return { title: 'Settings & Profile', desc: 'Manage your target roles and preferences' };
    return { title: 'Persona Hire', desc: 'Career Preparation Portal' };
  };

  const { title, desc } = getPageTitle(location.pathname);

  return (
    <header className="h-16 bg-surface border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500 hidden sm:block">{desc}</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* AI Provider Status Pill */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600 font-medium">
          <Cpu className="w-3.5 h-3.5 text-primary" />
          <span>
            Provider:{' '}
            <strong className="text-slate-800 capitalize">
              {aiStatus?.active_provider === 'groq'
                ? `Groq (${aiStatus?.groq_model?.split('/').pop()?.replace('-versatile', '') || 'LPU'})`
                : aiStatus?.active_provider === 'openrouter'
                ? 'OpenRouter'
                : 'Heuristic Engine'}
            </strong>
          </span>
          <span className="w-2 h-2 rounded-full bg-success"></span>
        </div>

        {/* Quick action: User profile pill */}
        <Link
          to="/settings"
          className="flex items-center space-x-2 pl-2 pr-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-full transition-colors"
        >
          <div className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
          </div>
          <span className="hidden md:inline">{user?.full_name?.split(' ')[0] || 'Profile'}</span>
        </Link>
      </div>
    </header>
  );
};
