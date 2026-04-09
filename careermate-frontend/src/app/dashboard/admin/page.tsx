'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { adminAPI } from '@/lib/api';
import { PlatformStats } from '@/types';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import StatsCard from '@/components/ui/StatsCard';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import {
  FiUsers,
  FiUserCheck,
  FiBriefcase,
  FiClock,
  FiArrowRight,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiUserPlus,
} from 'react-icons/fi';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [pendingHRs, setPendingHRs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingHRs(),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }

      if (pendingRes.success) {
        setPendingHRs(pendingRes.data.slice(0, 5));
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-primary shadow-sm">
        <h1 className="text-2xl font-bold uppercase tracking-widest">Admin Dashboard 🛡️</h1>
        <p className="mt-2 text-primary/60 font-bold uppercase tracking-wider text-xs">
          Monitor platform activity and manage users.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats?.total_users || 0}
          icon={<FiUsers className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title="Job Seekers"
          value={stats?.total_job_seekers || 0}
          icon={<FiUserCheck className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title="HR Accounts"
          value={stats?.total_hrs || 0}
          icon={<FiBriefcase className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title="Pending Approvals"
          value={stats?.pending_hr_approvals || 0}
          icon={<FiClock className="w-6 h-6" />}
          color="green"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-primary/20 bg-white shadow-sm">
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg transition-colors border border-primary/20">
              <FiUserPlus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 uppercase tracking-tighter">{stats?.users_today || 0}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">New users today</p>
            </div>
          </CardBody>
        </Card>
        <Card className="border-primary/20 bg-white shadow-sm">
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg transition-colors border border-primary/20">
              <FiTrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 uppercase tracking-tighter">{stats?.users_this_week || 0}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">New users this week</p>
            </div>
          </CardBody>
        </Card>
        <Card className="border-primary/20 bg-white shadow-sm">
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg transition-colors border border-primary/20">
              <FiCheckCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 uppercase tracking-tighter">{stats?.verified_users || 0}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Verified users</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Pending HR Approvals */}
      <Card className="border-primary/20 bg-white shadow-sm overflow-hidden">
        <CardHeader className="border-b border-primary/10 bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <FiClock /> Pending HR Approvals
              </h2>
              {(stats?.pending_hr_approvals || 0) > 0 && (
                <div className="px-2 py-0.5 bg-primary/20 border border-primary text-primary text-[10px] font-bold rounded-full animate-pulse shadow-sm">
                  {stats?.pending_hr_approvals}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/10 transition-all font-bold uppercase tracking-widest text-[10px]"
              onClick={() => router.push('/dashboard/admin/hr-approvals')}
            >
              View All <FiArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-0 bg-white">
          {pendingHRs.length > 0 ? (
            <div className="divide-y divide-primary/10">
              {pendingHRs.map((hr: any) => (
                <div key={hr.id} className="flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <span className="text-primary text-sm font-bold uppercase">
                        {hr.user?.full_name?.charAt(0) || 'H'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 uppercase tracking-wider text-xs">{hr.user?.full_name}</p>
                      <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">{hr.company_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 rounded uppercase tracking-tighter">
                      Pending
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary/20 text-primary hover:bg-primary/20 font-bold uppercase tracking-widest text-[10px] h-8"
                      onClick={() => router.push(`/dashboard/admin/hr-approvals?id=${hr.id}`)}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-6 bg-primary/10 rounded-full border border-primary/20 shadow-sm">
                  <FiCheckCircle className="w-12 h-12 text-primary" />
                </div>
              </div>
              <p className="text-primary/40 text-[10px] font-bold uppercase tracking-[0.3em] italic">All applications cleared</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
        <div onClick={() => router.push('/dashboard/admin/users')} className="cursor-pointer">
          <Card className="border-primary/20 bg-white shadow-sm hover:border-primary transition-all group">
            <CardBody className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 group-hover:bg-primary/20 transition-colors shadow-sm">
                <FiUsers className="w-8 h-8 text-primary shadow-sm" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 uppercase tracking-widest text-sm">Manage Users</h3>
                <p className="text-[10px] text-primary/60 font-bold uppercase tracking-wider mt-1">View and manage all users</p>
              </div>
              <FiArrowRight className="w-5 h-5 text-primary/40 ml-auto group-hover:text-primary transition-colors" />
            </CardBody>
          </Card>
        </div>

        <div onClick={() => router.push('/dashboard/admin/hr-approvals')} className="cursor-pointer">
          <Card className="border-primary/20 bg-white shadow-sm hover:border-primary transition-all group">
            <CardBody className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 group-hover:bg-primary/20 transition-colors shadow-sm">
                <FiClock className="w-8 h-8 text-primary shadow-sm" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 uppercase tracking-widest text-sm">HR Approvals</h3>
                <p className="text-[10px] text-primary/60 font-bold uppercase tracking-wider mt-1">Review pending HR applications</p>
              </div>
              <FiArrowRight className="w-5 h-5 text-primary/40 ml-auto group-hover:text-primary transition-colors" />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
