'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiMail, FiArrowLeft } from 'react-icons/fi';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authAPI } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      const response = await authAPI.forgotPassword(data);

      if (response.success) {
        setEmail(data.email);
        setIsSubmitted(true);
        toast.success('Password reset code sent!');
      }
    } catch (error: any) {
      const message = getErrorMessage(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-3xl">✉️</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Check your email</h3>
          <p className="text-gray-600 mt-2">
            We've sent a password reset code to <strong>{email}</strong>
          </p>
        </div>
        <Button
          onClick={() => router.push(`/auth/reset-password?email=${email}`)}
          className="w-full"
        >
          Enter Reset Code
        </Button>
        <button
          onClick={() => setIsSubmitted(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Didn't receive? Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔐</span>
        </div>
        <p className="text-gray-600">
          Enter your email and we'll send you a code to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<FiMail className="w-5 h-5" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          Send Reset Code
        </Button>
      </form>

      <Link
        href="/auth/login"
        className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back to Login
      </Link>
    </div>
  );
}