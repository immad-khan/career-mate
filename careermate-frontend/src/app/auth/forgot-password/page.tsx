import AuthLayout from '@/components/layouts/AuthLayout';
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="No worries, we'll help you reset it"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
