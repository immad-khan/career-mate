"use client";

import React from 'react';
import { useResumeStore } from '@/store/resumeStore';
import ResumePreview from './ResumePreview'; // Reusing the preview logic component, but we will strip the controls in a real refactor. 
// For this snippet, I'll manually recreate the structure to show the split view exactly as requested.
import { ResumeData } from '@/types/resume';

const ModernCleanView: React.FC<{ data: ResumeData }> = ({ data }) => (
    <div className="flex h-full bg-white text-gray-800 font-sans text-xs">
      <div className="w-1/3 bg-gray-100 p-4 border-r border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 mb-1">{data.personalInfo.fullName}</h1>
        <p className="text-green-600 mb-4">{data.experience[0]?.jobTitle}</p>
        <div className="space-y-1 text-gray-600 mb-4">
          <p>{data.personalInfo.email}</p>
          <p>{data.personalInfo.phone}</p>
          <p>{data.personalInfo.location}</p>
        </div>
        <div className="mb-4">
            <h4 className="font-bold text-gray-400 mb-2">SKILLS</h4>
            <div className="flex flex-wrap gap-1">
                {data.skills.map(s => <span key={s} className="bg-white px-1 rounded">{s}</span>)}
            </div>
        </div>
      </div>
      <div className="w-2/3 p-4">
          <h2 className="font-bold border-b border-green-500 mb-2">Summary</h2>
          <p className="mb-4">{data.personalInfo.summary}</p>
          <h2 className="font-bold border-b border-green-500 mb-2">Experience</h2>
          {data.experience.map(e => (
              <div key={e.id} className="mb-3">
                  <div className="font-bold">{e.jobTitle}</div>
                  <div className="text-green-600">{e.company}</div>
                  <p className="mt-1">{e.description}</p>
              </div>
          ))}
      </div>
    </div>
);

const ReviewResume: React.FC = () => {
    const { resumeData, updatePersonalInfo, updateExperience, setStep } = useResumeStore();

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Review Your Resume</h1>
                <p className="text-gray-500">Make final edits before downloading</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 h-[700px]">
                {/* Left: Preview */}
                <div id="resume-preview-container" className="flex-1 bg-gray-200 p-4 rounded-lg overflow-hidden flex items-center justify-center">
                     <div className="bg-white shadow-lg w-[300px] h-[420px] lg:w-[400px] lg:h-[560px] overflow-hidden rounded text-[10px]">
                         <ModernCleanView data={resumeData} />
                     </div>
                </div>

                {/* Right: Edit Sections */}
                <div className="w-full lg:w-96 bg-white border border-gray-200 rounded-lg p-4 overflow-y-auto">
                    
                    {/* Personal Info Edit Block */}
                    <div className="mb-6 border-b border-gray-100 pb-6">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold">Personal Information</h3>
                            <span className="text-xs text-gray-400">Update your basic details</span>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Full Name</label>
                                <input 
                                    value={resumeData.personalInfo.fullName} 
                                    onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
                                    className="w-full p-2 border border-gray-200 rounded text-sm mt-1" 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Role / Title</label>
                                <input 
                                    // Assuming role is derived or part of summary, using jobTitle of first experience as proxy for this UI
                                    className="w-full p-2 border border-gray-200 rounded text-sm mt-1" 
                                    placeholder="Product Manager"
                                />
                            </div>
                            <button className="w-full py-1.5 bg-green-500 text-white text-sm font-medium rounded mt-2 hover:bg-green-600">
                                Save changes
                            </button>
                        </div>
                    </div>

                     {/* Summary Edit Block */}
                     <div className="mb-6 border-b border-gray-100 pb-6">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold">Summary</h3>
                            <span className="text-xs text-gray-400">Highlight your experience</span>
                        </div>
                        <textarea 
                            value={resumeData.personalInfo.summary}
                            onChange={(e) => updatePersonalInfo({ summary: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded text-sm h-24 resize-none"
                        />
                         <button className="w-full py-1.5 bg-green-500 text-white text-sm font-medium rounded mt-2 hover:bg-green-600">
                                Save changes
                        </button>
                    </div>

                    {/* Experience Edit Block */}
                    <div>
                         <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold">Experience</h3>
                            <span className="text-xs text-gray-400">Latest roles first</span>
                        </div>
                        {resumeData.experience.slice(0, 1).map(exp => (
                             <div key={exp.id} className="space-y-3">
                                <div className="p-2 bg-gray-50 rounded text-sm font-medium border border-gray-200">
                                    {exp.jobTitle}, {exp.company}
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Key achievements</label>
                                    <textarea 
                                        value={exp.description}
                                        onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                                        className="w-full p-2 border border-gray-200 rounded text-sm h-24 resize-none mt-1"
                                    />
                                </div>
                                <button className="w-full py-1.5 bg-green-500 text-white text-sm font-medium rounded mt-2 hover:bg-green-600">
                                    Save changes
                                </button>
                             </div>
                        ))}
                    </div>

                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button 
                    onClick={() => setStep('SUCCESS')}
                    className="px-6 py-2 bg-green-500 text-white rounded-md font-semibold hover:bg-green-600"
                >
                    Continue to Download
                </button>
            </div>
        </div>
    );
};

export default ReviewResume;