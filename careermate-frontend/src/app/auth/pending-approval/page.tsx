"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import BeautifulAuthLayout from "@/components/beautiful-auth-layout"
import { FiClock, FiShield,  FiLogOut } from "react-icons/fi"
import registerPic from "@/register.jpg"
import Button from "@/components/ui/Button"

export default function PendingApprovalPage() {
  const { user, hrApprovalStatus, logout } = useAuthStore()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    if (user?.role === "hr" && hrApprovalStatus === "approved") {
      router.push("/dashboard")
    } else if (user && user.role !== "hr") {
        router.push("/dashboard")
    }
  }, [user, hrApprovalStatus, router])

  const handleLogout = async () => {
    await logout()
    router.push("/auth/login")
  }

  return (
    <BeautifulAuthLayout
      title="Access Pending"
      subtitle="Security verification in progress"
      image={registerPic}
    >
      <div className={`space-y-8 text-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-green-50 rounded-3xl flex items-center justify-center mx-auto border border-green-100 shadow-sm animate-pulse">
            <FiClock className="w-10 h-10 text-green-600" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-green-100 rounded-xl shadow-sm flex items-center justify-center">
             <FiShield className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest">
            Identity Processing
          </h2>
          <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-xs mx-auto uppercase tracking-wider">
            Your recruiter credentials are currently being validated by our security team. Access to the HR terminal will be granted shortly after verification.
          </p>
        </div>

        <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
           <p className="text-[10px] font-bold text-green-600 uppercase tracking-[0.2em]">
             Status: {hrApprovalStatus?.toUpperCase() || 'EVALUATING'}
           </p>
        </div>

        <div className="pt-4 space-y-3">
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-[0.2em] h-12 rounded-xl shadow-md"
          >
            Check Status
          </Button>
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 mx-auto text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-green-600 transition-colors"
          >
            <FiLogOut /> Exit System
          </button>
        </div>
      </div>
    </BeautifulAuthLayout>
  )
}
