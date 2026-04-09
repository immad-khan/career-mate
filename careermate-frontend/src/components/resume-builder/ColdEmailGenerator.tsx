"use client";

import React, { useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { generateColdEmailAI } from '@/lib/gemini';
import { Loader2, Copy, Check, ArrowLeft } from 'lucide-react';

const ColdEmailGenerator: React.FC = () => {
  const { currentStep, resumeData, coldEmail, setColdEmail, setStep } = useResumeStore();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMissingModal, setShowMissingModal] = useState(false);

  const handleGenerate = async () => {
    if (!coldEmail.recipientName || !coldEmail.company || !coldEmail.jobTitle) {
        setShowMissingModal(true);
        return;
    }
    setLoading(true);
    const text = await generateColdEmailAI(
      coldEmail.recipientName,
      coldEmail.company,
      coldEmail.jobTitle,
      coldEmail.jobDescription,
      coldEmail.tone,
      resumeData
    );
    setColdEmail({ generatedContent: text });
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coldEmail.generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors";

  const getColdEmailMissingFields = () => {
    const missing: string[] = [];
    if (!coldEmail.recipientName.trim()) missing.push('Recipient Name');
    if (!coldEmail.company.trim()) missing.push('Company Name');
    if (!coldEmail.jobTitle.trim()) missing.push('Job Title');
    return missing;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate a Professional Cold Email</h1>
            <p className="text-gray-500">Fields marked with <span className="text-red-500">*</span> are required</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Input Form */}
            <div className="flex-1 space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name <span className="text-red-500">*</span></label>
                    <input 
                        type="text"
                        className={`${inputClass}`}
                        placeholder="e.g. Sarah Lee"
                        value={coldEmail.recipientName}
                        onChange={(e) => setColdEmail({ recipientName: e.target.value })}
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                    <input 
                        type="text"
                        className={`${inputClass}`}
                        placeholder="e.g. Acme Corp"
                        value={coldEmail.company}
                        onChange={(e) => setColdEmail({ company: e.target.value })}
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title <span className="text-red-500">*</span></label>
                    <input 
                        type="text"
                        className={`${inputClass}`}
                        placeholder="e.g. Product Manager"
                        value={coldEmail.jobTitle}
                        onChange={(e) => setColdEmail({ jobTitle: e.target.value })}
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Description (Optional)</label>
                    <textarea 
                        className={`${inputClass} h-24 resize-none border-gray-300`}
                        placeholder="Paste the job description..."
                        value={coldEmail.jobDescription}
                        onChange={(e) => setColdEmail({ jobDescription: e.target.value })}
                    />
                </div>

                <div className="pt-4">
                     <h3 className="text-sm font-semibold text-gray-700 mb-3">Tone</h3>
                     <div className="flex gap-4">
                        {['Formal', 'Persuasive', 'Concise'].map(tone => (
                            <button
                                key={tone}
                                onClick={() => setColdEmail({ tone: tone as any })}
                                className={`px-4 py-2 rounded-full text-sm border transition-colors ${coldEmail.tone === tone ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'}`}
                            >
                                {tone}
                            </button>
                        ))}
                     </div>
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition-colors flex justify-center items-center mt-4 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Generate Email'}
                </button>
            </div>

            {/* Output / Preview Area */}
            <div className="w-full lg:w-1/2 bg-green-50/40 p-6 rounded-xl border border-green-100 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Email Preview</h3>
                
                {coldEmail.generatedContent ? (
                    <>
                        <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm whitespace-pre-wrap text-sm text-gray-800 overflow-y-auto max-h-[500px]">
                            {coldEmail.generatedContent}
                        </div>
                        <div className="mt-4 flex flex-col gap-3">
                            <button 
                                onClick={handleCopy}
                                className="w-full py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
                            >
                                {copied ? <Check size={16} className="mr-2 text-green-500"/> : <Copy size={16} className="mr-2"/>}
                                {copied ? 'Copied!' : 'Copy to Clipboard'}
                            </button>
                        </div>
                    </>
                ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-16 h-16 bg-green-100 rounded-full mb-4"></div>
                        <p>Your details help us generate a targeted email.</p>
                     </div>
                )}
            </div>

        </div>

        {/* Missing Fields Modal */}
        {showMissingModal && (
        <div className="fixed inset-0 bg-gray-200/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4 border border-green-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Incomplete Information</h3>
            <p className="text-sm text-gray-600 mb-4">To generate a cold email, please fill in all required fields.</p>
            <ul className="text-sm text-red-500 list-disc list-inside mb-6 space-y-1">
              {getColdEmailMissingFields().map(f => <li key={f}>{f} &mdash; Missing</li>)}
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

export default ColdEmailGenerator;