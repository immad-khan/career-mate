"use client";

import React from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { ResumeData } from '@/types/resume';

/* ═══════════════ 1. Classic Professional ═══════════════ */
const ClassicProfessional: React.FC<{ data: ResumeData }> = ({ data }) => (
  <div className="p-8 font-serif text-gray-800">
    <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
      <h1 className="text-4xl font-bold uppercase tracking-wide">{data.personalInfo.fullName}</h1>
      <div className="mt-2 text-sm space-x-4">
        <span>{data.personalInfo.email}</span>
        <span>|</span>
        <span>{data.personalInfo.phone}</span>
        <span>|</span>
        <span>{data.personalInfo.location}</span>
      </div>
    </div>
    <div className="mb-6">
      <h2 className="text-xl font-bold uppercase border-b border-gray-400 mb-3">Summary</h2>
      <p className="text-sm leading-relaxed">{data.personalInfo.summary}</p>
    </div>
    <div className="mb-6">
      <h2 className="text-xl font-bold uppercase border-b border-gray-400 mb-3">Experience</h2>
      <div className="space-y-4">
        {data.experience.map(exp => (
          <div key={exp.id}>
            <div className="flex justify-between font-bold text-md"><span>{exp.jobTitle} - {exp.company}</span><span>{exp.startDate} - {exp.endDate}</span></div>
            <p className="text-sm mt-1">{exp.description}</p>
          </div>
        ))}
      </div>
    </div>
    <div className="mb-6">
      <h2 className="text-xl font-bold uppercase border-b border-gray-400 mb-3">Education</h2>
      <div className="space-y-2">
        {data.education.map(edu => (
          <div key={edu.id}>
            <div className="flex justify-between font-bold text-md"><span>{edu.institution}</span><span>{edu.startDate} - {edu.endDate}</span></div>
            <div className="text-sm italic">{edu.degree}</div>
          </div>
        ))}
      </div>
    </div>
    <div>
      <h2 className="text-xl font-bold uppercase border-b border-gray-400 mb-3">Skills</h2>
      <div className="text-sm">{data.skills.join(', ')}</div>
    </div>
  </div>
);

