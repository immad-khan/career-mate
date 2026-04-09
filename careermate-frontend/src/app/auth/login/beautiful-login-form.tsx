"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi"

import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import GoogleButton from "@/components/shared/GoogleButton"
import { authAPI } from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { getErrorMessage } from "@/lib/utils"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  role: z.string().min(1, "Role is required"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function BeautifulLoginForm() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedRole, setSelectedRole] = useState("job_seeker")

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      const response = await authAPI.login({
        email: data.email,
        password: data.password,
        role: selectedRole,
      })

      if (response.success) {
        setAuth(response.data.user, response.data.profile, response.data.tokens, response.data.hr_approval_status)

        toast.success("Login successful!")

        if (response.data.user.role === "admin") {
          router.push("/dashboard/admin")
        } else {
          router.push("/dashboard")
        }
      }
    } catch (error: any) {
      const message = getErrorMessage(error)

      if (error.response?.status === 403 && error.response?.data?.data?.email_verified === false) {
        toast.error("Please verify your email first")
        router.push(`/auth/verify-email?email=${data.email}`)
        return
      }

      setError("email", { message })
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    toast.error("Google login coming soon!")
  }

  return (
    <div className={`transition-all duration-1000 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
      {/* Header with logo - CHANGE: enhanced with animation */}
      <div
        className={`mb-8 text-center transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <h1 className="text-4xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600 text-sm">Sign in to your account to continue</p>
      </div>

      {/* Google Login with animation - CHANGE: staggered animation delay */}
      <div
        className={`transition-all duration-700 delay-150 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <GoogleButton onClick={handleGoogleLogin} />
      </div>

      {/* Divider with animation - CHANGE: animated divider */}
      <div className={`relative my-8 transition-all duration-700 delay-200 ${isVisible ? "opacity-100" : "opacity-0"}`}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gradient-to-r from-gray-200 via-purple-200 to-gray-200 shadow-sm" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-linear-to-b from-white to-gray-50 text-gray-500 font-medium">
            or continue with email
          </span>
        </div>
      </div>

      {/* Login Form - CHANGE: enhanced with staggered animations */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Input with animation */}
        <div
          className={`transition-all duration-700 delay-250 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            leftIcon={<FiMail className="w-5 h-5" />}
            error={errors.email?.message}
            {...register("email")}
            className="group hover:shadow-lg transition-shadow duration-300"
          />
        </div>

        {/* Password Input with animation */}
        <div
          className={`transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<FiLock className="w-5 h-5" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none transition-transform duration-200 hover:scale-110"
              >
                {showPassword ? (
                  <FiEyeOff className="w-5 h-5 text-gray-500" />
                ) : (
                  <FiEye className="w-5 h-5 text-gray-500" />
                )}
              </button>
            }
            error={errors.password?.message}
            {...register("password")}
            className="hover:shadow-lg transition-shadow duration-300"
          />
        </div>

        {/* Remember me and Forgot password with animation */}
        <div
          className={`flex items-center justify-between transition-all duration-700 delay-350 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <label className="flex items-center group cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 transition-colors duration-200"
            />
            <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Remember me</span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors duration-200 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Sign In Button with animation */}
        <div
          className={`transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 active:scale-95"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </form>

      {/* Register Link with animation - CHANGE: smooth entrance and hover effects */}
      <div
        className={`text-center pt-2 transition-all duration-700 delay-450 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <p className="text-gray-600 text-sm">
          Don't have an account?{" "}
          <Link
            href="/auth/register/job-seeker"
            className="font-semibold text-purple-600 hover:text-purple-700 transition-colors duration-200 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
