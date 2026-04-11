'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { jobsAPI } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const jobSchema = z.object({
  title: z.string().min(1, 'Job Title is required'),
  description: z.string().min(1, 'Job Description is required'),
  required_skills: z.string().min(1, 'Required Skills are required'),
  salary_min: z.string().optional(),
  salary_max: z.string().optional(),
  job_type: z.string().min(1, 'Job Type is required'),
  experience_level: z.string().min(1, 'Experience Level is required'),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function PostJobForm() {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
  });

  const onSubmit = async (data: JobFormData) => {
    setIsLoading(true);
    try {
      await jobsAPI.createJob(data);
      toast.success('Job posted successfully!');
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-2">Post a New Job Opening</h2>
      <p className="text-gray-500 mb-6 text-sm">Fill in the job details below to publish a new opening.</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Job Title *"
          placeholder="e.g. Senior Frontend Engineer"
          error={errors.title?.message}
          {...register('title')}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
          <textarea
            className="w-full rounded-md border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-green-500 transition focus:border-green-500 min-h-[120px]"
            placeholder="Describe responsibilities, expectations, and role overview..."
            {...register('description')}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <Input
          label="Required Skills *"
          placeholder="Add skills separated by commas (e.g. React, TypeScript, REST APIs)"
          error={errors.required_skills?.message}
          {...register('required_skills')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Salary Range (Min)"
            placeholder="Min salary (e.g. 80000)"
            type="number"
            {...register('salary_min')}
          />
          <Input
            label="Salary Range (Max)"
            placeholder="Max salary (e.g. 120000)"
            type="number"
            {...register('salary_max')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
            <select
              className="w-full rounded-md border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-green-500 transition focus:border-green-500"
              {...register('job_type')}
            >
              <option value="">Select job type...</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
            {errors.job_type && <p className="text-red-500 text-sm mt-1">{errors.job_type.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level *</label>
            <select
              className="w-full rounded-md border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-green-500 transition focus:border-green-500"
              {...register('experience_level')}
            >
              <option value="">Select experience level...</option>
              <option value="Entry">Entry Level</option>
              <option value="Mid">Mid Level</option>
              <option value="Senior">Senior Level</option>
              <option value="Executive">Executive</option>
            </select>
            {errors.experience_level && <p className="text-red-500 text-sm mt-1">{errors.experience_level.message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => reset()} className="px-6 rounded-full font-bold">
            Clear
          </Button>
          <Button type="submit" isLoading={isLoading} className="bg-green-600 hover:bg-green-700 text-white px-8 rounded-full font-bold">
            Publish Job
          </Button>
        </div>
      </form>
    </div>
  );
}
