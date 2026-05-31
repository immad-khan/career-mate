'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Spinner from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('job_seeker' | 'hr' | 'admin')[];
  requireVerified?: boolean;
  requireApproved?: boolean; // For HR
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  requireVerified = true,
  requireApproved = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth, hrApprovalStatus } = useAuthStore();

  useEffect(() => {
    const verify = async () => {
      const isAuth = await checkAuth();

      if (!isAuth) {
        router.push('/auth/login');
        return;
      }
    };

    verify();
  }, [checkAuth, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  // Check email verification
  if (requireVerified && !user.is_email_verified) {
    router.push('/auth/verify-email');
    return null;
  }

  // Check role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    router.push('/dashboard');
    return null;
  }

  // Check HR approval
  if (requireApproved && user.role === 'hr' && hrApprovalStatus !== 'approved') {
    // Allow access but show pending message in the component
  }

  return <>{children}</>;
}
