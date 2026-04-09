"use client"

import type React from "react"
import { useState } from "react"
import BeautifulNavbar from "./beautiful-navbar"
import ProtectedRoute from "@/components/shared/ProtectedRoute"

interface BeautifulDashboardLayoutProps {
  children: React.ReactNode
  allowedRoles?: ("job_seeker" | "hr" | "admin")[]
  requireApproved?: boolean
  sidebar?: React.ReactNode
}

export default function BeautifulDashboardLayout({
  children,
  allowedRoles,
  requireApproved = false,
  sidebar,
}: BeautifulDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleMenuClick = () => {
    setSidebarOpen(true)
    // If the sidebar is passed as a prop, it might handle its own state,
    // but we need to ensure it opens on mobile.
  }

  return (
    <ProtectedRoute allowedRoles={allowedRoles} requireApproved={requireApproved}>
      <style>{`
        @keyframes slideInSidebar {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInSidebarMobile {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInContent {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dashboard-sidebar {
          animation: slideInSidebar 0.5s ease-out forwards;
        }

        .dashboard-sidebar-mobile {
          animation: slideInSidebarMobile 0.4s ease-out forwards;
        }

        .dashboard-main {
          animation: fadeInContent 0.6s ease-out 0.2s forwards;
          opacity: 0;
        }

        .dashboard-navbar {
          animation: fadeInContent 0.6s ease-out forwards;
        }

        .dashboard-content {
          animation: fadeInContent 0.6s ease-out 0.3s forwards;
          opacity: 0;
        }

        /* Smooth transitions for sidebar toggle */
        .sidebar-overlay {
          animation: fadeInContent 0.3s ease-out forwards;
        }

        @media (max-width: 1024px) {
          .dashboard-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            z-index: 40;
            width: 256px;
            background: white;
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
          }

          .sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 30;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 transition-colors duration-300">
        <div className="flex h-full">
          {/* Sidebar */}
          {sidebar && (
            <>
              <div className="hidden lg:block dashboard-sidebar lg:relative lg:w-64 lg:border-r lg:border-gray-200 lg:bg-white transition-colors duration-300">
                {sidebar}
              </div>

              {/* Mobile Sidebar */}
              {sidebarOpen && (
                <>
                  <div className="sidebar-overlay lg:hidden" onClick={() => setSidebarOpen(false)} />
                  <div className="dashboard-sidebar-mobile lg:hidden">{sidebar}</div>
                </>
              )}
            </>
          )}

          {/* Main Content */}
          <div className="dashboard-main flex-1 flex flex-col min-h-screen">
            {/* Navbar */}
            <div className="dashboard-navbar sticky top-0 z-20">
              <BeautifulNavbar onMenuClick={handleMenuClick} />
            </div>

            {/* Page Content */}
            <main className="dashboard-content flex-1 p-4 lg:p-6 overflow-auto">
              <div className="max-w-7xl mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
