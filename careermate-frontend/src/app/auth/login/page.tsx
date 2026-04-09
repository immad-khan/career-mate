import BeautifulAuthLayout from "@/components/beautiful-auth-layout"
import BeautifulLoginForm from "@/components/beautiful-login-form"

export default function LoginPage() {
  return (
    <BeautifulAuthLayout title="Welcome back" subtitle="Sign in to your CareerMate account">
      <BeautifulLoginForm />
    </BeautifulAuthLayout>
  )
}
