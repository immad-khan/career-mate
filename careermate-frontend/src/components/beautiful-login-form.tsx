"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiBriefcase, FiShield } from "react-icons/fi"

import Input from "@/components/ui/input"
import Button from "@/components/ui/button"
import { authAPI } from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { getErrorMessage } from "@/lib/utils"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["job_seeker", "hr", "admin"]),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function BeautifulLoginForm() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"job_seeker" | "hr" | "admin">("job_seeker")

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: "job_seeker",
    },
  })

  // Sync role value when selection changes
  useEffect(() => {
    setValue("role", selectedRole)
  }, [selectedRole, setValue])

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

        toast.success("Identity Verified")

        if (response.data.user.role === "admin") {
          router.push("/dashboard/admin")
        } else if (response.data.user.role === "hr" && response.data.hr_approval_status !== "approved") {
          router.push("/auth/pending-approval")
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

  return (
    <div className={`space-y-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* Role Selection - Green Theme */}
      <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
        <button
          type="button"
          onClick={() => setSelectedRole("job_seeker")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
            selectedRole === "job_seeker"
              ? "bg-primary text-white shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FiUser size={14} />
          Job Seeker
        </button>
        <button
          type="button"
          onClick={() => setSelectedRole("hr")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
            selectedRole === "hr"
              ? "bg-primary text-white shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FiBriefcase size={14} />
          Recruiter
        </button>
        <button
          type="button"
          onClick={() => setSelectedRole("admin")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
            selectedRole === "admin"
              ? "bg-primary text-white shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FiShield size={14} />
          Admin
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="Identifier"
            type="email"
            placeholder="ENTER YOUR EMAIL"
            leftIcon={<FiMail className="text-gray-400 group-focus-within:text-primary transition-colors" />}
            error={errors.email?.message}
            {...register("email")}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50"
            labelClassName="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1"
          />
        </div>

        <div className="relative">
          <Input
            label="Access Key"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<FiLock className="text-gray-400 group-focus-within:text-primary transition-colors" />}
            error={errors.password?.message}
            {...register("password")}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50"
            labelClassName="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-primary transition-colors"
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        </div>

        <div className="flex items-center justify-between pb-2">
           <Link
            href="/auth/forgot-password"
            className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
          >
            forgot password
          </Link>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest h-12 rounded-xl shadow-md transition-all"
        >
          login
        </Button>

        <p className="text-center mt-8">
          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">new user </span>
          <Link
            href="/auth/register"
            className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors underline decoration-primary/30 underline-offset-4"
          >
            sign up
          </Link>
        </p>
      </form>
    </div>
  )
}
