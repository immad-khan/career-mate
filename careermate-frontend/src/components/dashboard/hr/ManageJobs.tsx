'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { jobsAPI } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import Spinner from '@/components/ui/spinner';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';

interface Job {
  id: string;
  title: string;
  description: string;
  required_skills: string;
  salary_min: string | null;
  salary_max: string | null;
  job_type: string;
  experience_level: string;
  status: string;
  company_name?: string;
  created_at: string;
  applications_count?: number;
}

export default function ManageJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    required_skills: '',
    salary_min: '',
    salary_max: '',
    job_type: '',
    experience_level: '',
  });
  const [isSaving, setIsSaving] = useState(false);

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
    if (!window.confirm('Are you sure you want to delete this job? This cannot be undone.')) return;
    try {
      await jobsAPI.deleteJob(id);
      toast.success('Job deleted successfully');
      setJobs(jobs.filter(j => j.id !== id));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const startEdit = (job: Job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title,
      description: job.description,
      required_skills: job.required_skills,
      salary_min: job.salary_min || '',
      salary_max: job.salary_max || '',
      job_type: job.job_type,
      experience_level: job.experience_level,
    });
  };

  const cancelEdit = () => {
    setEditingJob(null);
    setEditForm({ title: '', description: '', required_skills: '', salary_min: '', salary_max: '', job_type: '', experience_level: '' });
  };

  const saveEdit = async () => {
    if (!editingJob) return;
    setIsSaving(true);
    try {
      const payload: any = {
        title: editForm.title,
        description: editForm.description,
        required_skills: editForm.required_skills,
        job_type: editForm.job_type,
        experience_level: editForm.experience_level,
      };
      if (editForm.salary_min) payload.salary_min = Number(editForm.salary_min);
      if (editForm.salary_max) payload.salary_max = Number(editForm.salary_max);

      await jobsAPI.updateJob(editingJob.id, payload);
      toast.success('Job updated successfully');
      setJobs(jobs.map(j => j.id === editingJob.id ? { ...j, ...payload } : j));
      cancelEdit();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Posted Jobs</h2>

      {jobs.length === 0 ? (
        <p className="text-gray-500">No jobs posted yet. Go to &quot;Post Job&quot; to create one.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="border border-gray-200 rounded-lg p-5 bg-gray-50/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase border ${
                      job.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      job.status === 'closed' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {job.job_type} &middot; {job.experience_level}
                    {job.salary_min && job.salary_max && (
                      <> &middot; {job.salary_min} - {job.salary_max}</>
                    )}
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {job.required_skills.split(',').map((s: string, i: number) => (
                      <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{s.trim()}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => startEdit(job)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleDelete(job.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={cancelEdit} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 space-y-5">
            <h3 className="text-xl font-bold text-gray-900">Edit Job</h3>

            <Input
              label="Job Title"
              value={editForm.title}
              onChange={e => setEditForm({ ...editForm, title: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
              <textarea
                value={editForm.description}
                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                rows={5}
                className="w-full rounded-md border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-green-500 transition focus:border-green-500"
              />
            </div>

            <Input
              label="Required Skills (comma separated)"
              value={editForm.required_skills}
              onChange={e => setEditForm({ ...editForm, required_skills: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Salary Min"
                type="number"
                value={editForm.salary_min}
                onChange={e => setEditForm({ ...editForm, salary_min: e.target.value })}
              />
              <Input
                label="Salary Max"
                type="number"
                value={editForm.salary_max}
                onChange={e => setEditForm({ ...editForm, salary_max: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select
                  value={editForm.job_type}
                  onChange={e => setEditForm({ ...editForm, job_type: e.target.value })}
                  className="w-full rounded-md border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-green-500 transition focus:border-green-500"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                <select
                  value={editForm.experience_level}
                  onChange={e => setEditForm({ ...editForm, experience_level: e.target.value })}
                  className="w-full rounded-md border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-green-500 transition focus:border-green-500"
                >
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior Level</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={cancelEdit} className="px-5">
                Cancel
              </Button>
              <Button onClick={saveEdit} isLoading={isSaving} className="px-6">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
