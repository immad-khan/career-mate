"use client";

import React, { useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { generateCoverLetterAI } from '@/lib/gemini';
import { Loader2, ChevronDown, ArrowLeft } from 'lucide-react';

const CoverLetterGenerator: React.FC = () => {
  const { currentStep, setStep, resumeData, coverLetter, setCoverLetter } = useResumeStore();
  const [loading, setLoading] = useState(false);
  const [showTonePicker, setShowTonePicker] = useState(false);
  const [showMissingModal, setShowMissingModal] = useState(false);

  const handleGenerate = async (overrideTone?: string) => {
    if (!coverLetter.jobTitle || !coverLetter.company) {
      setShowMissingModal(true);
      return;
    }
    setLoading(true);
    const tone = overrideTone || coverLetter.tone;
    const text = await generateCoverLetterAI(
      coverLetter.jobTitle,
      coverLetter.company,
      coverLetter.description,
      tone,
      resumeData
    );
    setCoverLetter({ generatedContent: text, tone: tone as any });
    setLoading(false);
    setShowTonePicker(false);
    setStep('COVER_LETTER_PREVIEW');
  };

  const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors";

  const getCoverLetterMissingFields = () => {
    const missing: string[] = [];
    if (!coverLetter.jobTitle.trim()) missing.push('Job Title');
    if (!coverLetter.company.trim()) missing.push('Company Name');
    return missing;
  };

  if (currentStep === 'COVER_LETTER_INPUT') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Your Cover Letter</h1>
          <p className="text-gray-500">Fields marked with <span className="text-red-500">*</span> are required</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title <span className="text-red-500">*</span></label>
                    <input 
                        type="text"
                        className={inputClass}
                        placeholder="e.g. Product Manager"
                        value={coverLetter.jobTitle}
                        onChange={(e) => setCoverLetter({ jobTitle: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                    <input 
                        type="text"
                        className={inputClass}
                        placeholder="e.g. Acme Inc."
                        value={coverLetter.company}
                        onChange={(e) => setCoverLetter({ company: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                    <textarea 
                        className={`${inputClass} h-40 resize-none`}
                        placeholder="Paste the job description or key responsibilities here..."
                        value={coverLetter.description}
                        onChange={(e) => setCoverLetter({ description: e.target.value })}
                    />
                </div>
            </div>

             <div className="w-full lg:w-80 bg-green-50 p-6 rounded-xl h-fit border border-green-100">
                <h3 className="font-semibold text-green-800 mb-4">Choose a Tone</h3>
                <div className="space-y-3">
                    {['Professional', 'Persuasive', 'Concise'].map(tone => (
                        <div 
                            key={tone}
                            onClick={() => setCoverLetter({ tone: tone as any })}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${coverLetter.tone === tone ? 'bg-white border-green-500 shadow-sm ring-1 ring-green-500' : 'bg-white border-gray-200 hover:border-green-300'}`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-gray-900">{tone}</span>
                                {coverLetter.tone === tone && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
                            </div>
                            <p className="text-xs text-gray-500">
                                {tone === 'Professional' && 'Polished and formal tone.'}
                                {tone === 'Persuasive' && 'Confident and engaging.'}
                                {tone === 'Concise' && 'Clear and to-the-point.'}
                            </p>
                        </div>
                    ))}
                </div>
             </div>
        </div>

        <div className="mt-8">
            <button 
                onClick={() => handleGenerate()}
                disabled={loading}
                className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
                {loading && <Loader2 className="animate-spin mr-2" size={18} />}
                Generate Cover Letter
            </button>
        </div>

        {/* Missing Fields Modal */}
        {showMissingModal && (
          <div className="fixed inset-0 bg-gray-200/40 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4 border border-green-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Incomplete Information</h3>
              <p className="text-sm text-gray-600 mb-4">To generate a cover letter, please fill in all required fields.</p>
              <ul className="text-sm text-red-500 list-disc list-inside mb-6 space-y-1">
                {getCoverLetterMissingFields().map(f => <li key={f}>{f} &mdash; Missing</li>)}
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
  }

  // PREVIEW STEP
  return (
    <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 bg-white p-8 shadow-sm rounded-xl border border-gray-100 min-h-[600px]">
            <div className="mb-8 text-sm text-gray-600">
                <p className="font-bold text-gray-900">{resumeData.personalInfo.fullName}</p>
                <p>{resumeData.personalInfo.email} • {resumeData.personalInfo.phone}</p>
                <br />
                <p>{new Date().toLocaleDateString()}</p>
                <br />
                <p>Hiring Manager</p>
                <p>{coverLetter.company}</p>
            </div>
            
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-serif">
                {coverLetter.generatedContent}
            </div>
        </div>

        <div className="w-full lg:w-80 flex-shrink-0">
             <h2 className="text-xl font-bold mb-1">Generated Cover Letter</h2>
             <p className="text-sm text-gray-500 mb-6">Review and customize before downloading</p>

             <div className="flex items-center gap-2 mb-6 text-xs">
                 <span className="text-green-600 font-medium">Tone: {coverLetter.tone}</span>
                 <span className="text-gray-400">|</span>
                 <span className="text-green-600 font-medium">Job: {coverLetter.jobTitle}</span>
             </div>

             <div className="space-y-4">
                 <button className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition-colors" onClick={() => window.print()}>
                     Download PDF
                 </button>

                 {/* Regenerate with tone picker */}
                 <div className="relative">
                   <button 
                      onClick={() => setShowTonePicker(!showTonePicker)}
                      disabled={loading}
                      className="w-full py-3 border border-green-500 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                       {loading ? <Loader2 className="animate-spin" size={18} /> : <ChevronDown size={18} className={`transition-transform ${showTonePicker ? 'rotate-180' : ''}`} />}
                       Regenerate with New Tone
                   </button>
                   {showTonePicker && (
                     <div className="mt-2 border border-green-200 rounded-lg bg-white shadow-lg overflow-hidden">
                       {['Professional', 'Persuasive', 'Concise'].map(tone => (
                         <button
                           key={tone}
                           onClick={() => handleGenerate(tone)}
                           disabled={loading}
                           className={`w-full px-4 py-3 text-left text-sm hover:bg-green-50 transition-colors flex justify-between items-center ${
                             coverLetter.tone === tone ? 'bg-green-50 font-semibold text-green-700' : 'text-gray-700'
                           }`}
                         >
                           <span>{tone}</span>
                           {coverLetter.tone === tone && <span className="text-xs text-green-500">current</span>}
                         </button>
                       ))}
                     </div>
                   )}
                 </div>
                 
                 <div className="pt-6 border-t border-gray-100 mt-6">
                    <button 
                        onClick={() => setStep('COLD_EMAIL_INPUT')}
                        className="w-full py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Next: Generate Cold Email
                    </button>
                 </div>
             </div>
        </div>
        </div>
    </div>
  );
};

export default CoverLetterGenerator;
