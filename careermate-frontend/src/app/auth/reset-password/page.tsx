import { Suspense } from 'react';
import AuthLayout from '@/components/layouts/AuthLayout';
import ResetPasswordForm from '@/components/forms/ResetPasswordForm';
import Spinner from '@/components/ui/Spinner';

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter the code and create a new password"
    >
      <Suspense fallback={<Spinner size="lg" className="mx-auto" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
