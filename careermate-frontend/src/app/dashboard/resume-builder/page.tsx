"use client";

import React, { useEffect } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import InfoForm from '@/components/resume-builder/InfoForm';
import TemplateSelector from '@/components/resume-builder/TemplateSelector';
import ResumePreview from '@/components/resume-builder/ResumePreview';
import DownloadSection from '@/components/resume-builder/DownloadSection';
import ReviewResume from '@/components/resume-builder/ReviewResume';
import CoverLetterGenerator from '@/components/resume-builder/CoverLetterGenerator';
import ColdEmailGenerator from '@/components/resume-builder/ColdEmailGenerator';

const ResumeBuilderPage: React.FC = () => {
  const { currentStep, setStep } = useResumeStore();

  useEffect(() => {
    // If we land on this page and the current step is a generator step,
    // revert to the SUCCESS step (which is the resume builder's "final" step)
    // or INFO if they haven't started.
    if (currentStep.startsWith('COVER_LETTER') || currentStep.startsWith('COLD_EMAIL')) {
      setStep('INFO');
    }
  }, [currentStep, setStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 'INFO':
        return <InfoForm />;
      case 'TEMPLATE':
        return <TemplateSelector />;
      case 'PREVIEW':
        return <ResumePreview />;
      case 'SUCCESS':
        return <DownloadSection />;
      case 'REVIEW':
        return <ReviewResume />;
      case 'COVER_LETTER_INPUT':
      case 'COVER_LETTER_PREVIEW':
        return <CoverLetterGenerator />;
      case 'COLD_EMAIL_INPUT':
      case 'COLD_EMAIL_PREVIEW':
        return <ColdEmailGenerator />;
      default:
        return <InfoForm />;
    }
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <main>
        {renderStep()}
      </main>
    </div>
  );
};

export default ResumeBuilderPage;