"use client";

import React, { useEffect} from 'react';
import { useInterviewStore } from '@/store/interviewStore';
import InterviewStart from '@/components/interview/InterviewStart';
import InterviewQuiz from '@/components/interview/InterviewQuiz';
import InterviewResult from '@/components/interview/InterviewResult';
import InterviewResume from '@/components/interview/InterviewResume';

export default function MockInterviewPage() {
  const { step, setStep, questions, answers } = useInterviewStore();

  // If user has progress but is on START step, offer to resume
  useEffect(() => {
    if (step === 'START' && questions.length > 0 && answers.length < questions.length && answers.length > 0) {
      setStep('PAUSED');
    }
  }, []);

  const renderStep = () => {
    switch (step) {
      case 'START':
        return <InterviewStart />;
      case 'QUIZ':
        return <InterviewQuiz />;
      case 'PAUSED':
        return <InterviewResume />;
      case 'RESULT':
        return <InterviewResult />;
      default:
        return <InterviewStart />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 min-h-[calc(100vh-100px)]">
      {renderStep()}
    </div>
  );
}
