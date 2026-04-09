"use client";

import React, { useState } from 'react';
import { useInterviewStore } from '@/store/interviewStore';
import { evaluateAnswers } from '@/lib/groq';
import { Loader2, ArrowLeft, ArrowRight, Save } from 'lucide-react';

const InterviewQuiz: React.FC = () => {
  const { 
    questions, 
    currentIndex, 
    answers, 
    submitAnswer, 
    nextQuestion, 
    prevQuestion, 
    setStep,
    finishInterview,
    category,
    difficulty,
    testType
  } = useInterviewStore();

  const [loading, setLoading] = useState(false);
  const currentQuestion = questions[currentIndex];
  const isMCQ = testType === 'MCQ';
  
  const handleFinish = async () => {
    setLoading(true);
    try {
      const result = await evaluateAnswers(questions, answers);
      if (result) {
        finishInterview(result);
      }
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Quiz Header Info */}
      <div className="rounded-2xl p-8 border transition-all duration-300 bg-white border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400">Session · {category} · {difficulty}</p>
            <h1 className="text-3xl font-bold uppercase tracking-tighter text-gray-900">Question {currentIndex + 1}/{questions.length}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-900">{Math.round(progress)}% Completed</p>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-green-500" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * progress) / 100} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{currentIndex + 1}/{questions.length}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border transition-all bg-green-50 border-green-100">
            <h2 className="text-xl font-bold leading-relaxed text-gray-800">
              {currentQuestion.question}
            </h2>
          </div>

          {isMCQ && currentQuestion.options ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, idx) => (
                   <button
                    key={idx}
                    onClick={() => submitAnswer(option)}
                    className={`p-6 text-left border-2 rounded-2xl transition-all flex items-center gap-4 ${
                        answers[currentIndex] === option 
                        ? 'border-green-500 bg-green-50 font-bold text-green-700' 
                        : 'border-gray-100 hover:border-gray-200 bg-white text-gray-700'
                    }`}
                   >
                     <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                         answers[currentIndex] === option ? 'border-green-600 bg-green-600 text-white' : 'border-gray-200 text-gray-400'
                     }`}>
                        {String.fromCharCode(65 + idx)}
                     </div>
                     <span className="font-medium">{option}</span>
                   </button>
                ))}
             </div>
          ) : (
            <textarea 
              className="w-full p-6 h-64 outline-none transition-all rounded-2xl border-2 bg-white border-gray-200 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Type your answer here..."
              value={answers[currentIndex] || ''}
              onChange={(e) => submitAnswer(e.target.value)}
            />
          )}
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          <div className="flex gap-4">
             <button 
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                className="px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-30"
              >
                <ArrowLeft size={16} /> Previous
              </button>
              <button 
                onClick={() => setStep('PAUSED')}
                className="px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-2"
              >
                <Save size={16} /> Save Progress
              </button>
          </div>
          
          {currentIndex === questions.length - 1 ? (
             <button 
                onClick={handleFinish}
                disabled={loading}
                className="px-10 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 bg-green-500 hover:bg-green-600 text-white"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Finish Interview'}
              </button>
          ) : (
            <button 
              onClick={nextQuestion}
              className="px-10 py-3 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
            >
              Next <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
      
      <p className="text-center text-[10px] italic uppercase tracking-widest text-gray-400">
        Tip: Progress is auto-saved.
      </p>
    </div>
  );
};

export default InterviewQuiz;
