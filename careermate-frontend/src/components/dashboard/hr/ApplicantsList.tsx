'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { jobsAPI } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import Spinner from '@/components/ui/spinner';
import Button from '@/components/ui/button';

export default function ApplicantsList() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const resp = await jobsAPI.getApplications();
      setApplications(resp);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await jobsAPI.updateApplicationStatus(id, status);
      toast.success(`Application marked as ${status}`);
      setApplications(applications.map(app => 
        app.id === id ? { ...app, status } : app
      ));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Review Applicants</h2>
      
      {applications.length === 0 ? (
        <p className="text-gray-500">No applications received yet.</p>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app.id} className="border border-gray-200 rounded-lg p-5 bg-gray-50/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{app.job_seeker_name}</h3>
                  <p className="text-sm text-gray-500">{app.job_seeker_email} • Applied for <span className="font-semibold text-green-700">{app.job_title}</span></p>
                </div>
                <div className="mt-2 md:mt-0 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold uppercase text-gray-600">
                  Status: {app.status}
                </div>
              </div>
              
              {app.cover_letter && (
                <div className="mb-4 text-sm text-gray-700 p-3 bg-white rounded border border-gray-100">
                  <p className="font-semibold mb-1 text-xs text-gray-500 uppercase tracking-wider">Cover Letter</p>
                  <p>{app.cover_letter}</p>
                </div>
              )}

              {app.resume && (
                <div className="mb-4">
                  <a href={app.resume} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline">
                    View Resume (PDF)
                  </a>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50" onClick={() => updateStatus(app.id, 'approved')}>Approve</Button>
                <Button size="sm" variant="outline" className="border-red-600 text-red-600 hover:bg-red-50" onClick={() => updateStatus(app.id, 'rejected')}>Decline</Button>
                <Button size="sm" variant="outline" className="border-gray-400 text-gray-600" onClick={() => updateStatus(app.id, 'reviewed')}>Mark as Reviewed</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
