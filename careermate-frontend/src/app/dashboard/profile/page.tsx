'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { profileAPI } from '@/lib/api';
import { getErrorMessage, getInitials, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBook,
  FiCalendar,
  FiCamera,
  FiSave,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiPlus,
  FiTrash2,
  FiExternalLink,
  FiGlobe,
  FiLayers,
  FiSettings,
  FiTarget,
} from 'react-icons/fi';
import { Skill, PortfolioItem, EducationEntry, UserLanguage } from '@/types';
import Spinner from '@/components/ui/spinner';
import Badge from '@/components/ui/badge';

export default function ProfilePage() {
  const { user, profile, refreshUser, hrApprovalStatus } = useAuthStore();
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Sub-resource states
  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 'Intermediate' });
  const [newPortfolio, setNewPortfolio] = useState({ title: '', description: '', url: '' });
  const [portfolioImage, setPortfolioImage] = useState<File | null>(null);
  const [newEducation, setNewEducation] = useState({
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    is_current: false,
  });
  const [newLanguage, setNewLanguage] = useState({ language: '', proficiency: 'Full Professional' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  // Form data for basic profile updates
  const [basicForm, setBasicForm] = useState({
    full_name: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setBasicForm({
        full_name: user.full_name || '',
        phone: (profile as any)?.phone || '',
      });
    }
  }, [user, profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB');
        return;
      }
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleBasicUpdate = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('full_name', basicForm.full_name);
      if (basicForm.phone) formData.append('phone', basicForm.phone);
      if (profilePicture) formData.append('profile_picture', profilePicture);

      if (user?.role === 'job_seeker') {
        await profileAPI.updateJobSeekerProfile(formData);
      } else {
        await profileAPI.updateHRProfile(formData);
      }
      
      await refreshUser();
      toast.success('Basic profile updated');
      setIsEditingBasic(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name) return;
    try {
      await profileAPI.addSkill(newSkill);
      await refreshUser();
      setNewSkill({ name: '', proficiency: 'Intermediate' });
      toast.success('Skill added');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      await profileAPI.deleteSkill(id);
      await refreshUser();
      toast.success('Skill removed');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleAddPortfolio = async () => {
    if (!newPortfolio.title) return;
    try {
      const formData = new FormData();
      formData.append('title', newPortfolio.title);
      formData.append('description', newPortfolio.description);
      if (newPortfolio.url) formData.append('url', newPortfolio.url);
      if (portfolioImage) formData.append('image', portfolioImage);

      await profileAPI.addPortfolioItem(formData);
      await refreshUser();
      setNewPortfolio({ title: '', description: '', url: '' });
      setPortfolioImage(null);
      toast.success('Portfolio item added');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeletePortfolio = async (id: number) => {
    try {
      await profileAPI.deletePortfolioItem(id);
      await refreshUser();
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleAddEducation = async () => {
    try {
      await profileAPI.addEducation(newEducation);
      await refreshUser();
      setNewEducation({
        institution: '',
        degree: '',
        field_of_study: '',
        start_date: '',
        end_date: '',
        is_current: false,
      });
      toast.success('Education added');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleAddLanguage = async () => {
    try {
      await profileAPI.addLanguage(newLanguage);
      await refreshUser();
      setNewLanguage({ language: '', proficiency: 'Full Professional' });
      toast.success('Language added');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 px-4 py-6 border-b border-gray-100 bg-white shadow-sm">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-gray-900">
          Career<span className="text-green-600">Profile</span>
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Profile Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-6 rounded-3xl bg-white shadow-xl">
              
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-green-600">
                    {previewUrl || user?.profile_picture_url ? (
                      <img
                        src={previewUrl || user?.profile_picture_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-green-100 text-green-600">
                        {getInitials(user?.full_name || '')}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 p-3 rounded-full shadow-lg transition-all duration-300 bg-green-600 text-white hover:bg-green-700"
                  >
                    <FiCamera className="w-5 h-5" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>

                <div className="mt-6 text-center w-full">
                  {isEditingBasic ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={basicForm.full_name}
                        onChange={(e) => setBasicForm({ ...basicForm, full_name: e.target.value })}
                        className="w-full p-3 rounded-lg border focus:ring-2 transition-all border-gray-200 text-gray-900 focus:ring-green-500 outline-none"
                        placeholder="Full Name"
                      />
                      <input
                        type="text"
                        value={basicForm.phone}
                        onChange={(e) => setBasicForm({ ...basicForm, phone: e.target.value })}
                        className="w-full p-3 rounded-lg border focus:ring-2 transition-all border-gray-200 text-gray-900 focus:ring-green-500 outline-none"
                        placeholder="Phone Number"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleBasicUpdate}
                          disabled={isLoading}
                          className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-xs transition-all bg-green-600 text-white hover:bg-green-700"
                        >
                          <FiSave /> {isLoading ? 'SYNCING...' : 'SAVE'}
                        </button>
                        <button
                          onClick={() => setIsEditingBasic(false)}
                          className="p-3 rounded-xl border transition-all border-gray-300 text-gray-600"
                        >
                          <FiXCircle />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-3xl font-bold uppercase tracking-tighter text-gray-900">
                        {user?.full_name}
                      </h2>
                      <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-green-600">
                        {user?.role === 'job_seeker' ? 'Job Seeker' : 'HR Manager'}
                      </p>
                      
                      {/* Social Media Section */}
                      <div className="social-container">
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" style={{ '--icon-color': '#0072b1' } as React.CSSProperties}>
                          <i className="fa-brands fa-linkedin-in"></i>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" style={{ '--icon-color': '#E1306C' } as React.CSSProperties}>
                          <i className="fa-brands fa-instagram"></i>
                        </a>
                        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-icon" style={{ '--icon-color': '#000000' } as React.CSSProperties}>
                          <i className="fa-brands fa-tiktok"></i>
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" style={{ '--icon-color': '#1877F2' } as React.CSSProperties}>
                          <i className="fa-brands fa-facebook-f"></i>
                        </a>
                      </div>

                      <div className="mt-2 p-4 rounded-xl flex items-center justify-between border bg-gray-50 border-gray-100">
                        <div className="flex items-center gap-3">
                          <FiMail className="text-gray-400" />
                          <span className="text-[10px] font-bold text-gray-600">{user?.email}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsEditingBasic(true)}
                        className="w-full mt-6 p-3 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all border-green-200 text-green-600 hover:bg-green-50 shadow-sm"
                      >
                        <FiSettings /> Edit Basic Info
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* HR Status Card */}
            {user?.role === 'hr' && (
              <div className="p-6 rounded-2xl bg-white shadow-xl border-l-4 border-green-600">
                <h3 className="font-bold uppercase tracking-widest flex items-center gap-2 mb-4 text-green-700">
                  Account Status
                </h3>
                <div className="flex items-center gap-4">
                  {hrApprovalStatus === 'approved' ? (
                    <FiCheckCircle className="w-10 h-10 text-green-500" />
                  ) : hrApprovalStatus === 'rejected' ? (
                    <FiXCircle className="w-10 h-10 text-red-500" />
                  ) : (
                    <FiClock className="w-10 h-10 text-yellow-500 animate-pulse" />
                  )}
                  <div>
                    <p className="font-bold uppercase text-gray-900">
                      {hrApprovalStatus ? hrApprovalStatus.charAt(0).toUpperCase() + hrApprovalStatus.slice(1) : 'Pending'}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {hrApprovalStatus === 'approved' ? 'Verified Account' : 'Verification progress...'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Token Balance (Job Seeker only) */}
            {user.role === 'job_seeker' && (profile as any)?.tokens_balance !== undefined && (
                 <div className="p-6 rounded-2xl transition-all bg-linear-to-br from-green-600 to-green-800 text-white shadow-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-green-100">Interview Credits</p>
                            <h4 className="text-4xl font-bold mt-1">{(profile as any).tokens_balance}</h4>
                        </div>
                        <FiTarget className="w-12 h-12 opacity-30 text-green-600" />
                    </div>
                </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {user?.role === 'job_seeker' && (
              <>
                {/* Skills Section */}
                <div className="p-6 rounded-2xl transition-all bg-white shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2 text-gray-900">
                      <FiTarget className="text-green-600" /> Technical Skills
                    </h3>
                  </div>
                  
                  <div className="space-y-6 mb-8">
                    {(profile as any)?.skills?.length > 0 ? (profile as any).skills.map((skill: Skill) => (
                      <div key={skill.id} className="group">
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-800">
                            {skill.name}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono font-bold text-green-600">
                              {skill.proficiency}
                            </span>
                            <button 
                              onClick={() => handleDeleteSkill(skill.id)}
                              className="opacity-0 group-hover:opacity-100 text-red-500 transition-opacity"
                            >
                              <FiTrash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="w-full h-1 rounded-full overflow-hidden bg-gray-100">
                          <div 
                            className="h-full transition-all duration-1000 bg-green-600"
                            style={{ width: skill.proficiency === 'Expert' ? '100%' : skill.proficiency === 'Advanced' ? '80%' : skill.proficiency === 'Intermediate' ? '60%' : '35%' }}
                          />
                        </div>
                      </div>
                    )) : (
                        <p className="text-sm italic text-gray-400">No skills added yet...</p>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row gap-2 p-2 rounded-xl border-2 border-dashed bg-gray-50 border-gray-200">
                    <input
                      type="text"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                      placeholder="Skill Name..."
                      className="flex-1 p-2 rounded-lg bg-transparent border-none focus:outline-none text-sm text-gray-900"
                    />
                    <select
                      value={newSkill.proficiency}
                      onChange={(e) => setNewSkill({...newSkill, proficiency: e.target.value})}
                      className="p-2 rounded-lg bg-transparent border-none focus:outline-none text-xs font-bold text-green-600"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                    <button 
                      onClick={handleAddSkill}
                      className="px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-bold text-xs transition-all bg-green-600 text-white hover:bg-green-700"
                    >
                      <FiPlus /> ADD
                    </button>
                  </div>
                </div>

                {/* Portfolio Section */}
                <div className="p-6 rounded-2xl transition-all bg-white shadow-xl">
                  <h3 className="text-xl font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-6 text-gray-900">
                    <FiLayers className="text-green-600" /> Project Portfolio
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {(profile as any)?.portfolio_items?.map((item: PortfolioItem) => (
                      <div 
                        key={item.id}
                        className="group relative overflow-hidden rounded-xl border transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                      >
                        {item.image_url ? (
                          <div className="h-40 overflow-hidden">
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          </div>
                        ) : (
                          <div className="h-40 flex items-center justify-center bg-gray-100">
                            <FiBriefcase className="w-12 h-12 text-gray-300" />
                          </div>
                        )}
                        <div className="p-4">
                          <h4 className="font-bold uppercase tracking-wider text-sm text-gray-900">{item.title}</h4>
                          <p className="text-xs mt-1 line-clamp-2 text-gray-500">{item.description}</p>
                          <div className="mt-4 flex justify-between items-center">
                            {item.url && (
                              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold flex items-center gap-1 uppercase tracking-tighter text-green-600 hover:text-green-700">
                                VIEW PROJECT <FiExternalLink />
                              </a>
                            )}
                            <button 
                              onClick={() => handleDeletePortfolio(item.id)}
                              className="text-red-500/60 hover:text-red-500 transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Portfolio Form */}
                  <div className="p-4 rounded-xl border-2 border-dashed bg-gray-50 border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Project Title"
                        value={newPortfolio.title}
                        onChange={(e) => setNewPortfolio({...newPortfolio, title: e.target.value})}
                        className="p-3 rounded-lg border text-sm bg-white text-gray-900 shadow-sm outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Project URL"
                        value={newPortfolio.url}
                        onChange={(e) => setNewPortfolio({...newPortfolio, url: e.target.value})}
                        className="p-3 rounded-lg border text-sm bg-white text-gray-900 shadow-sm outline-none"
                      />
                      <textarea
                        placeholder="Project Description..."
                        value={newPortfolio.description}
                        onChange={(e) => setNewPortfolio({...newPortfolio, description: e.target.value})}
                        className="md:col-span-2 p-3 rounded-lg border text-sm bg-white text-gray-900 shadow-sm outline-none"
                        rows={2}
                      />
                      <div className="md:col-span-2 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => portfolioInputRef.current?.click()}
                            className="px-4 py-2 rounded-lg text-[10px] font-bold border uppercase tracking-wider border-gray-400 text-gray-600 hover:bg-gray-50"
                          >
                            {portfolioImage ? 'IMAGE READY' : 'UPLOAD SCREENSHOT'}
                          </button>
                          <input type="file" ref={portfolioInputRef} onChange={(e) => setPortfolioImage(e.target.files?.[0] || null)} className="hidden" accept="image/*" />
                          {portfolioImage && <span className="text-[10px] text-green-500 font-mono truncate max-w-[100px]">{portfolioImage.name}</span>}
                        </div>
                        <button 
                          onClick={handleAddPortfolio}
                        className="px-6 py-2 rounded-lg font-bold text-xs transition-all uppercase tracking-widest bg-green-600 text-white shadow-md hover:bg-green-700"
                        >
                          ADD PROJECT
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education & Languages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Education */}
                  <div className="p-6 rounded-2xl transition-all bg-white shadow-xl">
                    <h3 className="text-xl font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-6 text-gray-900">
                      <FiBook className="text-green-600" /> Education
                    </h3>
                    <div className="space-y-4 mb-6">
                      {(profile as any)?.education?.map((edu: EducationEntry) => (
                        <div key={edu.id} className="p-4 rounded-lg border-l-4 transition-all bg-gray-50 border-green-600 hover:bg-gray-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-sm uppercase text-gray-900">{edu.institution}</h4>
                              <p className="text-xs font-bold text-gray-500">{edu.degree} in {edu.field_of_study}</p>
                              <p className="text-[10px] opacity-60 mt-2 font-mono">{edu.start_date} - {edu.is_current ? 'Current' : edu.end_date}</p>
                            </div>
                            <button onClick={async () => {
                                try {
                                    await profileAPI.deleteEducation(edu.id);
                                    await refreshUser();
                                    toast.success('Education deleted');
                                } catch(e) { toast.error('Error'); }
                            }} className="text-red-500/50 hover:text-red-500"><FiTrash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3 p-4 rounded-xl bg-gray-50">
                      <input type="text" placeholder="Institution Name" value={newEducation.institution} onChange={e => setNewEducation({...newEducation, institution: e.target.value})} className="w-full p-2 text-xs rounded border bg-white text-gray-900 shadow-sm outline-none" />
                      <input type="text" placeholder="Degree / Certification" value={newEducation.degree} onChange={e => setNewEducation({...newEducation, degree: e.target.value})} className="w-full p-2 text-xs rounded border bg-white text-gray-900 shadow-sm outline-none" />
                      <div className="grid grid-cols-2 gap-2">
                         <input type="date" value={newEducation.start_date} onChange={e => setNewEducation({...newEducation, start_date: e.target.value})} className="p-2 text-[10px] rounded border bg-white text-gray-900 shadow-sm outline-none" />
                         <input type="date" value={newEducation.end_date} onChange={e => setNewEducation({...newEducation, end_date: e.target.value})} className="p-2 text-[10px] rounded border bg-white text-gray-900 shadow-sm outline-none" />
                      </div>
                      <button onClick={handleAddEducation} className="w-full p-2 rounded text-[10px] font-bold tracking-widest uppercase transition-all bg-green-600 text-white shadow-md hover:bg-green-700">ADD EDUCATION</button>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="p-6 rounded-2xl transition-all bg-white shadow-xl">
                    <h3 className="text-xl font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-6 text-gray-900">
                      <FiGlobe className="text-green-600" /> Languages
                    </h3>
                    <div className="space-y-4 mb-6">
                      {(profile as any)?.languages?.map((lang: UserLanguage) => (
                        <div key={lang.id} className="flex justify-between items-center group p-3 rounded-lg border border-transparent hover:border-green-100">
                          <div>
                            <p className="font-bold uppercase text-sm transition-all text-gray-800">{lang.language}</p>
                            <p className="text-[10px] text-gray-500 uppercase font-mono tracking-widest">{lang.proficiency}</p>
                          </div>
                          <div className="flex items-center gap-3">
                              <div className="flex h-1 w-20 rounded-full overflow-hidden bg-gray-200">
                                <div className="h-full bg-green-600" style={{ width: lang.proficiency === 'Native' ? '100%' : lang.proficiency === 'Fluent' ? '80%' : '60%' }}></div>
                              </div>
                              <button onClick={async () => {
                                  try {
                                      await profileAPI.deleteLanguage(lang.id);
                                      await refreshUser();
                                      toast.success('Language deleted');
                                  } catch(e) { toast.error('Error'); }
                              }} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><FiTrash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3 p-4 rounded-xl bg-gray-50">
                      <input type="text" placeholder="Language Name (e.g. English)" value={newLanguage.language} onChange={e => setNewLanguage({...newLanguage, language: e.target.value})} className="w-full p-2 text-xs rounded border bg-white text-gray-900 shadow-sm outline-none" />
                      <select value={newLanguage.proficiency} onChange={e => setNewLanguage({...newLanguage, proficiency: e.target.value})} className="w-full p-2 text-[10px] rounded border bg-white text-gray-900 shadow-sm outline-none">
                        <option>Native</option>
                        <option>Fluent</option>
                        <option>Full Professional</option>
                        <option>Professional Working</option>
                        <option>Elementary</option>
                      </select>
                      <button onClick={handleAddLanguage} className="w-full p-2 rounded text-[10px] font-bold tracking-widest uppercase transition-all bg-green-600 text-white shadow-md hover:bg-green-700">ADD LANGUAGE</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {user?.role === 'hr' && (
              <div className="p-8 rounded-2xl transition-all bg-white shadow-xl">
                <h3 className="text-2xl font-bold uppercase tracking-[0.2em] flex items-center gap-3 mb-8 text-gray-900">
                  <FiBriefcase className="text-green-600" /> Company Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 rounded-xl border transition-all bg-gray-50 border-gray-100 shadow-sm">
                    <p className="text-[10px] uppercase font-bold mb-1 text-green-600">Company Name</p>
                    <p className="text-xl font-bold italic tracking-tighter text-gray-900">{(profile as any)?.company_name}</p>
                  </div>
                  <div className="p-6 rounded-xl border transition-all bg-gray-50 border-gray-100 shadow-sm">
                    <p className="text-[10px] uppercase font-bold mb-1 text-green-600">Company Email</p>
                    <p className="text-xl font-bold font-mono text-gray-900">{(profile as any)?.company_email || user?.email}</p>
                  </div>
                </div>
                {profile && 'designation_display' in (profile as any) && (
                    <div className="mt-8 p-6 rounded-xl border border-dashed border-green-200 bg-green-50">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">Designation</p>
                        <p className="text-2xl font-bold uppercase mt-1 text-gray-900">{(profile as any).designation_display}</p>
                    </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
