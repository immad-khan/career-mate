"use client";

import React, { useEffect } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import CoverLetterGenerator from '@/components/resume-builder/CoverLetterGenerator';

const CoverLetterPage: React.FC = () => {
  const setStep = useResumeStore((state) => state.setStep);

  useEffect(() => {
    // Specifically set the step to cover letter input when this page loads
    setStep('COVER_LETTER_INPUT');
  }, [setStep]);

  return (
    <div className="min-h-screen bg-white py-8">
      <main>
        <CoverLetterGenerator />
      </main>
    </div>
  );
};

export default CoverLetterPage;
