'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import PostJobForm from '@/components/forms/PostJobForm';
import ApplicantsList from '@/components/dashboard/hr/ApplicantsList';
import ManageJobs from '@/components/dashboard/hr/ManageJobs';
import { jobsAPI } from '@/lib/api';

interface HRStats {
  total_jobs: number;
  active_jobs: number;
  total_applications: number;
  pending_applications: number;
  approved_applications: number;
  rejected_applications: number;
}

export default function HRDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'post-job' | 'manage-jobs' | 'applicants'>('dashboard');
  const [stats, setStats] = useState<HRStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await jobsAPI.getHRStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch HR stats', error);
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">CareerMate HR Portal</h1>
      </div>

      <div className="flex space-x-4 border-b border-gray-200 mb-6 px-2 overflow-x-auto">
        {['dashboard', 'post-job', 'manage-jobs', 'applicants'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-2 capitalize font-semibold transition-colors whitespace-nowrap ${
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
            <h2 className="text-2xl font-bold mb-6">Welcome back, {user?.full_name}</h2>
            
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">Total Jobs Posted</p>
                  <p className="text-3xl font-bold text-green-700 mt-2">{stats.total_jobs}</p>
                  <p className="text-xs text-green-500 mt-1">{stats.active_jobs} active</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Total Applications</p>
                  <p className="text-3xl font-bold text-blue-700 mt-2">{stats.total_applications}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-100">
                  <p className="text-sm font-semibold text-amber-600 uppercase tracking-wide">Pending Reviews</p>
                  <p className="text-3xl font-bold text-amber-700 mt-2">{stats.pending_applications}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
                  <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Approved</p>
                  <p className="text-3xl font-bold text-purple-700 mt-2">{stats.approved_applications}</p>
                  <p className="text-xs text-purple-500 mt-1">{stats.rejected_applications} rejected</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Unable to load stats.</p>
            )}
          </div>
        )}
        
        {activeTab === 'post-job' && <PostJobForm />}
        {activeTab === 'manage-jobs' && <ManageJobs />}
        {activeTab === 'applicants' && <ApplicantsList />}
      </div>
    </div>
  );
}
