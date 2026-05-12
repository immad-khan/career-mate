import Link from 'next/link';
import Logo from '@/components/shared/Logo';
import Button from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-indigo-50">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Logo size="lg" />
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/register/job-seeker">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Your All-in-One
            <span className="bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {' '}Career Development{' '}
            </span>
            Platform
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Build professional resumes, find your dream job, prepare for interviews, 
            and grow your skills with AI-powered tools.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register/job-seeker">
              <Button size="lg" className="w-full sm:w-auto">
                Start Your Journey
              </Button>
            </Link>
            <Link href="/auth/register/hr">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                I'm Hiring
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: '📄', title: 'Resume Builder', desc: 'Create professional resumes with AI-powered templates' },
            { icon: '🔍', title: 'Job Search', desc: 'Find jobs from multiple platforms in one place' },
            { icon: '🎯', title: 'Interview Prep', desc: 'Practice with mock interviews and get instant feedback' },
            { icon: '🤖', title: 'SkillBot AI', desc: 'Get personalized learning roadmaps for any skill' },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-gray-500">
          <p>© 2025 CareerMate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
