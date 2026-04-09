"use client";

import React from 'react';
import { useInterviewStore } from '@/store/interviewStore';
import { Play, RotateCcw, Layout, Clock, Monitor } from 'lucide-react';

const InterviewResume: React.FC = () => {
  const { setStep, resetInterview, currentIndex, questions, answers, category } = useInterviewStore();

  const progress = Math.round(((currentIndex) / questions.length) * 100);
  const lastQuestion = questions[currentIndex];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Resume Banner Card */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="space-y-4 max-w-xl">
           <p className="text-sm text-gray-400 font-bold">Mock interview quiz · Saved progress</p>
           <h1 className="text-3xl font-bold text-gray-900">Pick up where you left off</h1>
           <p className="text-gray-500 text-lg">You paused this quiz earlier. Resume from your last question or start over if you want a fresh run.</p>
           <div className="flex gap-3">
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-100 italic">Progress: {currentIndex} / {questions.length} questions</span>
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-100">Approx. 4-6 min remaining</span>
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-100">Last activity: Just now</span>
           </div>
           <div className="flex items-center gap-4 pt-4">
              <button 
                onClick={() => setStep('QUIZ')}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-8 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-green-200"
              >
                <Play size={18} fill="currentColor" /> Resume quiz
              </button>
              <button 
                onClick={resetInterview}
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2.5 px-6 rounded-xl transition-colors"
                >
                Start over
              </button>
              <button className="text-gray-400 font-bold px-4 hover:text-gray-600 underline text-sm underline-offset-4">View full progress</button>
           </div>
        </div>

        <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 relative">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-green-500" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * progress) / 100} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{progress}%</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Completed</span>
                </div>
            </div>
            <div className="text-center">
                <h3 className="font-bold text-gray-900">You're mid-way through this mock interview</h3>
                <p className="text-xs text-gray-400 max-w-[200px] mt-1 italic">Resuming will load your last unanswered question and keep existing answers intact.</p>
                <div className="flex gap-2 justify-center mt-3">
                    <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold">Saved automatically</span>
                    <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold">No answers lost</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
         {/* Last Attempted Question */}
         <div className="lg:col-span-3 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Last attempted question</h3>
            <p className="text-sm text-gray-400 font-medium">Here's where you paused. We'll resume from this question.</p>
            
            <div className="space-y-4">
               <div className="flex gap-3">
                  <span className="bg-gray-50 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold border border-gray-100">Question {currentIndex + 1} of 10</span>
                  <span className="bg-gray-50 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold border border-gray-100">{category}</span>
                  <span className="bg-gray-50 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold border border-gray-100">Estimated 1 min</span>
               </div>
               
               <div className="p-6 bg-green-50 border border-green-100 rounded-2xl">
                  <h4 className="text-lg font-bold text-gray-800 leading-relaxed mb-4">{lastQuestion?.question}</h4>
                  <div className="space-y-3">
                     <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center p-0.5">
                           <div className="w-full h-full bg-green-500 rounded-full"></div>
                        </div>
                        <p className="text-sm text-gray-600">You had started drafting your answer using the STAR framework.</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-200"></div>
                        <p className="text-sm text-gray-400 italic">Your notes and partial answer are saved and will reappear when you resume.</p>
                     </div>
                  </div>
               </div>
               
               <div className="flex justify-between items-center text-xs text-gray-400">
                  <p>Preview only. You'll be able to edit and submit your full answer after resuming.</p>
                  <button className="font-bold text-gray-900 underline underline-offset-2">Open detailed preview</button>
               </div>
            </div>
         </div>

         {/* Saved Progress Overview */}
         <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Saved progress overview</h3>
            <p className="text-sm text-gray-400 mb-8 font-medium">A quick snapshot of your current run.</p>
            
            <div className="space-y-6 flex-1">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Answered correctly so far</span>
                    <span className="font-bold text-gray-900 font-mono">4 questions</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-medium">Marked for review</span>
                    <span className="font-bold text-gray-900 font-mono">1 question</span>
                </div>
                <div className="flex justify-between items-center decoration-dotted decoration-gray-300">
                    <span className="text-sm text-gray-500">Unanswered</span>
                    <span className="font-bold text-gray-900 font-mono">3 questions</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center gap-2"><Clock size={14} /> Time spent so far</span>
                    <span className="font-bold text-gray-900 font-mono">05:18 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center gap-2"><Monitor size={14} /> Device</span>
                    <span className="font-bold text-gray-900 font-mono text-xs">Web · This session</span>
                </div>
            </div>
         </div>
      </div>

      <div className="flex justify-between items-center pt-8">
          <p className="text-xs text-gray-400 italic font-medium">Tip: If you choose "Start over", your current attempts on this quiz run will be cleared, but previous completed attempts stay in your history.</p>
          <div className="flex gap-4">
              <button 
                onClick={() => setStep('QUIZ')}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-8 rounded-xl transition-colors shadow-lg shadow-green-100"
              >
                Resume quiz
              </button>
              <button 
                onClick={resetInterview}
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2.5 px-6 rounded-xl transition-colors"
               >
                Start over
              </button>
          </div>
      </div>
    </div>
  );
};

export default InterviewResume;
