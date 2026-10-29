import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileEdit,
  Download,
  Save,
  Plus,
  Trash2,
  Sparkles,
  Check,
  Eye,
  RefreshCw,
  Printer,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink
} from 'lucide-react';
import { api } from '../api/client';
import { Resume, StructuredResume } from '../types';
import { ResumeRenderer, ResumeTemplateType, AccentColor } from '../components/resume/ResumeTemplates';

export const ResumeStudioPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: resumes, isLoading } = useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: () => api.getResumes(),
  });

  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<StructuredResume | null>(null);
  const [template, setTemplate] = useState<ResumeTemplateType>('modern');
  const [accentColor, setAccentColor] = useState<AccentColor>('indigo');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('All changes saved');

  // AI Rewrite Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [activeBulletText, setActiveBulletText] = useState('');
  const [bulletContext, setBulletContext] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiRewriteResult, setAiRewriteResult] = useState<any>(null);
  const [onApplyAiRewrite, setOnApplyAiRewrite] = useState<((text: string) => void) | null>(null);

  // Set active resume once loaded
  useEffect(() => {
    if (resumes && resumes.length > 0 && !activeResumeId) {
      setActiveResumeId(resumes[0].id);
      setResumeData(resumes[0].structured_data);
    }
  }, [resumes, activeResumeId]);

  const handleResumeSelect = (id: string) => {
    setActiveResumeId(id);
    const found = resumes?.find((r) => r.id === id);
    if (found) {
      setResumeData(found.structured_data);
    }
  };

  const handleCreateNewResume = async () => {
    try {
      const created = await api.createBlankResume('New Software Engineer Resume');
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setActiveResumeId(created.id);
      setResumeData(created.structured_data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!activeResumeId || !resumeData) return;
    setIsSaving(true);
    setSaveStatus('Saving changes...');
    try {
      await api.updateResume(activeResumeId, { structured_data: resumeData });
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setSaveStatus('Saved to cloud');
      setTimeout(() => setSaveStatus('All changes saved'), 3000);
    } catch (err) {
      setSaveStatus('Error saving');
    } finally {
      setIsSaving(false);
    }
  };

  // AI Bullet Assistant Trigger
  const openAiRewriteModal = (text: string, context: string, onApply: (improved: string) => void) => {
    setActiveBulletText(text);
    setBulletContext(context);
    setAiRewriteResult(null);
    setOnApplyAiRewrite(() => onApply);
    setAiModalOpen(true);
  };

  const executeAiRewrite = async () => {
    if (!activeBulletText.trim()) return;
    setIsGeneratingAi(true);
    try {
      const res = await api.rewriteBullet(activeBulletText, bulletContext, 'Software Engineer');
      setAiRewriteResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  if (isLoading || !resumeData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500 mt-3">Loading Resume Studio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <select
            value={activeResumeId || ''}
            onChange={(e) => handleResumeSelect(e.target.value)}
            className="text-sm font-semibold text-slate-900 bg-surface border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {resumes?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
          <button
            onClick={handleCreateNewResume}
            className="p-1.5 text-xs text-primary bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Resume</span>
          </button>
          <span className="text-xs text-slate-400 font-medium">{saveStatus}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Template Switcher */}
          <div className="flex items-center flex-wrap gap-1.5">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setTemplate('modern')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  template === 'modern' ? 'bg-white text-primary shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
                title="Silicon Valley Modern Tech Standard"
              >
                Modern
              </button>
              <button
                type="button"
                onClick={() => setTemplate('classic')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  template === 'classic' ? 'bg-white text-primary shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
                title="Harvard / Ivy League Traditional ATS Format"
              >
                Classic Ivy
              </button>
              <button
                type="button"
                onClick={() => setTemplate('executive')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  template === 'executive' ? 'bg-white text-primary shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
                title="Executive Two-Column Layout"
              >
                Executive 2-Col
              </button>
              <button
                type="button"
                onClick={() => setTemplate('minimal')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  template === 'minimal' ? 'bg-white text-primary shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
                title="Scandinavian Minimalist"
              >
                Minimal
              </button>
              <button
                type="button"
                onClick={() => setTemplate('tech')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  template === 'tech' ? 'bg-white text-primary shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
                title="Developer Monospace Tech Stack"
              >
                Developer
              </button>
            </div>

            {/* Accent Color Palette */}
            {(template === 'modern' || template === 'executive' || template === 'tech') && (
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
                {[
                  { id: 'indigo', bg: 'bg-indigo-600' },
                  { id: 'emerald', bg: 'bg-emerald-600' },
                  { id: 'blue', bg: 'bg-blue-600' },
                  { id: 'slate', bg: 'bg-slate-800' },
                  { id: 'rose', bg: 'bg-rose-600' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setAccentColor(c.id as AccentColor)}
                    className={`w-4 h-4 rounded-full ${c.bg} transition-transform ${
                      accentColor === c.id ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={`Accent: ${c.id}`}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-subtle transition-all flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5 text-primary" />
            <span>Save</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Editor & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: Structured Form Editor */}
        <div className="space-y-6">
          {/* Section: Contact Details */}
          <div className="bg-surface border border-slate-200 rounded-2xl p-5 shadow-card">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <span>Contact Information</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-600 font-semibold mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={resumeData.contact?.full_name || ''}
                  onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      contact: { ...resumeData.contact, full_name: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold mb-1 block">Email</label>
                <input
                  type="email"
                  value={resumeData.contact?.email || ''}
                  onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      contact: { ...resumeData.contact, email: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold mb-1 block">Phone</label>
                <input
                  type="text"
                  value={resumeData.contact?.phone || ''}
                  onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      contact: { ...resumeData.contact, phone: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold mb-1 block">LinkedIn Profile URL</label>
                <input
                  type="text"
                  value={resumeData.contact?.linkedin || ''}
                  onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      contact: { ...resumeData.contact, linkedin: e.target.value },
                    })
                  }
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold mb-1 block">GitHub Profile URL</label>
                <input
                  type="text"
                  value={resumeData.contact?.github || ''}
                  onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      contact: { ...resumeData.contact, github: e.target.value },
                    })
                  }
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold mb-1 block">Location / City</label>
                <input
                  type="text"
                  value={resumeData.contact?.location || ''}
                  onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      contact: { ...resumeData.contact, location: e.target.value },
                    })
                  }
                  placeholder="e.g. Bengaluru, India"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Section: Professional Summary */}
          <div className="bg-surface border border-slate-200 rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900">Professional Summary</h2>
              <button
                type="button"
                onClick={() =>
                  openAiRewriteModal(
                    resumeData.summary || '',
                    'Professional Summary',
                    (improved) => setResumeData({ ...resumeData, summary: improved })
                  )
                }
                className="text-xs text-primary font-semibold hover:underline flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Rewrite</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={resumeData.summary || ''}
              onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
              placeholder="Concise 2-3 sentence career summary focusing on technical domain and results..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Section: Projects */}
          <div className="bg-surface border border-slate-200 rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Key Projects</h2>
              <button
                onClick={() => {
                  const newProj = {
                    id: `proj-${Date.now()}`,
                    title: 'New Featured Project',
                    description: 'Architecture & technical description',
                    role: 'Lead Developer',
                    bullets: ['Engineered scalable backend service using FastAPI.'],
                    tech_stack: ['Python', 'React', 'FastAPI'],
                  };
                  setResumeData({
                    ...resumeData,
                    projects: [...(resumeData.projects || []), newProj],
                  });
                }}
                className="text-xs text-primary font-semibold hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            <div className="space-y-4">
              {resumeData.projects?.map((proj, pIdx) => (
                <div key={proj.id || pIdx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => {
                        const copy = [...resumeData.projects];
                        copy[pIdx].title = e.target.value;
                        setResumeData({ ...resumeData, projects: copy });
                      }}
                      className="font-semibold text-xs text-slate-900 bg-white border border-slate-200 px-2 py-1 rounded w-3/4"
                    />
                    <button
                      onClick={() => {
                        const copy = resumeData.projects.filter((_, i) => i !== pIdx);
                        setResumeData({ ...resumeData, projects: copy });
                      }}
                      className="text-slate-400 hover:text-danger p-1"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500">Bullet Points</label>
                    {proj.bullets?.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={b}
                          onChange={(e) => {
                            const copy = [...resumeData.projects];
                            copy[pIdx].bullets[bIdx] = e.target.value;
                            setResumeData({ ...resumeData, projects: copy });
                          }}
                          className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            openAiRewriteModal(b, proj.title, (improved) => {
                              const copy = [...resumeData.projects];
                              copy[pIdx].bullets[bIdx] = improved;
                              setResumeData({ ...resumeData, projects: copy });
                            })
                          }
                          className="p-1 text-primary hover:bg-indigo-50 rounded"
                          title="Enhance with AI"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Technical Skills */}
          <div className="bg-surface border border-slate-200 rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Technical Skills</h2>
              <button
                onClick={() => {
                  const newSkill = { category: 'Tools & Technologies', items: ['Docker', 'Git'] };
                  setResumeData({
                    ...resumeData,
                    skills: [...(resumeData.skills || []), newSkill],
                  });
                }}
                className="text-xs text-primary font-semibold hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Group</span>
              </button>
            </div>

            <div className="space-y-3">
              {resumeData.skills?.map((sk, sIdx) => (
                <div key={sIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={sk.category}
                      onChange={(e) => {
                        const copy = [...resumeData.skills];
                        copy[sIdx].category = e.target.value;
                        setResumeData({ ...resumeData, skills: copy });
                      }}
                      className="font-semibold text-xs text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded"
                    />
                    <button
                      onClick={() => {
                        const copy = resumeData.skills.filter((_, i) => i !== sIdx);
                        setResumeData({ ...resumeData, skills: copy });
                      }}
                      className="text-slate-400 hover:text-danger p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={sk.items.join(', ')}
                    onChange={(e) => {
                      const copy = [...resumeData.skills];
                      copy[sIdx].items = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                      setResumeData({ ...resumeData, skills: copy });
                    }}
                    placeholder="Comma-separated skills (e.g. Python, TypeScript, Docker)"
                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live ATS Resume Preview (Printable) */}
        <div className="sticky top-20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span>Live ATS Resume Preview</span>
            </span>
            <span className="text-[11px] text-slate-500">Matches exported document 1:1</span>
          </div>

          <div
            id="printable-resume"
            className="bg-white border border-slate-300 rounded-xl p-8 shadow-card min-h-[750px] transition-all"
          >
            <ResumeRenderer
              data={resumeData}
              template={template}
              accentColor={accentColor}
            />
          </div>
        </div>
      </div>

      {/* AI Rewrite Assistant Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-slate-900">AI Bullet Enhancer</h3>
              </div>
              <button onClick={() => setAiModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Current Bullet Point:</label>
              <textarea
                rows={2}
                value={activeBulletText}
                onChange={(e) => setActiveBulletText(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={executeAiRewrite}
                disabled={isGeneratingAi}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-70"
              >
                {isGeneratingAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Optimizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate XYZ Rewrite</span>
                  </>
                )}
              </button>
            </div>

            {aiRewriteResult && (
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase">Suggested Rewrite</span>
                  <p className="text-xs font-semibold text-slate-900 mt-0.5">
                    {aiRewriteResult.suggested_rewrite}
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-indigo-100">
                  <p><strong>Action Verb:</strong> {aiRewriteResult.action_verb_used}</p>
                  <p><strong>Rationale:</strong> {aiRewriteResult.rationale}</p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (onApplyAiRewrite) {
                        onApplyAiRewrite(aiRewriteResult.suggested_rewrite);
                      }
                      setAiModalOpen(false);
                    }}
                    className="px-4 py-1.5 bg-success hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept & Apply</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
