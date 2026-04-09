'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiBriefcase, FiUpload, FiCalendar } from 'react-icons/fi';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authAPI } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirm_password: z.string(),
    company_name: z.string().min(2, 'Company name is required'),
    company_email: z.string().email('Please enter a valid company email'),
    ntn_number: z.string().min(1, 'NTN number is required'),
    interview_date: z.string().min(1, 'Interview date is required'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function HRRegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [approvalLetter, setApprovalLetter] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (file) {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFileError('File size must be under 5MB');
        return;
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setFileError('Only PDF, JPEG, and PNG files are allowed');
        return;
      }

      setApprovalLetter(file);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (!approvalLetter) {
      setFileError('Please upload an approval letter');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('full_name', data.full_name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('confirm_password', data.confirm_password);
      formData.append('company_name', data.company_name);
      formData.append('company_email', data.company_email);
      formData.append('ntn_number', data.ntn_number);
      formData.append('interview_date', data.interview_date);
      formData.append('approval_letter', approvalLetter);

      console.log('Registering HR with data:', Object.fromEntries(formData.entries()));
      const response = await authAPI.registerHR(formData);

      if (response.success) {
        toast.success('Registration successful! Please check your email for verification code.');
        router.push(`/auth/verify-email?email=${data.email}`);
      }
    } catch (error: any) {
      console.error('HR Registration Error Details:', error.response?.data || error.message);
      const message = getErrorMessage(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Switcher - Green Theme */}
      <div className="flex rounded-xl bg-gray-50 p-1 border border-gray-100">
        <Link
          href="/auth/register/job-seeker"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg text-gray-400 hover:text-gray-600 transition-all"
        >
          <FiUser size={14} />
          Job Seeker
        </Link>
        <Link
          href="/auth/register/hr"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg bg-primary text-white shadow-sm"
        >
          <FiBriefcase size={14} />
          Recruiter
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="ENTER YOUR FULL NAME"
          leftIcon={<FiUser className="text-gray-400 group-focus-within:text-primary transition-colors" />}
          error={errors.full_name?.message}
          required
          {...register('full_name')}
          className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary/50"
          labelClassName="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1"
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="HR@COMPANY.COM"
          leftIcon={<FiMail className="text-gray-400 group-focus-within:text-primary transition-colors" />}
          error={errors.email?.message}
          required
          {...register('email')}
          className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary/50"
          labelClassName="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            placeholder="ACME INC."
            leftIcon={<FiBriefcase className="text-gray-400 group-focus-within:text-primary transition-colors" />}
            error={errors.company_name?.message}
            required
            {...register('company_name')}
            className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary/50"
            labelClassName="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1"
          />
          <Input
            label="Company Email"
            type="email"
            placeholder="OFFICIAL EMAIL"
            error={errors.company_email?.message}
            required
            {...register('company_email')}
            className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary/50"
            labelClassName="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="NTN Number"
            placeholder="XXXXXXX-X"
            error={errors.ntn_number?.message}
            required
            {...register('ntn_number')}
            className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary/50"
            labelClassName="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1"
          />
          <Input
            label="Discovery Date"
            type="date"
            leftIcon={<FiCalendar className="text-gray-400 group-focus-within:text-primary transition-colors" />}
            error={errors.interview_date?.message}
            required
            {...register('interview_date')}
            className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary/50"
            labelClassName="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1"
          />
        </div>

        {/* File Upload - Styled for White/Green Theme */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 ml-1">
            Approval Letter <span className="text-primary">*</span>
          </label>
          <div
            className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-300 bg-gray-50 ${
              fileError ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-primary hover:bg-white'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
              id="approval-letter"
            />
            <label htmlFor="approval-letter" className="cursor-pointer block">
              <FiUpload className={`w-8 h-8 mx-auto mb-2 transition-colors ${approvalLetter ? 'text-primary' : 'text-gray-400'}`} />
              {approvalLetter ? (
                <p className="text-xs text-primary font-bold uppercase tracking-wider">{approvalLetter.name}</p>
              ) : (
                <>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Upload Credentials</p>
                  <p className="text-[8px] text-gray-500 mt-1 uppercase">PDF, JPEG, PNG (MAX 5MB)</p>
                </>
              )}
            </label>
          </div>
          {fileError && <p className="mt-2 text-[9px] font-bold text-red-500 uppercase tracking-widest text-center">{fileError}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<FiLock className="text-gray-400 group-focus-within:text-primary transition-colors" />}
              error={errors.password?.message}
              required
              {...register('password')}
              className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary/50"
              labelClassName="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-primary transition-colors"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<FiLock className="text-gray-400 group-focus-within:text-primary transition-colors" />}
              error={errors.confirm_password?.message}
              required
              {...register('confirm_password')}
              className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary/50"
              labelClassName="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-primary transition-colors"
            >
              {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mt-2">
          <div className="flex gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
             <p className="text-[9px] text-primary font-bold uppercase tracking-widest leading-relaxed">
                Verification: Your account will be reviewed by administrators after submission.
             </p>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest h-12 rounded-xl shadow-md transition-all"
          >
            Submit for Approval
          </Button>
        </div>
      </form>

      {/* Login Link */}
      <p className="text-center mt-6">
          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">Joined us before? </span>
          <Link
            href="/auth/login"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-600 hover:text-green-500 transition-colors underline decoration-green-600/30 underline-offset-4"
          >
            Back to Login
          </Link>
      </p>
    </div>
  );
}
