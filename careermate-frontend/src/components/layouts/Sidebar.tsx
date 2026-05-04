"use client"
import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Logo from "@/components/shared/Logo"
import { useAuthStore } from "@/store/authStore"
import {
  FiHome,
  FiFileText,
  FiSearch,
  FiBriefcase,
  FiMessageSquare,
  FiTrendingUp,
  FiUser,
  FiSettings,
  FiUsers,
  FiCheckCircle,
  FiBarChart2,
  FiX,
  FiCreditCard,
  FiLogOut,
  FiActivity,
  FiLock,
  FiLayers,
} from "react-icons/fi"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles: ("job_seeker" | "hr" | "admin")[]
  badge?: string
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <FiHome className="w-5 h-5" />,
    roles: ["job_seeker", "hr", "admin"],
  },
  {
    label: "Resume Builder",
    href: "/dashboard/resume-builder",
    icon: <FiFileText className="w-5 h-5" />,
    roles: ["job_seeker"],
  },
  {
    label: "SkillBot",
    href: "/dashboard/skillbot",
    icon: <FiTrendingUp className="w-5 h-5" />,
    roles: ["job_seeker"],
  },
  {
    label: "Market Trends",
    href: "/dashboard/trends",
    icon: <FiActivity className="w-5 h-5" />,
    roles: ["job_seeker"],
  },
  {
    label: "Job Crawler",
    href: "/dashboard/jobs",
    icon: <FiSearch className="w-5 h-5" />,
    roles: ["job_seeker"],
  },
  {
    label: "Cover Letter Generator",
    href: "/dashboard/cover-letter",
    icon: <FiCheckCircle className="w-5 h-5" />,
    roles: ["job_seeker"],
  },
  {
    label: "Cold Email Generator",
    href: "/dashboard/cold-email",
    icon: <FiUsers className="w-5 h-5" />,
    roles: ["job_seeker"],
  },
  {
    label: "Mock Interview Quiz",
    href: "/dashboard/interview",
    icon: <FiMessageSquare className="w-5 h-5" />,
    roles: ["job_seeker"],
  },
  {
    label: "Skill Roadmap",
    href: "/dashboard/roadmap",
    icon: <FiCheckCircle className="w-5 h-5" />,
    roles: ["job_seeker"],
  },
  {
    label: "My Tokens",
    href: "/dashboard/tokens",
    icon: <FiCreditCard className="w-5 h-5" />,
    roles: ["job_seeker"],
  },
  {
    label: "Post Job",
    href: "/dashboard/post-job",
    icon: <FiBriefcase className="w-5 h-5" />,
    roles: ["hr"],
  },
  {
    label: "My Job Listings",
    href: "/dashboard/my-jobs",
    icon: <FiFileText className="w-5 h-5" />,
    roles: ["hr"],
  },
  {
    label: "Applications",
    href: "/dashboard/hr-applications",
    icon: <FiUsers className="w-5 h-5" />,
    roles: ["hr"],
  },
  {
    label: "Statistics",
    href: "/dashboard/admin",
    icon: <FiBarChart2 className="w-5 h-5" />,
    roles: ["admin"],
  },
  {
    label: "All Users",
    href: "/dashboard/admin/users",
    icon: <FiUsers className="w-5 h-5" />,
    roles: ["admin"],
  },
  {
    label: "HR Approvals",
    href: "/dashboard/admin/hr-approvals",
    icon: <FiCheckCircle className="w-5 h-5" />,
    roles: ["admin"],
  },
  {
    label: "Profile Information",
    href: "/dashboard/settings?tab=profile",
    icon: <FiUser className="w-5 h-5" />,
    roles: ["admin"],
  },
  {
    label: "Security & Privacy",
    href: "/dashboard/settings?tab=security",
    icon: <FiLock className="w-5 h-5" />,
    roles: ["admin"],
  },
  {
    label: "Appearance",
    href: "/dashboard/settings?tab=theme",
    icon: <FiLayers className="w-5 h-5" />,
    roles: ["admin"],
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: <FiUser className="w-5 h-5" />,
    roles: ["job_seeker", "hr"],
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <FiSettings className="w-5 h-5" />,
    roles: ["job_seeker", "hr"],
  },
]

export default function BeautifulSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success("Logged out successfully")
    onClose()
    router.push("/auth/login")
  }

  const filteredNavItems = navItems.filter((item) => user && item.roles.includes(user.role))

  const mainItems = filteredNavItems.filter((item) => !["Profile", "Settings"].includes(item.label))
  const bottomItems = filteredNavItems.filter((item) => ["Profile", "Settings"].includes(item.label))

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className={cn(
            "fixed inset-0 z-40 lg:hidden transition-opacity duration-300",
            "bg-gray-200/40 backdrop-blur-md",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full text-gray-700">
          {/* Logo */}
          <div
            className={cn(
              "flex items-center justify-between px-6 py-5 border-b border-gray-100 transition-all duration-500",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
            )}
          >
            <Logo size="md" />
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-1">
              {mainItems.map((item, index) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && item.href !== "/dashboard/admin" && pathname.startsWith(item.href))

                return (
                  <li
                    key={item.href}
                    className={cn(
                      "transition-all duration-500",
                      mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8",
                    )}
                    style={{
                      transitionDelay: mounted ? `${100 + index * 50}ms` : "0ms",
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 group",
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "text-gray-600 hover:bg-primary/10 hover:text-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "transition-transform duration-200",
                          !isActive && "group-hover:scale-110 group-hover:-rotate-12",
                        )}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-md">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Bottom Navigation */}
          <div className="px-4 py-4 border-t border-gray-100 bg-gray-50">
            <ul className="space-y-1">
              {bottomItems.map((item, index) => {
                const isActive = pathname === item.href

                return (
                  <li
                    key={item.href}
                    className={cn(
                      "transition-all duration-500",
                      mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8",
                    )}
                    style={{
                      transitionDelay: mounted ? `${100 + mainItems.length * 50 + index * 50}ms` : "0ms",
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 group",
                        isActive
                          ? "bg-primary/20 text-primary shadow-sm"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                      )}
                    >
                      <span className={cn("transition-transform duration-200", !isActive && "group-hover:scale-110")}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}

              {/* Logout Button */}
              <li
                className={cn(
                  "transition-all duration-500 mt-2",
                  mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8",
                )}
                style={{
                  transitionDelay: mounted ? `${100 + mainItems.length * 50 + bottomItems.length * 50}ms` : "0ms",
                }}
              >
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-all duration-200 group"
                >
                  <span className="transition-transform duration-200 group-hover:scale-110">
                    <FiLogOut className="w-5 h-4" />
                  </span>
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </>
  )
}
