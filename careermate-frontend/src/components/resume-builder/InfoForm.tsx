"use client";

import React, { useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { Plus, Trash2, X } from 'lucide-react';

const RequiredLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required = false }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const InfoForm: React.FC = () => {
  const { 
    resumeData, 
    updatePersonalInfo, 
    setStep, 
    addEducation, 
    updateEducation, 
    removeEducation,
    addExperience,
    updateExperience,
    removeExperience,
    setSkills 
  } = useResumeStore();

  const [newSkill, setNewSkill] = useState('');
  const [showMissingModal, setShowMissingModal] = useState(false);

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      setSkills([...resumeData.skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(resumeData.skills.filter(skill => skill !== skillToRemove));
  };

  const isFormValid = () => {
    return resumeData.personalInfo.fullName && resumeData.personalInfo.email;
  };

  const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors";
  const dateInputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors date-input-green";

  const getMissingFields = () => {
    const missing: string[] = [];
    if (!resumeData.personalInfo.fullName.trim()) missing.push('Full Name');
    if (!resumeData.personalInfo.email.trim()) missing.push('Email');
    return missing;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-sm rounded-xl border border-green-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enter Your Information</h1>
        <p className="text-gray-500">Fields marked with <span className="text-red-500">*</span> are required</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Personal Information */}
        <div className="p-6 border border-green-100 rounded-lg bg-green-50/30">
          <h2 className="text-lg font-semibold mb-4 text-green-800">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <RequiredLabel required>Full Name</RequiredLabel>
              <input 
                type="text" 
                className={inputClass}
                placeholder="e.g., Alex Johnson"
                value={resumeData.personalInfo.fullName}
                onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
              />
            </div>
            <div>
              <RequiredLabel required>Email</RequiredLabel>
              <input 
                type="email" 
                className={inputClass}
                placeholder="e.g., alex.johnson@email.com"
                value={resumeData.personalInfo.email}
                onChange={(e) => updatePersonalInfo({ email: e.target.value })}
              />
            </div>
            <div>
              <RequiredLabel>Phone</RequiredLabel>
              <input 
                type="tel" 
                className={inputClass}
                placeholder="e.g., +1 555 123 4567"
                value={resumeData.personalInfo.phone}
                onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
              />
            </div>
            <div>
              <RequiredLabel>Location</RequiredLabel>
              <input 
                type="text" 
                className={inputClass}
                placeholder="City, Country"
                value={resumeData.personalInfo.location}
                onChange={(e) => updatePersonalInfo({ location: e.target.value })}
              />
            </div>
            <div>
              <RequiredLabel>Professional Summary</RequiredLabel>
              <textarea 
                className={`${inputClass} h-32 resize-none`}
                placeholder="Short one or two line overview of your experience and goals"
                value={resumeData.personalInfo.summary}
                onChange={(e) => updatePersonalInfo({ summary: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="p-6 border border-green-100 rounded-lg bg-green-50/30">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-green-800">Education</h2>
            <button onClick={addEducation} className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center bg-green-100 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors">
              <Plus size={16} className="mr-1" /> Add
            </button>
          </div>
          <div className="space-y-6">
            {resumeData.education.map((edu, index) => (
              <div key={edu.id} className="relative pb-6 border-b border-green-100 last:border-0 last:pb-0">
                {index > 0 && (
                  <button 
                    onClick={() => removeEducation(edu.id)}
                    className="absolute top-0 right-0 text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <div className="space-y-4">
                  <div>
                    <RequiredLabel required>Institution</RequiredLabel>
                    <input 
                      type="text" 
                      className={inputClass}
                      placeholder="e.g., University of Example"
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                    />
                  </div>
                  <div>
                    <RequiredLabel required>Degree</RequiredLabel>
                    <input 
                      type="text" 
                      className={inputClass}
                      placeholder="e.g., B.Sc. in Computer Science"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <RequiredLabel required>Start Date</RequiredLabel>
                      <input 
                        type="month" 
                        className={dateInputClass}
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <RequiredLabel required>End Date</RequiredLabel>
                      <input 
                        type="month" 
                        className={dateInputClass}
                        value={edu.endDate}
                        onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="p-6 border border-green-100 rounded-lg bg-green-50/30">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-green-800">Experience</h2>
            <button onClick={addExperience} className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center bg-green-100 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors">
              <Plus size={16} className="mr-1" /> Add
            </button>
          </div>
          <div className="space-y-6">
            {resumeData.experience.map((exp, index) => (
              <div key={exp.id} className="relative pb-6 border-b border-green-100 last:border-0 last:pb-0">
                {index > 0 && (
                   <button 
                   onClick={() => removeExperience(exp.id)}
                   className="absolute top-0 right-0 text-red-400 hover:text-red-600"
                 >
                   <Trash2 size={16} />
                 </button>
                )}
                <div className="space-y-4">
                  <div>
                    <RequiredLabel required>Job Title</RequiredLabel>
                    <input 
                      type="text" 
                      className={inputClass}
                      placeholder="e.g., Software Engineer"
                      value={exp.jobTitle}
                      onChange={(e) => updateExperience(exp.id, { jobTitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <RequiredLabel required>Company</RequiredLabel>
                    <input 
                      type="text" 
                      className={inputClass}
                      placeholder="e.g., Example Corp"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <RequiredLabel required>Start Date</RequiredLabel>
                      <input 
                        type="month" 
                        className={dateInputClass}
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <RequiredLabel>End Date</RequiredLabel>
                      <input 
                        type="month" 
                        className={dateInputClass}
                        placeholder="Present"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <RequiredLabel>Responsibilities & Impact</RequiredLabel>
                    <textarea 
                      className={`${inputClass} h-32 resize-none`}
                      placeholder="Summarize your key contributions, achievements, and impact"
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="p-6 border border-green-100 rounded-lg h-fit bg-green-50/30">
          <h2 className="text-lg font-semibold mb-4 text-green-800">Skills</h2>
          <div>
            <RequiredLabel>Add a skill</RequiredLabel>
            <input 
              type="text" 
              className={`${inputClass} mb-2`}
              placeholder="e.g., React, Project Management, SQL"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleAddSkill}
            />
            <p className="text-xs text-gray-400 mb-4">Press enter after each skill to add it to your list.</p>
            
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="ml-2 text-green-600 hover:text-red-500 focus:outline-none transition-colors">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div className="mt-8">
        <button 
          onClick={() => { if (isFormValid()) { setStep('TEMPLATE'); } else { setShowMissingModal(true); } }}
          className="w-full md:w-auto px-8 py-3 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition-colors"
        >
          Save & Continue
        </button>
      </div>

      {/* Missing Fields Modal */}
      {showMissingModal && (
        <div className="fixed inset-0 bg-gray-200/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4 border border-green-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Incomplete Information</h3>
            <p className="text-sm text-gray-600 mb-4">To continue, please fill in all required fields.</p>
            <ul className="text-sm text-red-500 list-disc list-inside mb-6 space-y-1">
              {getMissingFields().map(f => <li key={f}>{f} &mdash; Missing</li>)}
            </ul>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowMissingModal(false)} 
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => setShowMissingModal(false)} 
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Complete Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoForm;