/* ═══════════════ 2. Modern Clean (Green) ═══════════════ */
const ModernClean: React.FC<{ data: ResumeData }> = ({ data }) => (
  <div className="flex h-full min-h-[800px] bg-white text-gray-800 font-sans">
    <div className="w-1/3 bg-emerald-50 p-6 border-r border-emerald-200">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-2">{data.personalInfo.fullName}</h1>
        <p className="text-emerald-600 font-medium">{data.experience[0]?.jobTitle || 'Professional'}</p>
      </div>
      <div className="mb-6 text-sm space-y-2 text-gray-600">
        <p>{data.personalInfo.email}</p><p>{data.personalInfo.phone}</p><p>{data.personalInfo.location}</p>
      </div>
      <div className="mb-6">
        <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, i) => (
             <span key={i} className="bg-white px-2 py-1 rounded shadow-sm text-xs text-gray-700 border border-emerald-200">{skill}</span>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">Education</h3>
        <div className="space-y-4">
          {data.education.map(edu => (
            <div key={edu.id} className="text-sm">
              <div className="font-bold">{edu.institution}</div>
              <div className="text-gray-600">{edu.degree}</div>
              <div className="text-xs text-gray-500 mt-1">{edu.startDate} - {edu.endDate}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="w-2/3 p-8">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-emerald-500 inline-block pb-1">Summary</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{data.personalInfo.summary}</p>
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-emerald-500 inline-block pb-1">Experience</h2>
        <div className="space-y-6">
          {data.experience.map(exp => (
            <div key={exp.id}>
              <div className="mb-1"><span className="font-bold text-gray-800">{exp.jobTitle}</span><span className="mx-2 text-gray-400">|</span><span className="text-emerald-600 font-medium">{exp.company}</span></div>
              <div className="text-xs text-gray-400 mb-2">{exp.startDate} - {exp.endDate}</div>
              <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════ 3. Compact Timeline (Indigo) ═══════════════ */
const CompactTimeline: React.FC<{ data: ResumeData }> = ({ data }) => (
  <div className="p-8 font-sans text-gray-800 bg-white min-h-[800px]">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-extrabold text-indigo-900">{data.personalInfo.fullName}</h1>
      <p className="text-indigo-500 font-medium mt-1">{data.experience[0]?.jobTitle || ''}</p>
      <div className="mt-2 text-xs text-gray-500 space-x-3">
        <span>{data.personalInfo.email}</span><span>•</span><span>{data.personalInfo.phone}</span><span>•</span><span>{data.personalInfo.location}</span>
      </div>
    </div>
    {data.personalInfo.summary && (
      <div className="mb-6 bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
        <p className="text-sm text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
      </div>
    )}
    <h2 className="text-lg font-bold text-indigo-800 mb-4 uppercase tracking-wider">Experience</h2>
    <div className="border-l-2 border-indigo-300 ml-4 pl-6 space-y-6 mb-8">
      {data.experience.map(exp => (
        <div key={exp.id} className="relative">
          <div className="absolute -left-[31px] top-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow"></div>
          <div className="flex justify-between items-baseline">
            <span className="font-bold text-indigo-900">{exp.jobTitle}</span>
            <span className="text-xs text-indigo-400 font-medium">{exp.startDate} – {exp.endDate}</span>
          </div>
          <p className="text-sm text-indigo-600 font-medium">{exp.company}</p>
          <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h2 className="text-lg font-bold text-indigo-800 mb-3 uppercase tracking-wider">Education</h2>
        {data.education.map(edu => (
          <div key={edu.id} className="mb-3">
            <div className="font-bold text-sm">{edu.institution}</div>
            <div className="text-sm text-gray-600">{edu.degree}</div>
            <div className="text-xs text-indigo-400">{edu.startDate} – {edu.endDate}</div>
          </div>
        ))}
      </div>
      <div>
        <h2 className="text-lg font-bold text-indigo-800 mb-3 uppercase tracking-wider">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, i) => (
            <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">{skill}</span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════ 4. Creative Header (Rose/Orange) ═══════════════ */
const CreativeHeader: React.FC<{ data: ResumeData }> = ({ data }) => (
  <div className="font-sans text-gray-800 bg-white min-h-[800px]">
    <div className="bg-gradient-to-r from-rose-500 to-orange-400 text-white p-8 pb-10">
      <h1 className="text-3xl font-extrabold">{data.personalInfo.fullName}</h1>
      <p className="text-rose-100 text-lg mt-1">{data.experience[0]?.jobTitle || 'Professional'}</p>
      <div className="mt-3 text-sm text-rose-100 space-x-3">
        <span>{data.personalInfo.email}</span><span>•</span><span>{data.personalInfo.phone}</span><span>•</span><span>{data.personalInfo.location}</span>
      </div>
    </div>
    <div className="flex px-8 -mt-4">
      <div className="w-3/5 pr-6">
        {data.personalInfo.summary && (
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-rose-400 mb-6">
            <p className="text-sm text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
          </div>
        )}
        <h2 className="text-lg font-bold text-rose-600 mb-4 uppercase tracking-wider">Experience</h2>
        <div className="space-y-5">
          {data.experience.map(exp => (
            <div key={exp.id} className="border-l-2 border-rose-200 pl-4">
              <div className="font-bold text-gray-900">{exp.jobTitle}</div>
              <div className="text-rose-500 text-sm font-medium">{exp.company} • {exp.startDate} – {exp.endDate}</div>
              <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-2/5 pl-6 border-l border-gray-200 pt-6">
        <h2 className="text-lg font-bold text-rose-600 mb-3 uppercase tracking-wider">Skills</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {data.skills.map((skill, i) => (
            <span key={i} className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">{skill}</span>
          ))}
        </div>
        <h2 className="text-lg font-bold text-rose-600 mb-3 uppercase tracking-wider">Education</h2>
        {data.education.map(edu => (
          <div key={edu.id} className="mb-3">
            <div className="font-bold text-sm">{edu.institution}</div>
            <div className="text-sm text-gray-600">{edu.degree}</div>
            <div className="text-xs text-rose-400">{edu.startDate} – {edu.endDate}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ═══════════════ 5. Executive Focus (Dark/Gold) ═══════════════ */
const ExecutiveFocus: React.FC<{ data: ResumeData }> = ({ data }) => (
  <div className="font-sans text-gray-800 bg-white min-h-[800px]">
    <div className="bg-slate-800 text-white p-8">
      <h1 className="text-3xl font-extrabold tracking-wide">{data.personalInfo.fullName}</h1>
      <p className="text-amber-400 font-medium mt-1">{data.experience[0]?.jobTitle || 'Professional'}</p>
      <div className="mt-3 text-sm text-slate-300 space-x-3">
        <span>{data.personalInfo.email}</span><span>•</span><span>{data.personalInfo.phone}</span><span>•</span><span>{data.personalInfo.location}</span>
      </div>
    </div>
    <div className="p-8">
      {data.personalInfo.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-2 pb-1 border-b-2 border-amber-400 inline-block">Executive Summary</h2>
          <p className="text-sm text-gray-700 leading-relaxed mt-2">{data.personalInfo.summary}</p>
        </div>
      )}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 pb-1 border-b-2 border-amber-400 inline-block">Professional Experience</h2>
        <div className="space-y-5">
          {data.experience.map(exp => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-900">{exp.jobTitle}</span>
                <span className="text-xs text-amber-600 font-semibold">{exp.startDate} – {exp.endDate}</span>
              </div>
              <p className="text-amber-600 text-sm font-medium">{exp.company}</p>
              <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-3 pb-1 border-b-2 border-amber-400 inline-block">Education</h2>
          {data.education.map(edu => (
            <div key={edu.id} className="mb-3">
              <div className="font-bold text-sm">{edu.institution}</div>
              <div className="text-sm text-gray-600">{edu.degree}</div>
              <div className="text-xs text-amber-600">{edu.startDate} – {edu.endDate}</div>
            </div>
          ))}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-3 pb-1 border-b-2 border-amber-400 inline-block">Core Competencies</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded text-xs font-medium">{skill}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════ 6. Minimal One-Page ═══════════════ */
const MinimalOnePage: React.FC<{ data: ResumeData }> = ({ data }) => (
  <div className="p-8 font-sans text-gray-800 bg-white min-h-[800px]">
    <div className="mb-4">
      <h1 className="text-3xl font-bold text-gray-900">{data.personalInfo.fullName}</h1>
      <div className="text-sm text-gray-500 mt-1 space-x-3">
        <span>{data.personalInfo.email}</span><span>•</span><span>{data.personalInfo.phone}</span><span>•</span><span>{data.personalInfo.location}</span>
      </div>
    </div>
    <hr className="border-gray-300 mb-4" />
    {data.personalInfo.summary && (
      <div className="mb-4">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Summary</h2>
        <p className="text-sm text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
      </div>
    )}
    <div className="mb-4">
      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Experience</h2>
      <div className="space-y-3">
        {data.experience.map(exp => (
          <div key={exp.id}>
            <div className="flex justify-between">
              <span className="font-semibold text-sm text-gray-900">{exp.jobTitle} — {exp.company}</span>
              <span className="text-xs text-gray-400">{exp.startDate} – {exp.endDate}</span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">{exp.description}</p>
          </div>
        ))}
      </div>
    </div>
    <div className="mb-4">
      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Education</h2>
      {data.education.map(edu => (
        <div key={edu.id} className="mb-2">
          <div className="flex justify-between">
            <span className="font-semibold text-sm">{edu.institution}</span>
            <span className="text-xs text-gray-400">{edu.startDate} – {edu.endDate}</span>
          </div>
          <div className="text-xs text-gray-600">{edu.degree}</div>
        </div>
      ))}
    </div>
    <div>
      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Skills</h2>
      <p className="text-sm text-gray-700">{data.skills.join(' · ')}</p>
    </div>
  </div>
);

/* ═══════════════ PREVIEW PAGE ═══════════════ */
const ResumePreview: React.FC = () => {
  const { resumeData, selectedTemplateId, setStep } = useResumeStore();

  const renderTemplate = () => {
    switch (selectedTemplateId) {
      case 'classic-professional': return <ClassicProfessional data={resumeData} />;
      case 'modern-clean': return <ModernClean data={resumeData} />;
      case 'compact-timeline': return <CompactTimeline data={resumeData} />;
      case 'creative-header': return <CreativeHeader data={resumeData} />;
      case 'executive-focus': return <ExecutiveFocus data={resumeData} />;
      case 'minimal-one-page': return <MinimalOnePage data={resumeData} />;
      default: return <ClassicProfessional data={resumeData} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 h-[calc(100vh-100px)] flex flex-col md:flex-row gap-8">
      
      {/* Preview Area */}
      <div className="flex-1 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Resume Preview</h2>
        <div id="resume-preview-container" className="w-full max-w-[21cm] bg-white shadow-2xl rounded-sm overflow-hidden min-h-[29.7cm] transform scale-75 origin-top md:scale-90 lg:scale-100 transition-transform">
           {renderTemplate()}
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center items-center gap-4 z-50">
          <button 
             onClick={() => setStep('INFO')}
             className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
             Edit Details
          </button>
          <button 
             onClick={() => setStep('TEMPLATE')}
             className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
             Change Template
          </button>
          <button 
             onClick={() => setStep('SUCCESS')}
             className="px-8 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 shadow-md transition-colors"
          >
             Continue &rarr;
          </button>
      </div>
    </div>
  );
};

export default ResumePreview;
