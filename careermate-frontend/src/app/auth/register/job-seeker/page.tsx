import BeautifulAuthLayout from '@/components/beautiful-auth-layout';
import JobSeekerRegisterForm from '@/components/forms/JobSeekerRegisterForm';
import registerPic from "@/register.jpg"

export default function JobSeekerRegisterPage() {
  return (
    <BeautifulAuthLayout
      title="Job Seeker"
      subtitle="Join the evolution of professional recruitment"
      image={registerPic}
    >
      <JobSeekerRegisterForm />
    </BeautifulAuthLayout>
  );
}
