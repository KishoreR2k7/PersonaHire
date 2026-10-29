import React from 'react';
import { StructuredResume } from '../../types';

export type ResumeTemplateType = 'modern' | 'classic' | 'executive' | 'minimal' | 'tech';
export type AccentColor = 'indigo' | 'emerald' | 'blue' | 'slate' | 'rose';

interface ResumePreviewProps {
  data: StructuredResume;
  template: ResumeTemplateType;
  accentColor?: AccentColor;
}

const colorMap: Record<AccentColor, { primary: string; bg: string; border: string; text: string; badge: string }> = {
  indigo: {
    primary: '#4F46E5',
    bg: 'bg-indigo-50',
    border: 'border-indigo-600',
    text: 'text-indigo-600',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  emerald: {
    primary: '#059669',
    bg: 'bg-emerald-50',
    border: 'border-emerald-600',
    text: 'text-emerald-700',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  blue: {
    primary: '#2563EB',
    bg: 'bg-blue-50',
    border: 'border-blue-600',
    text: 'text-blue-600',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  slate: {
    primary: '#334155',
    bg: 'bg-slate-100',
    border: 'border-slate-800',
    text: 'text-slate-800',
    badge: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  rose: {
    primary: '#E11D48',
    bg: 'bg-rose-50',
    border: 'border-rose-600',
    text: 'text-rose-600',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export const ResumeRenderer: React.FC<ResumePreviewProps> = ({
  data,
  template,
  accentColor = 'indigo',
}) => {
  const colors = colorMap[accentColor] || colorMap.indigo;

  // 1. MODERN TECH TEMPLATE
  if (template === 'modern') {
    return (
      <div className="font-sans text-slate-900 leading-relaxed text-[12.5px]">
        {/* Header */}
        <div className="border-b-2 pb-4 mb-4" style={{ borderColor: colors.primary }}>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
              {data.contact?.full_name || 'Candidate Name'}
            </h1>
            {data.contact?.location && (
              <span className="text-xs font-semibold text-slate-500">{data.contact.location}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-2">
            {data.contact?.email && (
              <span className="font-medium text-slate-700">{data.contact.email}</span>
            )}
            {data.contact?.phone && <span>• {data.contact.phone}</span>}
            {data.contact?.linkedin && (
              <span>• {data.contact.linkedin.replace('https://', '')}</span>
            )}
            {data.contact?.github && (
              <span>• {data.contact.github.replace('https://', '')}</span>
            )}
            {data.contact?.portfolio && (
              <span>• {data.contact.portfolio.replace('https://', '')}</span>
            )}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="mb-4">
            <h2 className={`text-xs font-black uppercase tracking-wider ${colors.text} flex items-center space-x-2 border-b border-slate-200 pb-1 mb-1.5`}>
              <span className="w-1.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: colors.primary }}></span>
              <span>Professional Summary</span>
            </h2>
            <p className="text-slate-700 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Technical Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="mb-4">
            <h2 className={`text-xs font-black uppercase tracking-wider ${colors.text} flex items-center space-x-2 border-b border-slate-200 pb-1 mb-2`}>
              <span className="w-1.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: colors.primary }}></span>
              <span>Technical Competencies</span>
            </h2>
            <div className="space-y-1.5">
              {data.skills.map((grp, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center">
                  <strong className="w-36 text-slate-900 font-bold flex-shrink-0 text-xs mb-0.5 sm:mb-0">
                    {grp.category}:
                  </strong>
                  <div className="flex flex-wrap gap-1">
                    {grp.items.map((item, iI) => (
                      <span
                        key={iI}
                        className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[11px] font-medium border border-slate-200/80"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {data.experience && data.experience.length > 0 && (
          <div className="mb-4">
            <h2 className={`text-xs font-black uppercase tracking-wider ${colors.text} flex items-center space-x-2 border-b border-slate-200 pb-1 mb-2`}>
              <span className="w-1.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: colors.primary }}></span>
              <span>Work Experience</span>
            </h2>
            <div className="space-y-3">
              {data.experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>
                      {exp.position} — <span className="font-semibold text-slate-700">{exp.company}</span>
                    </span>
                    <span className="text-slate-500 font-normal text-xs">{exp.start_date} – {exp.end_date}</span>
                  </div>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-700">
                    {exp.bullets?.map((b, bI) => (
                      <li key={bI} className="leading-relaxed">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className="mb-4">
            <h2 className={`text-xs font-black uppercase tracking-wider ${colors.text} flex items-center space-x-2 border-b border-slate-200 pb-1 mb-2`}>
              <span className="w-1.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: colors.primary }}></span>
              <span>Projects & Engineering Achievements</span>
            </h2>
            <div className="space-y-3">
              {data.projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>
                      {proj.title}
                      {proj.role && <span className="font-normal text-slate-500 text-xs"> | {proj.role}</span>}
                    </span>
                    {proj.tech_stack && (
                      <span className={`text-[11px] font-mono font-medium ${colors.text}`}>
                        [{proj.tech_stack.join(', ')}]
                      </span>
                    )}
                  </div>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-700">
                    {proj.bullets?.map((b, bI) => (
                      <li key={bI} className="leading-relaxed">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div className="mb-2">
            <h2 className={`text-xs font-black uppercase tracking-wider ${colors.text} flex items-center space-x-2 border-b border-slate-200 pb-1 mb-2`}>
              <span className="w-1.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: colors.primary }}></span>
              <span>Education</span>
            </h2>
            <div className="space-y-2">
              {data.education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{edu.institution}</span>
                    <p className="text-slate-600">{edu.degree} in {edu.field_of_study}</p>
                  </div>
                  <span className="text-slate-500 font-medium">{edu.start_date} – {edu.end_date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. CLASSIC IVY / HARVARD ATS TEMPLATE
  if (template === 'classic') {
    return (
      <div className="font-serif text-slate-950 leading-relaxed text-[12.5px]">
        {/* Centered Formal Header */}
        <div className="text-center pb-2 mb-3 border-b-2 border-slate-950">
          <h1 className="text-2xl font-bold tracking-widest uppercase">
            {data.contact?.full_name || 'Candidate Name'}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-x-2 text-xs text-slate-800 mt-1.5">
            {data.contact?.location && <span>{data.contact.location}</span>}
            {data.contact?.email && <span>• {data.contact.email}</span>}
            {data.contact?.phone && <span>• {data.contact.phone}</span>}
            {data.contact?.linkedin && (
              <span>• {data.contact.linkedin.replace('https://', '')}</span>
            )}
            {data.contact?.github && (
              <span>• {data.contact.github.replace('https://', '')}</span>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        {data.summary && (
          <div className="mb-3.5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-900 pb-0.5 mb-1 text-center">
              Professional Summary
            </h2>
            <p className="text-slate-800 text-justify text-xs leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Education First (Traditional Ivy League style) */}
        {data.education && data.education.length > 0 && (
          <div className="mb-3.5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-900 pb-0.5 mb-1.5 text-center">
              Education
            </h2>
            <div className="space-y-1.5">
              {data.education.map((edu, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <div>
                    <strong className="font-bold">{edu.institution}</strong>
                    <span className="italic block text-slate-800">{edu.degree} in {edu.field_of_study}</span>
                  </div>
                  <span className="text-slate-800 font-bold">{edu.start_date} – {edu.end_date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="mb-3.5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-900 pb-0.5 mb-1.5 text-center">
              Skills & Qualifications
            </h2>
            <div className="space-y-1 text-xs">
              {data.skills.map((grp, idx) => (
                <div key={idx} className="flex">
                  <span className="font-bold w-36 flex-shrink-0">{grp.category}:</span>
                  <span className="text-slate-800">{grp.items.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {data.experience && data.experience.length > 0 && (
          <div className="mb-3.5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-900 pb-0.5 mb-1.5 text-center">
              Professional Experience
            </h2>
            <div className="space-y-2.5">
              {data.experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs">
                    <span className="font-bold">{exp.company}</span>
                    <span className="font-semibold text-slate-800">{exp.start_date} – {exp.end_date}</span>
                  </div>
                  <div className="italic text-xs text-slate-800 mb-1">{exp.position}</div>
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-800">
                    {exp.bullets?.map((b, bI) => (
                      <li key={bI}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className="mb-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-900 pb-0.5 mb-1.5 text-center">
              Key Projects & Engineering
            </h2>
            <div className="space-y-2.5">
              {data.projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs">
                    <span className="font-bold">
                      {proj.title}
                      {proj.role && <span className="font-normal italic"> ({proj.role})</span>}
                    </span>
                    {proj.tech_stack && (
                      <span className="font-mono text-[11px] text-slate-700">[{proj.tech_stack.join(', ')}]</span>
                    )}
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-800 mt-0.5">
                    {proj.bullets?.map((b, bI) => (
                      <li key={bI}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. EXECUTIVE 2-COLUMN TEMPLATE
  if (template === 'executive') {
    return (
      <div className="font-sans text-slate-900 text-[12px] leading-relaxed">
        {/* Full-Width Header */}
        <div className="border-b-2 pb-4 mb-4" style={{ borderColor: colors.primary }}>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div>
              <h1 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
                {data.contact?.full_name || 'Candidate Name'}
              </h1>
              <p className={`text-xs font-bold uppercase tracking-wider ${colors.text} mt-0.5`}>
                Candidate Placement Profile
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              {data.contact?.email && <p>{data.contact.email}</p>}
              {data.contact?.phone && <p>{data.contact.phone}</p>}
              {data.contact?.location && <p>{data.contact.location}</p>}
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-12 gap-5 items-start">
          {/* Left Column (4 cols) */}
          <div className="col-span-12 sm:col-span-4 space-y-4 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
            {/* Online Links */}
            <div>
              <h3 className={`text-[11px] font-black uppercase tracking-wider ${colors.text} pb-1 border-b border-slate-200 mb-2`}>
                Profiles
              </h3>
              <div className="space-y-1 text-xs text-slate-700">
                {data.contact?.github && (
                  <p className="truncate">GitHub: <span className="font-mono text-[11px]">{data.contact.github.replace('https://', '')}</span></p>
                )}
                {data.contact?.linkedin && (
                  <p className="truncate">LinkedIn: <span className="font-mono text-[11px]">{data.contact.linkedin.replace('https://', '')}</span></p>
                )}
                {data.contact?.portfolio && (
                  <p className="truncate">Portfolio: <span className="font-mono text-[11px]">{data.contact.portfolio.replace('https://', '')}</span></p>
                )}
              </div>
            </div>

            {/* Technical Skills Stack */}
            {data.skills && data.skills.length > 0 && (
              <div>
                <h3 className={`text-[11px] font-black uppercase tracking-wider ${colors.text} pb-1 border-b border-slate-200 mb-2`}>
                  Core Skills
                </h3>
                <div className="space-y-2">
                  {data.skills.map((grp, idx) => (
                    <div key={idx}>
                      <span className="font-bold text-[11px] text-slate-800 block mb-1">{grp.category}</span>
                      <div className="flex flex-wrap gap-1">
                        {grp.items.map((item, iI) => (
                          <span
                            key={iI}
                            className="px-1.5 py-0.5 bg-white text-slate-800 text-[10.5px] rounded border border-slate-200 shadow-2xs font-medium"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
              <div>
                <h3 className={`text-[11px] font-black uppercase tracking-wider ${colors.text} pb-1 border-b border-slate-200 mb-2`}>
                  Education
                </h3>
                <div className="space-y-2 text-xs">
                  {data.education.map((edu, idx) => (
                    <div key={idx}>
                      <span className="font-bold text-slate-900 block">{edu.institution}</span>
                      <span className="text-slate-600 block text-[11px]">{edu.degree} in {edu.field_of_study}</span>
                      <span className="text-slate-400 text-[10px]">{edu.start_date} – {edu.end_date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (8 cols) */}
          <div className="col-span-12 sm:col-span-8 space-y-4">
            {/* Summary */}
            {data.summary && (
              <div>
                <h3 className={`text-[11px] font-black uppercase tracking-wider ${colors.text} pb-1 border-b border-slate-200 mb-1.5`}>
                  Executive Summary
                </h3>
                <p className="text-slate-700 text-xs leading-relaxed">{data.summary}</p>
              </div>
            )}

            {/* Experience */}
            {data.experience && data.experience.length > 0 && (
              <div>
                <h3 className={`text-[11px] font-black uppercase tracking-wider ${colors.text} pb-1 border-b border-slate-200 mb-2`}>
                  Work Experience
                </h3>
                <div className="space-y-3">
                  {data.experience.map((exp, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs">
                        <span>{exp.position} — <span className="font-semibold text-slate-700">{exp.company}</span></span>
                        <span className="text-slate-500 font-normal text-[11px]">{exp.start_date} – {exp.end_date}</span>
                      </div>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-slate-700">
                        {exp.bullets?.map((b, bI) => (
                          <li key={bI}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
              <div>
                <h3 className={`text-[11px] font-black uppercase tracking-wider ${colors.text} pb-1 border-b border-slate-200 mb-2`}>
                  Featured Projects
                </h3>
                <div className="space-y-3">
                  {data.projects.map((proj, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs">
                        <span>{proj.title}</span>
                        {proj.tech_stack && (
                          <span className={`text-[10.5px] font-mono ${colors.text}`}>[{proj.tech_stack.slice(0, 3).join(', ')}]</span>
                        )}
                      </div>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-slate-700">
                        {proj.bullets?.map((b, bI) => (
                          <li key={bI}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. MINIMALIST CLEAN TEMPLATE
  if (template === 'minimal') {
    return (
      <div className="font-sans text-slate-800 leading-relaxed text-[12px]">
        {/* Understated Header */}
        <div className="pb-3 mb-4 border-b border-slate-200">
          <h1 className="text-xl font-light tracking-wide text-slate-900 uppercase">
            {data.contact?.full_name || 'Candidate Name'}
          </h1>
          <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-1 font-light">
            {data.contact?.email && <span>{data.contact.email}</span>}
            {data.contact?.phone && <span>· {data.contact.phone}</span>}
            {data.contact?.location && <span>· {data.contact.location}</span>}
            {data.contact?.linkedin && (
              <span>· {data.contact.linkedin.replace('https://', '')}</span>
            )}
            {data.contact?.github && (
              <span>· {data.contact.github.replace('https://', '')}</span>
            )}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              About
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Technical Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Skills
            </h2>
            <div className="space-y-1 text-xs">
              {data.skills.map((grp, idx) => (
                <div key={idx} className="flex">
                  <span className="w-32 text-slate-500 flex-shrink-0 font-medium">{grp.category}</span>
                  <span className="text-slate-800">{grp.items.join('  ·  ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Experience
            </h2>
            <div className="space-y-3">
              {data.experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-900">{exp.position} at {exp.company}</span>
                    <span className="text-slate-400 text-[11px]">{exp.start_date} – {exp.end_date}</span>
                  </div>
                  <ul className="mt-1 space-y-0.5 text-xs text-slate-600 pl-3">
                    {exp.bullets?.map((b, bI) => (
                      <li key={bI} className="list-square">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Projects
            </h2>
            <div className="space-y-3">
              {data.projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-900">{proj.title}</span>
                    {proj.tech_stack && (
                      <span className="text-[11px] text-slate-400 font-mono">{proj.tech_stack.join(', ')}</span>
                    )}
                  </div>
                  <ul className="mt-1 space-y-0.5 text-xs text-slate-600 pl-3">
                    {proj.bullets?.map((b, bI) => (
                      <li key={bI} className="list-square">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Education
            </h2>
            <div className="space-y-1.5 text-xs">
              {data.education.map((edu, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{edu.degree} in {edu.field_of_study}, <span className="font-medium">{edu.institution}</span></span>
                  <span className="text-slate-400 text-[11px]">{edu.start_date} – {edu.end_date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 5. TECH / DEVELOPER TERMINAL TEMPLATE
  return (
    <div className="font-mono text-slate-900 leading-relaxed text-[12px]">
      {/* Terminal Header */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1 font-bold">
          <span className="text-emerald-600">$</span>
          <span>whoami --verbose</span>
        </div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
          &gt; {data.contact?.full_name || 'Candidate Name'}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-700 mt-2 font-mono">
          {data.contact?.email && <span>[email: {data.contact.email}]</span>}
          {data.contact?.phone && <span>[tel: {data.contact.phone}]</span>}
          {data.contact?.location && <span>[loc: {data.contact.location}]</span>}
          {data.contact?.github && (
            <span className="text-indigo-700 font-semibold">[gh: {data.contact.github.replace('https://', '')}]</span>
          )}
          {data.contact?.linkedin && (
            <span className="text-blue-700 font-semibold">[in: {data.contact.linkedin.replace('https://', '')}]</span>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-4">
          <h2 className="text-xs font-black uppercase text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
            // 01. SUMMARY
          </h2>
          <p className="text-slate-700 text-xs font-sans leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Tech Stack */}
      {data.skills && data.skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-black uppercase text-slate-900 border-b border-slate-300 pb-0.5 mb-2">
            // 02. STACK & SKILLS
          </h2>
          <div className="space-y-1.5 text-xs">
            {data.skills.map((grp, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-bold text-slate-900 w-36 flex-shrink-0 text-[11px]">
                  {grp.category}:
                </span>
                <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                  {grp.items.map((item, iI) => (
                    <span
                      key={iI}
                      className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-black uppercase text-slate-900 border-b border-slate-300 pb-0.5 mb-2">
            // 03. EXPERIENCE
          </h2>
          <div className="space-y-3 font-sans">
            {data.experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs font-mono">
                  <span>{exp.position} @ {exp.company}</span>
                  <span className="text-slate-500 font-normal text-[11px]">{exp.start_date} – {exp.end_date}</span>
                </div>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-slate-700 font-sans">
                  {exp.bullets?.map((b, bI) => (
                    <li key={bI}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-black uppercase text-slate-900 border-b border-slate-300 pb-0.5 mb-2">
            // 04. PROJECTS & REPOS
          </h2>
          <div className="space-y-3 font-sans">
            {data.projects.map((proj, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs font-mono">
                  <span>&gt; {proj.title}</span>
                  {proj.tech_stack && (
                    <span className="text-[11px] text-emerald-700 font-mono">[{proj.tech_stack.join(', ')}]</span>
                  )}
                </div>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-slate-700 font-sans">
                  {proj.bullets?.map((b, bI) => (
                    <li key={bI}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div>
          <h2 className="text-xs font-black uppercase text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
            // 05. EDUCATION
          </h2>
          <div className="space-y-1.5 text-xs font-mono">
            {data.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between">
                <div>
                  <span className="font-bold text-slate-900">{edu.institution}</span>
                  <p className="text-slate-600 text-[11px] font-sans">{edu.degree} in {edu.field_of_study}</p>
                </div>
                <span className="text-slate-500 text-[11px]">{edu.start_date} – {edu.end_date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
