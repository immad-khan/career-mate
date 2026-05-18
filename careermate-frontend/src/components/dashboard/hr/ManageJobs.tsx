'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { jobsAPI } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/button';

export default function ManageJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const resp = await jobsAPI.getJobs();
      setJobs(resp);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await jobsAPI.deleteJob(id);
      toast.success('Job deleted successfully');
      setJobs(jobs.filter(j => j.id !== id));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Posted Jobs</h2>
      
      {jobs.length === 0 ? (
        <p className="text-gray-500">No jobs posted yet.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{job.job_type} • {job.experience_level}</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {job.required_skills.split(',').map((s: string, i: number) => (
                    <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{s.trim()}</span>
                  ))}
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex gap-2">
                <Button size="sm" variant="outline" className="border-gray-300 text-gray-700">Edit</Button>
                <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleDelete(job.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
