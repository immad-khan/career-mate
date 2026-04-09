"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import BeautifulAuthLayout from "@/components/beautiful-auth-layout"
import registerPic from "@/register.jpg"
import { FiUser, FiBriefcase, FiChevronRight } from "react-icons/fi"

export default function RegisterPage() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <BeautifulAuthLayout
      title="Create Account"
      subtitle="Join the AI-powered career evolution"
      image={registerPic}
    >
      <div className={`space-y-4 transition-all duration-1000 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        <div className="space-y-4">
          {/* Job Seeker Card */}
          <button
            onClick={() => router.push("/auth/register/job-seeker")}
            className="w-full relative group cursor-pointer p-6 rounded-2xl border border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 text-left shadow-sm"
          >
            <div className="flex items-center gap-5">
              <div className="shrink-0 w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <FiUser size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold uppercase tracking-tight text-gray-900 group-hover:text-primary transition-colors">
                  Job Seeker
                </h3>
                <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider leading-relaxed">
                  Build AI Resumes & Track Markets
                </p>
              </div>
              <FiChevronRight className="text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" size={20} />
            </div>
          </button>

          {/* HR Card */}
          <button
            onClick={() => router.push("/auth/register/hr")}
            className="w-full relative group cursor-pointer p-6 rounded-2xl border border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 text-left shadow-sm"
          >
            <div className="flex items-center gap-5">
              <div className="shrink-0 w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <FiBriefcase size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold uppercase tracking-tight text-gray-900 group-hover:text-primary transition-colors">
                  HR / Recruiter
                </h3>
                <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider leading-relaxed">
                  Post Jobs & Manage Talent
                </p>
              </div>
              <FiChevronRight className="text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" size={20} />
            </div>
          </button>
        </div>

        {/* Already have account link */}
        <div className="text-center mt-10">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            Joined us before?{" "}
            <a
              href="/auth/login"
              className="text-primary hover:text-primary/80 transition-colors underline decoration-primary/30 underline-offset-4"
            >
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </BeautifulAuthLayout>
  )
}
