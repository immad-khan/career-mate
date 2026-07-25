'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import PostJobForm from '@/components/forms/PostJobForm';
import ApplicantsList from '@/components/dashboard/hr/ApplicantsList';

export default function HRDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'post-job' | 'applicants'>('dashboard');

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">CareerMate HR Portal</h1>
      </div>

      <div className="flex space-x-4 border-b border-gray-200 mb-6 px-2">
        {['dashboard', 'post-job', 'applicants'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-2 capitalize font-semibold transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-500 hover:text-green-500'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Welcome back, {user?.full_name}</h2>
            <p className="text-gray-600">Select a tab above to manage your job postings and review applicants.</p>
          </div>
        )}
        
        {activeTab === 'post-job' && <PostJobForm />}
        {activeTab === 'applicants' && <ApplicantsList />}
      </div>
    </div>
  );
}
