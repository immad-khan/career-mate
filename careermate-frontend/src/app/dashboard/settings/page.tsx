'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { 
  FiBell, 
  FiLock, 
  FiUser, 
  FiLayers, 
  FiMail, 
  FiSmartphone, 
  FiCheckCircle, 
  FiSave 
} from 'react-icons/fi';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: <FiUser /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
    { id: 'security', label: 'Security & Privacy', icon: <FiLock /> },
    { id: 'theme', label: 'Appearance', icon: <FiLayers /> },
  ];

  const handleSave = () => {
    toast.success('Settings updated successfully');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1 italic">Manage your account preferences and application defaults.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-primary/5 hover:text-primary'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card className="border-primary/20 bg-white shadow-sm">
              <CardHeader className="bg-primary/5 border-b border-primary/10 py-5">
                <h2 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <FiUser /> User Profile
                </h2>
              </CardHeader>
              <CardBody className="space-y-6 pt-6">
                <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                  <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white text-3xl font-bold rotate-3">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider">{user?.full_name}</h3>
                    <p className="text-sm text-primary font-bold uppercase tracking-widest opacity-60">
                      {user?.role === 'admin' ? 'System Administrator' : user?.role === 'hr' ? 'HR Manager' : 'Job Seeker'}
                    </p>
                    <button className="mt-2 text-xs font-bold text-primary hover:underline uppercase tracking-tighter">Change Avatar</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input 
                    label="Full Name" 
                    defaultValue={user?.full_name} 
                    className="border-primary/20 focus:ring-primary/50"
                  />
                  <Input 
                    label="Email Address" 
                    defaultValue={user?.email} 
                    disabled 
                    className="bg-gray-50 border-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSave} className="bg-primary text-white shadow-md px-8 font-bold uppercase tracking-widest text-xs">
                    Save Changes
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'theme' && (
            <Card className="border-primary/20 bg-white shadow-sm">
              <CardHeader className="bg-primary/5 border-b border-primary/10 py-5">
                <h2 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <FiLayers /> Appearance Settings
                </h2>
              </CardHeader>
              <CardBody className="space-y-6 pt-6">
                <p className="text-sm text-gray-600 font-bold italic">
                  Choose your prefered visual theme. Your current setting is fixed to the professional Green & White theme as requested.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-1 rounded-2xl border-2 border-primary bg-primary/5 shadow-md">
                    <div className="bg-white h-32 rounded-xl flex items-center justify-center border border-primary/20">
                      <div className="space-y-2 w-full px-4">
                        <div className="h-2 w-3/4 bg-primary/20 rounded"></div>
                        <div className="h-2 w-1/2 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                    <p className="text-center py-3 text-[10px] font-bold uppercase text-primary tracking-widest">Light Mode (Active)</p>
                  </div>
                  <div className="p-1 rounded-2xl border-2 border-transparent bg-gray-50 opacity-40 cursor-not-allowed">
                    <div className="bg-gray-200 h-32 rounded-xl flex items-center justify-center">
                       <div className="space-y-2 w-full px-4">
                        <div className="h-2 w-3/4 bg-gray-300 rounded"></div>
                        <div className="h-2 w-1/2 bg-gray-400 rounded"></div>
                      </div>
                    </div>
                    <p className="text-center py-3 text-[10px] font-bold uppercase text-gray-400 tracking-widest italic">Dark Mode (Disabled)</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="border-primary/20 bg-white shadow-sm">
              <CardHeader className="bg-primary/5 border-b border-primary/10 py-5">
                <h2 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <FiBell /> Notification Preferences
                </h2>
              </CardHeader>
              <CardBody className="space-y-4 pt-6">
                {[
                  { title: 'Email Notifications', desc: 'Receive updates via your registered email', icon: <FiMail /> },
                  { title: 'Browser Push Notifications', desc: 'Get real-time alerts in your browser', icon: <FiCheckCircle /> },
                  { title: 'SMS Alerts', desc: 'Mobile alerts for high-priority updates', icon: <FiSmartphone />, disabled: true },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-xl border border-primary/10 ${item.disabled ? 'opacity-40' : 'hover:bg-primary/5'}`}>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg text-primary text-xl">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">{item.title}</p>
                        <p className="text-xs text-gray-500 italic mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${item.disabled ? 'bg-gray-200' : 'bg-primary cursor-pointer'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${item.disabled ? '' : 'translate-x-6'}`}></div>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="border-primary/20 bg-white shadow-sm">
              <CardHeader className="bg-primary/5 border-b border-primary/10 py-5">
                <h2 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <FiLock /> Security & Identity
                </h2>
              </CardHeader>
              <CardBody className="space-y-6 pt-6">
                <div className="space-y-4">
                   <Input 
                    type="password"
                    label="Current Password" 
                    placeholder="••••••••"
                    className="border-primary/20"
                  />
                  <Input 
                    type="password"
                    label="New Password" 
                    placeholder="••••••••"
                    className="border-primary/20"
                  />
                  <Input 
                    type="password"
                    label="Confirm New Password" 
                    placeholder="••••••••"
                    className="border-primary/20"
                  />
                </div>
                <div className="pt-2">
                  <Button className="bg-primary text-white shadow-md px-8 font-bold uppercase tracking-widest text-xs">
                    Update Password
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
