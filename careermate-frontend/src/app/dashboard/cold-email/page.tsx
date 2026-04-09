"use client";

import React, { useEffect } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import ColdEmailGenerator from '@/components/resume-builder/ColdEmailGenerator';

const ColdEmailPage: React.FC = () => {
  const setStep = useResumeStore((state) => state.setStep);

  useEffect(() => {
    // Specifically set the step to cold email input when this page loads
    setStep('COLD_EMAIL_INPUT');
  }, [setStep]);

  return (
    <div className="min-h-screen bg-white py-8">
      <main>
        <ColdEmailGenerator />
      </main>
    </div>
  );
};

export default ColdEmailPage;
