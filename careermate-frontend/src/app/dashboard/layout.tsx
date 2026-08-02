'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  FiMenu,
  FiX,
  FiHome,
  FiTarget,
  FiTrendingUp,
  FiSearch,
  FiFileText,
  FiFile,
  FiMail,
  FiBook,
  FiAward,
  FiBriefcase,
  FiSettings,
  FiLogOut,
  FiBell,
  FiUser,
  FiUsers,
  FiUserCheck,
  FiSun,
  FiMoon,
} from 'react-icons/fi';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import Logo from '@/components/shared/Logo';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: <FiHome className="w-5 h-5" />, href: '/dashboard' },
  { label: 'Resume Builder', icon: <FiFile className="w-5 h-5" />, href: '/dashboard/resume-builder' },
  { label: 'SkillBot', icon: <FiTarget className="w-5 h-5" />, href: '/dashboard/skillbot' },
  { label: 'Market Trends', icon: <FiTrendingUp className="w-5 h-5" />, href: '/dashboard/trends' },
  { label: 'Job Crawler', icon: <FiSearch className="w-5 h-5" />, href: '/dashboard/jobs' },
  { label: 'Cover Letter Generator', icon: <FiFileText className="w-5 h-5" />, href: '/dashboard/cover-letter' },
  { label: 'Cold Email Generator', icon: <FiMail className="w-5 h-5" />, href: '/dashboard/cold-email' },
  { label: 'Mock Interview Quiz', icon: <FiBook className="w-5 h-5" />, href: '/dashboard/interview' },
  { label: 'Skill Roadmap', icon: <FiAward className="w-5 h-5" />, href: '/dashboard/roadmap' },
  { label: 'Profile', icon: <FiUser className="w-5 h-5" />, href: '/dashboard/profile' },
];

const hrMenuItems: MenuItem[] = [
  { label: 'Dashboard', icon: <FiHome className="w-5 h-5" />, href: '/dashboard/hr' },
  { label: 'Profile', icon: <FiUser className="w-5 h-5" />, href: '/dashboard/profile' },
];

const adminMenuItems: MenuItem[] = [
  { label: 'Admin Overview', icon: <FiHome className="w-5 h-5" />, href: '/dashboard/admin' },
  { label: 'Manage Users', icon: <FiUsers className="w-5 h-5" />, href: '/dashboard/admin/users' },
  { label: 'HR Approvals', icon: <FiUserCheck className="w-5 h-5" />, href: '/dashboard/admin/hr-approvals' },
  { label: 'Settings', icon: <FiSettings className="w-5 h-5" />, href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const currentMenuItems = user?.role === 'admin' 
    ? adminMenuItems 
    : user?.role === 'hr' 
      ? hrMenuItems 
      : menuItems;

  const activeMenuItem = currentMenuItems.find(item => isActive(item.href));

  const userInitial = user?.full_name?.charAt(0) || 'U';

  const getRoleDisplay = () => {
    if (user?.role === 'admin') return 'Administrator';
    if (user?.role === 'hr') return 'HR Professional';
    return 'Job Seeker';
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen transition-colors duration-500 bg-white">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } transition-all duration-300 overflow-hidden flex flex-col border-r bg-white border-gray-100 shadow-sm`}
        >
          {/* Logo */}
          <div className="p-6 border-b border-gray-50">
            <Logo variant="default" size="md" />
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            <h3 className="text-[10px] font-bold uppercase tracking-widest px-2 py-4 text-primary">Main Menu</h3>
            {currentMenuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive(item.href)
                    ? 'bg-primary text-white shadow-sm font-bold' 
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span>
                <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all text-gray-600 hover:text-rose-600 hover:bg-rose-50"
            >
              <FiLogOut className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Header */}
          <header className="px-6 py-4 flex items-center justify-between border-b bg-white border-gray-100">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-primary"
              >
                {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>

              {/* Page Title */}
              <div className="flex flex-col ml-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-primary/60">
                  Dashboard
                </h2>
                <p className="text-lg font-bold leading-tight text-gray-900">
                  {activeMenuItem?.label || 'Overview'}
                </p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg transition-colors relative text-gray-600 hover:bg-gray-50 hover:text-primary">
                <FiBell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary"></span>
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-primary">
                    {getRoleDisplay()}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold transition-all bg-primary shadow-sm">
                  {userInitial}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
