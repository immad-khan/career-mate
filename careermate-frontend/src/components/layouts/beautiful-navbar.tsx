"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useAuthStore } from "@/store/authStore"
import { getInitials } from "@/lib/utils"
import Badge from "@/components/ui/Badge"
import Logo from "@/components/shared/Logo"
import { FiMenu, FiSearch, FiBell, FiChevronDown, FiUser, FiSettings, FiLogOut, FiCreditCard } from "react-icons/fi"

interface BeautifulNavbarProps {
  onMenuClick: () => void
}

export default function BeautifulNavbar({ onMenuClick }: BeautifulNavbarProps) {
  const router = useRouter()
  const { user, profile, logout, hrApprovalStatus } = useAuthStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const dashboardHref = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success("Logged out successfully")
    router.push("/auth/login")
  }

  const getRoleBadge = () => {
    if (!user) return null

    switch (user.role) {
      case "admin":
        return <Badge variant="danger">Admin</Badge>
      case "hr":
        if (hrApprovalStatus === "pending") {
          return <Badge variant="warning">HR (Pending)</Badge>
        } else if (hrApprovalStatus === "approved") {
          return <Badge variant="success">HR</Badge>
        } else if (hrApprovalStatus === "rejected") {
          return <Badge variant="danger">HR (Rejected)</Badge>
        }
        return <Badge variant="info">HR</Badge>
      case "job_seeker":
        return <Badge variant="info">Job Seeker</Badge>
      default:
        return null
    }
  }

  const userInitials = user ? getInitials(user.full_name) : "U"

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Menu Button & Search */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <FiMenu size={24} />
            </button>

            {/* Logo */}
            <Logo size="md" href={dashboardHref} className="hidden sm:block" />

            {/* Search Bar */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>

          {/* Right Side - Notifications & User Menu */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
              <FiBell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold shadow-sm">
                    {userInitials}
                  </div>

                  {/* User Info */}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                    <div className="flex items-center gap-2">
                      {getRoleBadge()}
                    </div>
                  </div>

                  <FiChevronDown
                    className={`hidden md:block text-gray-600 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    size={16}
                  />
                </div>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-in fade-in slide-in-from-top-5 duration-200">
                  {/* User Info (Mobile) */}
                  <div className="md:hidden px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <div className="mt-2">{getRoleBadge()}</div>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={() => {
                      router.push("/dashboard/profile")
                      setIsDropdownOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                  >
                    <FiUser size={16} />
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      router.push("/dashboard/settings")
                      setIsDropdownOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                  >
                    <FiSettings size={16} />
                    Settings
                  </button>

                  {user?.role === "job_seeker" && (
                    <button
                      onClick={() => {
                        router.push("/dashboard/tokens")
                        setIsDropdownOpen(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                    >
                      <FiCreditCard size={16} />
                      Tokens
                    </button>
                  )}

                  <div className="border-t border-gray-100 my-2"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <FiLogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
  )
}
