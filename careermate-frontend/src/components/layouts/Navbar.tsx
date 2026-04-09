"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useAuthStore } from "@/store/authStore"
import { getInitials } from "@/lib/utils"
import Badge from "@/components/ui/Badge"
import { FiMenu, FiSearch, FiBell, FiChevronDown, FiUser, FiSettings, FiLogOut, FiCreditCard } from "react-icons/fi"

interface NavbarProps {
  onMenuClick: () => void
}

export default function BeautifulNavbar({ onMenuClick }: NavbarProps) {
  const router = useRouter()
  const { user, profile, logout, hrApprovalStatus } = useAuthStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  const getTokenBalance = () => {
    if (user?.role === "job_seeker" && profile && "tokens_balance" in profile) {
      return profile.tokens_balance
    }
    return null
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .navbar-header {
          animation: slideDown 0.6s ease-out forwards;
        }

        .navbar-left-group {
          animation: slideInLeft 0.6s ease-out 0.1s forwards;
          opacity: 0;
        }

        .navbar-right-group {
          animation: slideInRight 0.6s ease-out 0.1s forwards;
          opacity: 0;
        }

        .navbar-token-badge {
          animation: fadeInScale 0.6s ease-out 0.2s forwards;
          opacity: 0;
        }

        .navbar-notification {
          animation: fadeInScale 0.6s ease-out 0.3s forwards;
          opacity: 0;
        }

        .navbar-user-menu {
          animation: fadeInScale 0.6s ease-out 0.4s forwards;
          opacity: 0;
        }

        .dropdown-menu {
          animation: fadeInScale 0.3s ease-out forwards;
        }

        .menu-item {
          transition: all 0.2s ease;
        }

        .menu-item:hover {
          background-color: rgba(139, 92, 246, 0.05);
        }

        .icon-button {
          transition: all 0.3s ease;
        }

        .icon-button:hover {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
          transform: translateY(-2px);
        }

        .navbar-chevron {
          transition: transform 0.3s ease;
        }
      `}</style>

      <div className="navbar-header flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Left side */}
        <div className="navbar-left-group flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="icon-button lg:hidden p-2 rounded-lg hover:bg-gradient-to-br hover:from-purple-100 hover:to-indigo-100 transition-all"
          >
            <FiMenu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg px-3 py-2 w-64 border border-gray-200 hover:border-purple-300 transition-colors">
            <FiSearch className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm text-gray-600 placeholder:text-gray-400 w-full"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="navbar-right-group flex items-center gap-3">
          {/* Token Balance (Job Seeker only) */}
          {getTokenBalance() !== null && (
            <div className="navbar-token-badge hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-1.5 rounded-lg border border-purple-200 hover:border-purple-400 transition-colors">
              <FiCreditCard className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">{getTokenBalance()} Tokens</span>
            </div>
          )}

          {/* Notifications */}
          <button className="navbar-notification icon-button relative p-2 rounded-lg hover:bg-gradient-to-br hover:from-blue-100 hover:to-indigo-100 transition-all">
            <FiBell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-md" />
          </button>

          {/* User Dropdown */}
          <div className="navbar-user-menu relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gradient-to-br hover:from-purple-100 hover:to-indigo-100 transition-all"
            >
              {/* Avatar */}
              {user?.profile_picture_url ? (
                <img
                  src={user.profile_picture_url || "/placeholder.svg"}
                  alt={user.full_name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-200 hover:ring-purple-400 transition-all"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center ring-2 ring-purple-200">
                  <span className="text-white text-sm font-medium">{user ? getInitials(user.full_name) : "?"}</span>
                </div>
              )}

              {/* Name & Role (hidden on mobile) */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">{user?.full_name}</p>
                <div className="mt-0.5">{getRoleBadge()}</div>
              </div>

              <FiChevronDown className={`navbar-chevron w-4 h-4 text-gray-400 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="dropdown-menu absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                {/* User Info (mobile) */}
                <div className="md:hidden px-4 py-2 border-b border-gray-100">
                  <p className="font-medium text-gray-900">{user?.full_name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <div className="mt-1">{getRoleBadge()}</div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  {user?.role !== "admin" && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false)
                        router.push("/dashboard/profile")
                      }}
                      className="menu-item flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700"
                    >
                      <FiUser className="w-4 h-4" />
                      Profile
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      router.push("/dashboard/settings")
                    }}
                    className="menu-item flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700"
                  >
                    <FiSettings className="w-4 h-4" />
                    Settings
                  </button>

                  {user?.role === "job_seeker" && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false)
                        router.push("/dashboard/tokens")
                      }}
                      className="menu-item flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 sm:hidden"
                    >
                      <FiCreditCard className="w-4 h-4" />
                      My Tokens ({getTokenBalance()})
                    </button>
                  )}
                </div>

                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={handleLogout}
                    className="menu-item flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
