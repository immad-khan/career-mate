'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiMail, FiRefreshCw } from 'react-icons/fi';

import Button from '@/components/ui/button';
import { authAPI } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { setAuth } = useAuthStore();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const chars = value.slice(0, 6).split('');
      const newOtp = [...otp];
      chars.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.verifyEmail({ email, otp: otpCode });

      if (response.success) {
        toast.success(response.message || 'Email verified successfully!');
        
        // Save auth data
        setAuth(
          response.data.user,
          response.data.profile,
          response.data.tokens,
          response.data.hr_approval_status
        );

        // Redirect based on role
        if (response.data.user.role === 'admin') {
          router.push('/dashboard/admin');
        } else if (response.data.user.role === 'hr' && response.data.hr_approval_status !== 'approved') {
          router.push('/auth/pending-approval');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      const message = getErrorMessage(error);
      toast.error(message);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    setResending(true);
    try {
      const response = await authAPI.resendOTP(email);
      if (response.success) {
        toast.success('New verification code sent!');
        setTimer(60);
      }
    } catch (error: any) {
      const message = getErrorMessage(error);
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
          <FiMail className="w-8 h-8 text-primary" />
        </div>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Sent access code to</p>
        <p className="font-bold text-sm text-gray-900 mt-1 uppercase tracking-widest">{email}</p>
      </div>

      <div className="flex justify-center gap-2 sm:gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            className="w-10 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-white border border-gray-200 rounded-xl text-primary focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
          />
        ))}
      </div>

      <div className="space-y-4">
        <Button
          onClick={handleVerify}
          isLoading={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest h-12 rounded-xl shadow-md transition-all"
          disabled={otp.join('').length !== 6}
        >
          Verify Account
        </Button>

        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={timer > 0 || resending}
            className={`flex items-center justify-center mx-auto text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
              timer > 0 || resending
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-green-600 hover:text-green-500 underline decoration-green-600/30'
            }`}
          >
            <FiRefreshCw className={`mr-2 ${resending ? 'animate-spin' : ''}`} />
            {timer > 0 ? `Retry in ${timer}s` : 'Request New Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
