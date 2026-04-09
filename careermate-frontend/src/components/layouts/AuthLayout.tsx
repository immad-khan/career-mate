"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Logo from "@/components/shared/Logo"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export default function BeautifulAuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-indigo-700 p-12 flex-col justify-between overflow-hidden">
          <div
            className="transform transition-all duration-700"
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? "translateX(0)" : "translateX(-30px)",
            }}
          >
            <Logo size="lg" className="text-white" />
          </div>

          <div className="space-y-6">
            <h1
              className="text-4xl font-bold text-white leading-tight transform transition-all duration-700"
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "translateY(0)" : "translateY(20px)",
                transitionDelay: isLoaded ? "100ms" : "0ms",
              }}
            >
              Your All-in-One Career Development Platform
            </h1>
            <p
              className="text-purple-100 text-lg transform transition-all duration-700"
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "translateY(0)" : "translateY(20px)",
                transitionDelay: isLoaded ? "200ms" : "0ms",
              }}
            >
              Build professional resumes, find your dream job, prepare for interviews, and grow your skills — all in one
              place.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-8">
              {[
                { icon: "📄", text: "Resume Builder" },
                { icon: "🔍", text: "Job Search" },
                { icon: "🎯", text: "Interview Prep" },
                { icon: "🤖", text: "SkillBot AI" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white/10 rounded-lg p-3 transform transition-all duration-700 hover:bg-white/20 hover:scale-105 hover:shadow-lg cursor-default"
                  style={{
                    opacity: isLoaded ? 1 : 0,
                    transform: isLoaded ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
                    transitionDelay: isLoaded ? `${300 + index * 50}ms` : "0ms",
                  }}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-white font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p
            className="text-purple-200 text-sm transform transition-all duration-700"
            style={{
              opacity: isLoaded ? 1 : 0,
              transitionDelay: isLoaded ? "500ms" : "0ms",
            }}
          >
            © 2025 CareerMate. All rights reserved.
          </p>
        </div>

        {/* Right Side - Form */}
        <div
          className="w-full lg:w-1/2 flex items-center justify-center p-8 transform transition-all duration-700"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(20px)",
            transitionDelay: isLoaded ? "300ms" : "0ms",
          }}
        >
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div
              className="lg:hidden text-center mb-8 transform transition-all duration-700"
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "translateY(0) scale(1)" : "translateY(-20px) scale(0.9)",
                transitionDelay: isLoaded ? "100ms" : "0ms",
              }}
            >
              <Logo size="lg" />
            </div>

            {/* Header */}
            <div
              className="text-center mb-8 transform transition-all duration-700"
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "translateY(0)" : "translateY(20px)",
                transitionDelay: isLoaded ? "200ms" : "0ms",
              }}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {title}
              </h2>
              {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
            </div>

            {/* Form Content */}
            <div
              className="transform transition-all duration-700"
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "translateY(0)" : "translateY(20px)",
                transitionDelay: isLoaded ? "300ms" : "0ms",
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
