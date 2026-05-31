import { Suspense } from 'react';
import BeautifulAuthLayout from '@/components/beautiful-auth-layout';
import VerifyEmailForm from '@/components/forms/VerifyEmailForm';
import Spinner from '@/components/ui/spinner';
import registerPic from "@/register.jpg"

export default function VerifyEmailPage() {
  return (
    <BeautifulAuthLayout
      title="Access Verification"
      subtitle="Enter the decryption code sent to your terminal"
      image={registerPic}
    >
      <Suspense fallback={<Spinner size="lg" className="mx-auto" />}>
        <VerifyEmailForm />
      </Suspense>
    </BeautifulAuthLayout>
  );
}
