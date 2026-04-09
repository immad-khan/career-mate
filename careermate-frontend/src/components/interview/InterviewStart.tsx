"use client";

import React, { useState } from 'react';
import { useInterviewStore } from '@/store/interviewStore';
import { generateInterviewQuestions } from '@/lib/groq';
import { Loader2, CheckCircle2 } from 'lucide-react';

const categories = [
  { id: 'Technical', count: '24 Qs', color: 'bg-primary' },
  { id: 'HR', count: '16 Qs', color: 'bg-primary' },
  { id: 'Behavioral', count: '18 Qs', color: 'bg-primary' },
];

const difficulties = [
  { 
    id: 'Beginner', 
    desc: 'Warm-up questions, confidence building', 
    sub: "Great if you're new to interviewing or returning to the job market after a break."
  },
  { 
    id: 'Intermediate', 
    desc: 'Real-world, role-focused questions', 
    sub: "Ideal if you already have some interview experience and want sharper answers." 
  },
  { 
    id: 'Advanced', 
    desc: 'Challenging, panel-style questions', 
    sub: "Best suited if you're preparing for senior or highly competitive roles."
  },
];

const InterviewStart: React.FC = () => {
  const { startInterview } = useInterviewStore();
  const [selectedCategory, setSelectedCategory] = useState('Technical');
  const [customCategory, setCustomCategory] = useState('');
  const [testType, setTestType] = useState<'WRITTEN' | 'MCQ'>('WRITTEN');
  const [loading, setLoading] = useState(false);

  const handleStart = async (difficulty: string) => {
    setLoading(true);
    const categoryToUse = customCategory.trim() || selectedCategory;
    try {
      const questions = await generateInterviewQuestions(categoryToUse, difficulty, testType);
      if (questions && questions.length > 0) {
        startInterview(categoryToUse, difficulty, testType, questions);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="rounded-2xl p-8 border transition-all duration-300 flex flex-col lg:flex-row justify-between items-start gap-8 bg-white border-gray-100 shadow-sm">
        <div className="space-y-4 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Mock Interview Quiz</p>
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-gray-900">Interview Simulation</h1>
          <p className="text-lg text-gray-600">Prepare for your next interview with AI-powered questions. Specify your niche field for tailored questions.</p>
          
          <div className="flex flex-col gap-6 pt-4">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-700">1. Specify Category (Field of interest)</label>
              <div className="relative group max-w-md">
                <input 
                  type="text" 
                  placeholder="e.g. Cloud Computing, Network Engineering, AI..."
                  className="w-full px-6 py-4 rounded-2xl outline-none transition-all font-medium bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors text-gray-400 group-focus-within:text-green-500">
                  <CheckCircle2 size={24} />
                </div>
              </div>
              <p className="text-xs italic text-gray-400">Leave blank to use the quick categories on the right.</p>
            </div>

            <div className="space-y-3">
               <label className="text-xs font-bold uppercase tracking-widest text-gray-700">2. Choose Test Format</label>
               <div className="flex gap-4 max-w-md">
                  <button 
                    onClick={() => setTestType('WRITTEN')}
                    className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        testType === 'WRITTEN' 
                        ? 'border-green-500 bg-green-50 text-green-700 font-bold' 
                        : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-sm">Written/Typed</span>
                    <span className="text-[10px] font-normal uppercase tracking-widest">Open-ended answers</span>
                  </button>
                  <button 
                    onClick={() => setTestType('MCQ')}
                    className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        testType === 'MCQ' 
                        ? 'border-green-500 bg-green-50 text-green-700 font-bold' 
                        : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-sm">MCQ (Multiple Choice)</span>
                    <span className="text-[10px] font-normal uppercase tracking-widest">Select from options</span>
                  </button>
               </div>
            </div>

            <div className="flex gap-4 pt-2">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-green-50 text-green-700">Tailored questions</span>
              <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-green-50 text-green-700">Time: 15 Mins</span>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-64 rounded-2xl border p-6 transition-all bg-white border-gray-100 shadow-sm">
            <h3 className="font-bold uppercase mb-4 text-xs tracking-widest text-gray-900">Quick Selection</h3>
            <div className="space-y-4 text-sm">
                {categories.map((cat) => (
                    <div 
                        key={cat.id} 
                        className={`flex items-center justify-between cursor-pointer p-2 rounded-lg transition-all ${
                            selectedCategory === cat.id 
                            ? 'bg-green-50 text-green-900' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedCategory(cat.id)}
                    >
                        <div className="flex items-center gap-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${cat.color}`}></div>
                           <span className="text-xs font-bold uppercase tracking-tighter">{cat.id}</span>
                        </div>
                        <span className="text-[10px] opacity-60 tracking-widest">{cat.count}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-900">Choose your difficulty</h2>
            <p className="text-sm text-gray-500">Start with a level that matches your current interview readiness.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {difficulties.map((diff) => (
                    <div key={diff.id} className="rounded-2xl p-8 border flex flex-col transition-all duration-300 bg-white border-gray-100 hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                             <div className="space-y-1">
                                <h3 className="font-bold uppercase text-xl text-gray-900">{diff.id}</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{diff.desc}</p>
                             </div>
                             <div className="w-10 h-10 rounded-xl transition-all bg-green-50"></div>
                        </div>
                        <p className="text-xs mb-8 flex-1 leading-relaxed text-gray-600">{diff.sub}</p>
                        <button 
                            onClick={() => handleStart(diff.id)}
                            disabled={loading}
                            className="w-full font-bold py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-[0.2em] text-xs bg-green-500 hover:bg-green-600 text-white"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Initiate Session'}
                        </button>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 flex flex-col h-fit shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">How this quiz works</h3>
            <p className="text-sm text-gray-500 leading-relaxed space-y-4">
                Pick a difficulty and category, then answer timed questions as if you were in a real interview. Review suggestions after each session.
            </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewStart;
