'use client';

import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { jobsAPI } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import Spinner from '@/components/ui/spinner';
import Button from '@/components/ui/button';

interface Application {
  id: string;
  job_title: string;
  job_seeker_name: string;
  job_seeker_email: string;
  company_name?: string;
  status: string;
  cover_letter?: string;
  hr_message?: string;
  created_at: string;
  job_seeker_profile?: {
    phone?: string;
    university?: string;
    graduation_year?: number;
    experience_level?: string;
    degree?: string;
    field_of_study?: string;
    user?: {
      profile_picture_url?: string;
      skills?: { id: string; name: string; percentage: number; proficiency?: string }[];
      education_entries?: {
        id: string;
        degree: string;
        institution: string;
        year?: string;
        field_of_study?: string;
      }[];
      languages?: { id: string; language: string; proficiency?: string }[];
      portfolio_items?: { id: string; title: string; description: string; url?: string; technologies?: string }[];
    };
  };
}

interface ModalState {
  open: boolean;
  action: 'approved' | 'rejected' | null;
  application: Application | null;
}

const DEFAULT_MESSAGES = {
  approved: "Congratulations! We were impressed with your skills and experience, and we're excited to have you join our team. Welcome aboard!",
  rejected: "Thank you for your interest in this position. While your qualifications are strong, we decided to move forward with another candidate whose experience more closely aligned with our current needs. We wish you the best in your job search.",
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_FILTERS = ['all', 'pending', 'reviewed', 'approved', 'rejected'] as const;

export default function ApplicantsList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ open: false, action: null, application: null });
  const [customMessage, setCustomMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const resp = await jobsAPI.getApplications();
      setApplications(resp);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    if (activeFilter === 'all') return applications;
    return applications.filter(app => app.status === activeFilter);
  }, [applications, activeFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: applications.length, pending: 0, reviewed: 0, approved: 0, rejected: 0 };
    applications.forEach(app => {
      if (counts[app.status] !== undefined) counts[app.status]++;
    });
    return counts;
  }, [applications]);

  const openModal = (application: Application, action: 'approved' | 'rejected') => {
    setModal({ open: true, action, application });
    setCustomMessage(DEFAULT_MESSAGES[action]);
  };

  const closeModal = () => {
    setModal({ open: false, action: null, application: null });
    setCustomMessage('');
  };

  const submitDecision = async () => {
    if (!modal.application || !modal.action) return;
    setIsSubmitting(true);

    try {
      await jobsAPI.updateApplicationStatus(modal.application.id, modal.action, customMessage);
      
      const actionLabel = modal.action === 'approved' ? 'approved' : 'declined';
      toast.success(`Application ${actionLabel} successfully`);
      
      setApplications(apps =>
        apps.map(app =>
          app.id === modal.application!.id
            ? { ...app, status: modal.action!, hr_message: customMessage }
            : app
        )
      );
      closeModal();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const markReviewed = async (id: string) => {
    try {
      await jobsAPI.updateApplicationStatus(id, 'reviewed');
      toast.success('Marked as reviewed');
      setApplications(apps =>
        apps.map(app => (app.id === id ? { ...app, status: 'reviewed' } : app))
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Review Applicants</h2>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
              activeFilter === filter
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter} ({statusCounts[filter] || 0})
          </button>
        ))}
      </div>

      {filteredApplications.length === 0 ? (
        <p className="text-gray-500">
          {applications.length === 0
            ? 'No applications received yet.'
            : `No ${activeFilter} applications.`}
        </p>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map(app => (
            <div key={app.id} className="border border-gray-200 rounded-lg p-5 bg-gray-50/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div className="flex items-center gap-3">
                  {app.job_seeker_profile?.user?.profile_picture_url ? (
                    <img
                      src={app.job_seeker_profile.user.profile_picture_url}
                      alt={`${app.job_seeker_name}'s profile`}
                      className="h-12 w-12 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                      {app.job_seeker_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{app.job_seeker_name}</h3>
                    <p className="text-sm text-gray-500">
                      {app.job_seeker_email} &middot; Applied for{' '}
                      <span className="font-semibold text-green-700">{app.job_title}</span>
                      {app.company_name && (
                        <> at <span className="font-semibold">{app.company_name}</span></>
                      )}
                    </p>
                  </div>
                </div>
                <div
                  className={`mt-2 md:mt-0 px-3 py-1 rounded-full text-xs font-semibold uppercase border ${
                    STATUS_STYLES[app.status] || 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}
                >
                  {app.status}
                </div>
              </div>

              {app.job_seeker_profile && (
                <div className="mb-4 space-y-3 rounded-lg border border-gray-100 bg-white p-4 text-sm text-gray-700">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Candidate profile</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {app.job_seeker_profile.phone && <p><span className="font-semibold">Phone:</span> {app.job_seeker_profile.phone}</p>}
                    {app.job_seeker_profile.experience_level && <p><span className="font-semibold">Experience:</span> {app.job_seeker_profile.experience_level}</p>}
                    {(app.job_seeker_profile.degree || app.job_seeker_profile.university) && (
                      <p><span className="font-semibold">Education:</span> {[app.job_seeker_profile.degree, app.job_seeker_profile.field_of_study, app.job_seeker_profile.university, app.job_seeker_profile.graduation_year].filter(Boolean).join(' · ')}</p>
                    )}
                  </div>

                  {!!app.job_seeker_profile.user?.skills?.length && (
                    <div>
                      <p className="mb-1 font-semibold">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {app.job_seeker_profile.user.skills.map(skill => (
                          <span key={skill.id} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            {skill.name}{skill.proficiency ? ` · ${skill.proficiency}` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {!!app.job_seeker_profile.user?.education_entries?.length && (
                    <div>
                      <p className="mb-1 font-semibold">Education history</p>
                      <ul className="space-y-1 text-gray-600">
                        {app.job_seeker_profile.user.education_entries.map(education => (
                          <li key={education.id}>{education.degree} — {education.institution}{education.field_of_study ? ` (${education.field_of_study})` : ''}{education.year ? `, ${education.year}` : ''}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!!app.job_seeker_profile.user?.languages?.length && (
                    <p><span className="font-semibold">Languages:</span> {app.job_seeker_profile.user.languages.map(language => `${language.language}${language.proficiency ? ` (${language.proficiency})` : ''}`).join(', ')}</p>
                  )}

                  {!!app.job_seeker_profile.user?.portfolio_items?.length && (
                    <div>
                      <p className="mb-1 font-semibold">Portfolio</p>
                      <ul className="space-y-1">
                        {app.job_seeker_profile.user.portfolio_items.map(item => (
                          <li key={item.id}>
                            {item.url ? <a className="text-blue-600 hover:underline" href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a> : item.title}
                            {item.technologies ? ` — ${item.technologies}` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {app.cover_letter && (
                <div className="mb-4 text-sm text-gray-700 p-3 bg-white rounded border border-gray-100">
                  <p className="font-semibold mb-1 text-xs text-gray-500 uppercase tracking-wider">
                    Cover Letter
                  </p>
                  <p>{app.cover_letter}</p>
                </div>
              )}

              {app.hr_message && (
                <div className="mb-4 text-sm p-3 bg-white rounded border border-gray-100">
                  <p className="font-semibold mb-1 text-xs text-gray-500 uppercase tracking-wider">
                    Your Message to Candidate
                  </p>
                  <p className="text-gray-700 italic">&quot;{app.hr_message}&quot;</p>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-200">
                {app.status !== 'approved' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50"
                    onClick={() => openModal(app, 'approved')}
                  >
                    Approve
                  </Button>
                )}
                {app.status !== 'rejected' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                    onClick={() => openModal(app, 'rejected')}
                  >
                    Decline
                  </Button>
                )}
                {app.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-400 text-gray-600"
                    onClick={() => markReviewed(app.id)}
                  >
                    Mark as Reviewed
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decision Modal */}
      {modal.open && modal.action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-6">
            <div>
              <h3
                className={`text-xl font-bold ${
                  modal.action === 'approved' ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {modal.action === 'approved' ? 'Approve Candidate' : 'Decline Candidate'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {modal.action === 'approved'
                  ? `You're about to hire ${modal.application?.job_seeker_name} for ${modal.application?.job_title}`
                  : `You're about to decline ${modal.application?.job_seeker_name} for ${modal.application?.job_title}`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Personal Message to Candidate
              </label>
              <textarea
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                placeholder={
                  modal.action === 'approved'
                    ? 'Write a congratulatory message...'
                    : 'Write a respectful rejection message...'
                }
              />
              <p className="text-xs text-gray-400 mt-1">
                This message will be shown in the candidate&apos;s notifications and sent via email.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={closeModal}
                className="px-5 py-2 rounded-lg border-gray-300 text-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={submitDecision}
                isLoading={isSubmitting}
                className={`px-6 py-2 rounded-lg text-white font-semibold ${
                  modal.action === 'approved'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {modal.action === 'approved' ? 'Send Approval' : 'Send Decline'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
