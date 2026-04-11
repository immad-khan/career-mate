'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import {
  FiArrowRight,
  FiStar,
  FiTrendingUp,
  FiBriefcase,
  FiCheckCircle,
  FiBell,
} from 'react-icons/fi';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const stats = [
    { 
      label: 'Applied Jobs', 
      value: 12, 
      icon: <FiBriefcase className="w-6 h-6" />, 
    },
    { 
      label: 'Saved Skills', 
      value: 8, 
      icon: <FiStar className="w-6 h-6" />, 
    },
    { 
      label: 'Trending Skills in Your Field', 
      value: 5, 
      icon: <FiTrendingUp className="w-6 h-6" />, 
    },
    { 
      label: 'Quiz Avg Score', 
      value: '78%', 
      icon: <FiCheckCircle className="w-6 h-6" />, 
    },
  ];

  const skillBotCard = {
    title: 'Ask SkillBot Anything',
    description: 'Type a role or skill to get a personalized learning path.',
    placeholder: 'Type job role or skill...',
    fields: ['Software Engineer', 'AI Specialist', 'Graphic Designer'],
    buttonText: 'Open Full SkillBot',
  };

  const coverLetterCard = {
    title: 'Cover Letter Generator',
    description: 'Quickly draft tailored cover letters for your applications.',
    fields: ['Professional', 'Persuasive', 'Concise'],
    buttonText: 'Generate Letter',
  };

  const coldEmailCard = {
    title: 'Cold Email Builder',
    description: 'Craft professional outreach emails in a few clicks.',
    fields: ['Formal', 'Persuasive', 'Concise'],
    buttonText: 'Generate Email',
  };

  const mockInterviewCard = {
    title: 'Mock Interview Quiz',
    description: 'Practice real interview-style questions by difficulty.',
    difficulty: ['Beginner', 'Intermediate', 'Advanced'],
    score: '78%',
    buttonText: 'Start Quiz',
    secondaryButtonText: 'Resume Quiz',
  };

  const marketTrendsCard = {
    title: 'Market Trends - Top Skills',
    description: 'Skills gaining demand in your selected field.',
    skills: [
      'AI & Machine Learning',
      'Data Analysis & SQL',
      'Cloud Computing',
      'Python Development',
    ],
    link: 'See More Trends',
  };

  const jobCrawlerCard = {
    title: 'Job Crawler',
    description: 'Search job titles...',
    jobs: [
      { title: 'Frontend Developer', company: 'TechNova', role: 'Remote', salary: 'PKR 200k' },
      { title: 'Data Analyst', company: 'InsightHub', role: 'Karachi', salary: '' },
      { title: 'Product Designer', company: 'Designify', role: 'Lahore', salary: 'Hybrid' },
    ],
    buttonText: 'Open Job Finder',
  };

  const skillRoadmapCard = {
    title: 'Skill Roadmap Preview',
    description: 'Track your growth across key skills.',
    skills: [
      { name: 'HTML', percentage: 90 },
      { name: 'JavaScript', percentage: 70 },
      { name: 'React', percentage: 50 },
    ],
    buttonText: 'View Full Roadmap',
  };

  const hrPanelCard = {
    title: 'HR Job Posting Panel',
    description: 'Manage active, pending and closed job postings.',
    stats: [
      { label: 'Active', value: 6 },
      { label: 'Pending', value: 2 },
      { label: 'Closed', value: 4 },
    ],
  };

  const quickTipsCard = {
    title: 'Quick Tips',
    tips: [
      'Tailor each resume to the job description.',
      'Highlight measurable achievements.',
      'Keep learning trending tools in your field.',
    ],
  };

  const recommendedJobs = [
    { title: 'Frontend Engineer', company: 'PixelCraft', location: 'Remote', salary: 'PKR 220k', tags: ['React', 'TypeScript', 'UI'] },
    { title: 'Data Analyst', company: 'InsightWorks', location: 'Karachi', salary: 'PKR 180k', tags: ['SQL', 'Python', 'BI Tools'] },
    { title: 'Product Designer', company: 'FlowStudio', location: 'Lahore', salary: 'PKR 200k', tags: ['Figma', 'UX', 'Prototyping'] },
    { title: 'Backend Developer', company: 'CloudForge', location: 'Remote', salary: 'PKR 240k', tags: ['Node.js', 'API', 'AWS'] },
  ];

  return (
    <div className="space-y-6 transition-colors duration-500 bg-gray-50/50 p-4 md:p-8">
      {/* Welcome Section */}
      <div className="rounded-2xl p-8 border transition-all duration-300 bg-white border-green-100 shadow-sm">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome Back, {user?.full_name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-sm font-medium text-gray-600">
              Continue your career journey with personalized insights and tools tailored to you.
            </p>
          </div>
          {/* Decorative graphic */}
          <div className="hidden md:block">
            <div className="flex gap-2">
              <div className="w-12 h-16 bg-green-50 rounded-lg flex flex-col items-center justify-center border border-green-100">
                <div className="w-8 h-1 bg-green-500 rounded-full mb-1"></div>
                <div className="w-6 h-1 bg-gray-200 rounded-full"></div>
              </div>
              <div className="w-12 h-16 bg-green-50 rounded-lg flex flex-col items-center justify-center border border-green-100">
                <div className="w-6 h-1 bg-gray-200 rounded-full mb-1"></div>
                <div className="w-8 h-1 bg-green-500 rounded-full"></div>
              </div>
              <div className="w-12 h-16 bg-green-50 rounded-lg flex flex-col items-center justify-center border border-green-100">
                <div className="w-8 h-1 bg-green-500 rounded-full mb-1"></div>
                <div className="w-4 h-1 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-4 rounded-xl border transition-all duration-300 bg-white border-green-50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-green-600">{stat.label}</p>
                <p className="text-3xl font-bold mt-1 text-gray-900">{stat.value}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-green-700">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Row 1 */}
        {/* Ask SkillBot Anything */}
        <div className="p-6 rounded-2xl border bg-white border-gray-100 shadow-sm">
          <h3 className="text-base font-bold uppercase mb-1 text-gray-900">Ask SkillBot Anything</h3>
          <p className="text-xs text-gray-500 mb-4">{skillBotCard.description}</p>
          <input
            type="text"
            placeholder={skillBotCard.placeholder}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm mb-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
          <div className="flex flex-wrap gap-2 mb-4">
            {skillBotCard.fields.map((field, idx) => (
              <span key={idx} className="px-3 py-1 rounded-full text-[10px] font-bold border border-green-100 text-green-700 bg-green-50">
                {field}
              </span>
            ))}
          </div>
          <button className="w-full bg-green-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-green-700 transition-colors">
            {skillBotCard.buttonText}
          </button>
        </div>

        {/* Cover Letter Generator */}
        <div className="p-6 rounded-2xl border bg-white border-gray-100 shadow-sm">
          <h3 className="text-base font-bold uppercase mb-1 text-gray-900">Cover Letter Generator</h3>
          <p className="text-xs text-gray-500 mb-4">{coverLetterCard.description}</p>
          <input
            type="text"
            placeholder="Job Title · Company"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm mb-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
          <div className="flex gap-2 mb-4">
            {coverLetterCard.fields.map((f, i) => (
              <button key={i} className="px-3 py-1 rounded-full text-[10px] font-bold border border-green-100 hover:bg-green-50 transition-colors text-gray-600">
                {f}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-green-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-green-700">Generate</button>
            <button className="border border-green-600 text-green-600 font-bold py-2.5 rounded-lg text-sm hover:bg-green-50">Full Tool</button>
          </div>
        </div>

        {/* Cold Email Builder */}
        <div className="p-6 rounded-2xl border bg-white border-gray-100 shadow-sm">
          <h3 className="text-base font-bold uppercase mb-1 text-gray-900">Cold Email Builder</h3>
          <p className="text-xs text-gray-500 mb-4">{coldEmailCard.description}</p>
          <input
            type="text"
            placeholder="Recipient · Company · Role"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm mb-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
          <div className="flex gap-2 mb-4">
            {coldEmailCard.fields.map((f, i) => (
              <button key={i} className={`px-3 py-1 rounded-full text-[10px] font-bold border ${i===0?'bg-green-50 border-green-300 text-green-700':'border-gray-200 text-gray-500'}`}>
                {f}
              </button>
            ))}
          </div>
          <button className="w-full bg-green-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-green-700">Generate Email</button>
        </div>

        {/* Mock Interview Quiz */}
        <div className="p-6 rounded-2xl border bg-white border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-base font-bold uppercase text-gray-900">Mock Interview Quiz</h3>
            <span className="text-[10px] font-bold text-gray-400">Score: 78%</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">{mockInterviewCard.description}</p>
          <div className="flex gap-2 mb-6">
            {mockInterviewCard.difficulty.map((d, i) => (
              <button key={i} className={`px-3 py-1 rounded-full text-[10px] font-bold border ${i===0?'bg-green-50 border-green-300 text-green-700':'border-gray-200 text-gray-500'}`}>
                {d}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-green-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-green-700">Start</button>
            <button className="border border-green-600 text-green-600 font-bold py-2.5 rounded-lg text-sm hover:bg-green-50">Resume</button>
          </div>
        </div>

        {/* Market Trends */}
        <div className="p-6 rounded-2xl border bg-white border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-base font-bold uppercase text-gray-900">Market Trends</h3>
            <Link href="/dashboard/trends" className="text-[10px] font-bold text-green-600 hover:underline">More</Link>
          </div>
          <p className="text-xs text-gray-500 mb-4">{marketTrendsCard.description}</p>
          <div className="flex flex-col gap-2 w-full mb-4">
             <div className="h-2 w-full bg-green-100 rounded-full overflow-hidden">
               <div className="h-full bg-green-500" style={{ width: '80%' }}></div>
             </div>
             <div className="h-2 w-full bg-green-100 rounded-full overflow-hidden">
               <div className="h-full bg-green-500" style={{ width: '70%' }}></div>
             </div>
          </div>
          <ul className="text-[10px] font-bold text-gray-700 space-y-1">
            {marketTrendsCard.skills.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div> {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Job Crawler */}
        <div className="p-6 rounded-2xl border bg-white border-gray-100 shadow-sm">
          <h3 className="text-base font-bold uppercase text-gray-900 mb-4">Job Crawler</h3>
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm mb-4 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
          <div className="space-y-3 mb-4">
            {jobCrawlerCard.jobs.map((job, i) => (
              <div key={i} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                <p className="text-xs font-bold uppercase text-gray-900">{job.title}</p>
                <p className="text-[10px] font-bold text-gray-400">{job.company} · {job.role}</p>
              </div>
            ))}
          </div>
          <Link href="/dashboard/jobs" className="block text-center bg-green-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-green-700 transition-colors">
            {jobCrawlerCard.buttonText}
          </Link>
        </div>

        {/* Skill Roadmap Preview */}
        <div className="p-6 rounded-2xl border bg-white border-gray-100 shadow-sm">
          <h3 className="text-base font-bold uppercase mb-1 text-gray-900">Skill Roadmap</h3>
          <p className="text-xs text-gray-500 mb-6 font-medium italic">Track your growth across key skills.</p>
          <div className="space-y-4 mb-8">
            {skillRoadmapCard.skills.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-[10px] font-bold uppercase mb-1 text-gray-900">
                  <span>{s.name}</span>
                  <span>{s.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${s.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full bg-green-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-green-700 transition-colors">
            View Full
          </button>
        </div>

        {/* HR Panel */}
        <div className="p-6 rounded-2xl border bg-white border-gray-100 shadow-sm">
          <h3 className="text-base font-bold uppercase mb-1 text-gray-900">Recruiter Panel</h3>
          <p className="text-xs text-gray-500 mb-6">{hrPanelCard.description}</p>
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button className="bg-green-600 text-white font-bold py-2 rounded-lg text-[10px] hover:bg-green-700 transition-colors">Post Job</button>
            <button className="border border-green-600 text-green-600 font-bold py-2 rounded-lg text-[10px] hover:bg-green-50 transition-colors">View All</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {hrPanelCard.stats.map((s, i) => (
              <div key={i} className="p-2 bg-gray-50 border border-gray-100 rounded-lg text-center">
                <p className="text-[10px] font-bold text-gray-400 mb-1">{s.label}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="p-6 rounded-2xl border bg-white border-gray-100 shadow-sm">
          <h3 className="text-base font-bold uppercase mb-4 text-gray-900">Quick Tips</h3>
          <ul className="space-y-3">
            {quickTipsCard.tips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-xs font-medium text-gray-600 leading-relaxed">
                <span className="text-green-600 font-bold mt-[-2px]">•</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-center text-[10px] font-bold text-gray-400 pt-8">
        CareerMate © 2025 - Empowering Your Career Journey
      </p>
    </div>
  );
}
