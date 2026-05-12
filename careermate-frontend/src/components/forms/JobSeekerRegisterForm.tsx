"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiBriefcase } from "react-icons/fi"

import Input from "@/components/ui/input"
import Button from "@/components/ui/button"
import GoogleButton from "@/components/shared/GoogleButton"
import { authAPI } from "@/lib/api"
import { getErrorMessage } from "@/lib/utils"

const registerSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirm_password: z.string(),
    university: z.string().optional(),
    graduation_year: z.string().optional(),
    skills: z.string().min(1, "Please enter at least one skill"),
    experience_level: z.string().min(1, "Experience level is required"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export default function BeautifulJobSeekerRegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)

    try {
      const payload = {
        ...data,
        graduation_year: data.graduation_year ? Number.parseInt(data.graduation_year) : undefined,
        skills: data.skills.split(",").map(s => s.trim()), // Backend usually expects array
      }

      const response = await authAPI.registerJobSeeker(payload)

      if (response.success) {
        toast.success("Registration successful! Please check your email for verification code.")
        router.push(`/auth/verify-email?email=${data.email}`)
      }
    } catch (error: any) {
      const message = getErrorMessage(error)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Remove handleGoogleRegister if not used
  // const handleGoogleRegister = () => {
  //   toast.error("Google registration coming soon!")
  // }

  return (
    <div className="space-y-6">
      {/* Role Switcher - Green Theme */}
      <div className="flex rounded-xl bg-gray-50 p-1 border border-gray-100">
        <Link
          href="/auth/register/job-seeker"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg bg-primary text-white shadow-sm"
        >
          <FiUser size={14} />
          Job Seeker
        </Link>
        <Link
          href="/auth/register/hr"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg text-gray-400 hover:text-gray-600 transition-all"
        >
          <FiBriefcase size={14} />
          Recruiter
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="ENTER YOUR FULL NAME"
            leftIcon={<FiUser className="text-gray-400 group-focus-within:text-primary transition-colors" />}
            error={errors.full_name?.message}
            {...register("full_name")}
            className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary/50"
            labelClassName="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1"
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="EMAIL@EXAMPLE.COM"
            leftIcon={<FiMail className="text-gray-400 group-focus-within:text-primary transition-colors" />}
            error={errors.email?.message}
            {...register("email")}
            className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary/50"
            labelClassName="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="University"
            placeholder="UNIVERSITY NAME"
            error={errors.university?.message}
            {...register("university")}
            className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary/50"
            labelClassName="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1"
          />
          <Input
            label="Graduation"
            placeholder="YEAR"
            error={errors.graduation_year?.message}
            {...register("graduation_year")}
            className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary/50"
            labelClassName="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Key Skills"
            placeholder="e.g. Python, React, AI (Comma separated)"
            error={errors.skills?.message}
            {...register("skills")}
            className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary/50"
            labelClassName="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1"
          />
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 pl-1">Experience Level</label>
            <select
              {...register("experience_level")}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 h-11 text-xs text-gray-900 focus:outline-none focus:border-primary/50 transition-all appearance-none"
            >
              <option value="" className="bg-white">SELECT LEVEL</option>
              <option value="entry" className="bg-white">ENTRY LEVEL</option>
              <option value="intermediate" className="bg-white">INTERMEDIATE</option>
              <option value="senior" className="bg-white">SENIOR</option>
              <option value="expert" className="bg-white">EXPERT</option>
            </select>
            {errors.experience_level?.message && (
              <p className="text-[10px] text-red-500 mt-1 pl-1">{errors.experience_level.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              leftIcon={<FiLock className="text-gray-400 group-focus-within:text-primary transition-colors" />}
              error={errors.password?.message}
              {...register("password")}
              className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary/50"
              labelClassName="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-primary transition-colors"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirm"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              leftIcon={<FiLock className="text-gray-400 group-focus-within:text-primary transition-colors" />}
              error={errors.confirm_password?.message}
              {...register("confirm_password")}
              className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary/50"
              labelClassName="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-primary transition-colors"
            >
              {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest h-12 rounded-xl shadow-md transition-all"
          >
            Complete Registration
          </Button>
        </div>

        <p className="text-center mt-6">
          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Already a member? </span>
          <Link
            href="/auth/login"
            className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors underline decoration-primary/30 underline-offset-4"
          >
            Access Portal
          </Link>
        </p>
      </form>
    </div>
  );
}
