import BeautifulAuthLayout from '@/components/beautiful-auth-layout';
import HRRegisterForm from '@/components/forms/HRRegisterForm';
import registerPic from "@/register.jpg"

export default function HRRegisterPage() {
  return (
    <BeautifulAuthLayout
      title="HR Recruitment"
      subtitle="Assemble your elite team with AI precision"
      image={registerPic}
    >
      <HRRegisterForm />
    </BeautifulAuthLayout>
  );
}
