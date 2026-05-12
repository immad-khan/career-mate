"use client";

import React from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { FileText, CheckCircle } from 'lucide-react';

const DownloadSection: React.FC = () => {
  const { setStep } = useResumeStore();

  const handleDownload = () => {
    window.print(); // Simple way to download PDF via browser print
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
           <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center">
             <div className="bg-green-500 p-2 rounded-lg">
                <span className="font-bold text-white text-xs">PDF</span>
             </div>
           </div>
        </div>
        
        <div className="inline-flex items-center bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
          <CheckCircle size={14} className="mr-1" /> Successfully Generated
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Resume Is Ready!</h1>
        <p className="text-gray-500 mb-8">Download your PDF and start applying.</p>

        <div className="space-y-4">
          <button 
            onClick={handleDownload}
            className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition-colors"
          >
            Download PDF
          </button>
          
          <button 
            onClick={() => setStep('REVIEW')}
            className="block w-full text-green-600 font-medium hover:underline text-sm"
          >
            Edit Again
          </button>

          <div className="pt-8 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-4">Done with your resume? Create a matching cover letter.</p>
              <button 
                onClick={() => setStep('COVER_LETTER_INPUT')}
                className="w-full py-3 border border-green-500 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
              >
                Create Cover Letter
              </button>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 mt-6">You can always come back to update your resume later.</p>
      </div>
    </div>
  );
};

export default DownloadSection;
