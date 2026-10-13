import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, GraduationCap, Briefcase, Check } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const OnboardingPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState('Student / Fresher');
  const [interviewCategories, setInterviewCategories] = useState<string[]>(['technical', 'project']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCategory = (cat: string) => {
    if (interviewCategories.includes(cat)) {
      setInterviewCategories(interviewCategories.filter((c) => c !== cat));
    } else {
      setInterviewCategories([...interviewCategories, cat]);
    }
  };

  const handleSave = async (skip = false) => {
    setIsSubmitting(true);
    try {
      if (!skip) {
        await api.updateProfile({
          college,
          degree,
          branch,
          graduation_year: parseInt(graduationYear) || 2026,
          target_role: targetRole,
          experience_level: experienceLevel,
          preferred_interview_categories: interviewCategories,
          onboarding_completed: true,
        });
      } else {
        await api.updateProfile({
          onboarding_completed: true,
        });
      }
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-primary flex items-center justify-center mx-auto shadow-sm mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Personalize Your Placement Path</h2>
          <p className="text-xs text-slate-500 mt-1">
            Help Persona Hire calibrate your resume benchmarks and mock interview questions
          </p>
        </div>

        <div className="bg-surface border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">College / University</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. National Institute of Technology"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Degree</label>
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="B.Tech">B.Tech / B.E.</option>
                  <option value="B.S.">B.S. Computer Science</option>
                  <option value="M.Tech">M.Tech / M.S.</option>
                  <option value="BCA/MCA">BCA / MCA</option>
                  <option value="Other">Other Degree</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Year</label>
                <select
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="2025">2025 (Final Year)</option>
                  <option value="2026">2026 (Pre-final Year)</option>
                  <option value="2027">2027 (Sophomore)</option>
                  <option value="2024">2024 (Recent Graduate)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Software Engineer">Software Engineer (Generalist)</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Frontend Engineer">Frontend Engineer (React / TypeScript)</option>
                <option value="Backend Engineer">Backend Engineer (Python / FastAPI / Java)</option>
                <option value="Data Engineer">Data Engineer & Analytics</option>
                <option value="DevOps & Cloud Engineer">DevOps & Cloud Infrastructure</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Preferred Mock Interview Topics</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'technical', label: 'Technical & CS Fundamentals' },
                  { id: 'project', label: 'Project Architecture' },
                  { id: 'behavioral', label: 'Behavioral & STAR' },
                  { id: 'dsa', label: 'DSA & Coding Logic' },
                  { id: 'system_design', label: 'System Design Basics' },
                  { id: 'hr', label: 'HR & Cultural Fit' },
                ].map((cat) => {
                  const selected = interviewCategories.includes(cat.id);
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`p-2.5 rounded-lg border text-xs font-medium text-left flex items-start justify-between transition-all ${
                        selected
                          ? 'bg-indigo-50 border-primary text-primary font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="leading-tight">{cat.label}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-primary ml-1 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSubmitting}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 py-2 px-3"
              >
                Skip for Now
              </button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-2"
              >
                <span>{isSubmitting ? 'Saving...' : 'Complete & Go to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
