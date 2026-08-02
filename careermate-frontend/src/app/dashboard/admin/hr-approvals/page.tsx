'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { adminAPI } from '@/lib/api';
import { HRProfile, DESIGNATION_OPTIONS } from '@/types';
import { getErrorMessage, formatDate, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';
import Card, { CardBody, CardHeader } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Modal from '@/components/ui/modal';
import Spinner from '@/components/ui/spinner';
import {
  FiCheck,
  FiX,
  FiEye,
  FiDownload,
  FiCalendar,
  FiBriefcase,
  FiMail,
  FiFileText,
} from 'react-icons/fi';

// Helper to open a document URL directly (Cloudinary-hosted)
function openDocument(url: string) {
  window.open(url, '_blank');
}

export default function AdminHRApprovalsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [pendingHRs, setPendingHRs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHR, setSelectedHR] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [designation, setDesignation] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchPendingHRs();
  }, [user, router]);

  const fetchPendingHRs = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getPendingHRs();
      if (response.success) {
        setPendingHRs(response.data);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedHR || !designation) {
      toast.error('Please select a designation');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await adminAPI.approveHR(selectedHR.id, { designation });
      if (response.success) {
        toast.success('HR approved successfully');
        setShowApproveModal(false);
        setSelectedHR(null);
        setDesignation('');
        fetchPendingHRs();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedHR || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await adminAPI.rejectHR(selectedHR.id, { reason: rejectionReason });
      if (response.success) {
        toast.success('HR rejected');
        setShowRejectModal(false);
        setSelectedHR(null);
        setRejectionReason('');
        fetchPendingHRs();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">HR Approvals</h1>
        <p className="text-gray-500">Review and approve HR account applications</p>
      </div>

      {/* Pending HRs List */}
      {pendingHRs.length > 0 ? (
        <div className="grid gap-4">
          {pendingHRs.map((hr) => (
            <Card key={hr.id} className="bg-white border-primary/20 shadow-sm hover:border-primary/40 transition-all duration-300">
              <CardBody>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* HR Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-white font-bold">
                        {getInitials(hr.user?.full_name || 'HR')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary transition-colors">{hr.user?.full_name}</h3>
                      <p className="text-sm text-gray-500">{hr.user?.email}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <FiBriefcase className="w-4 h-4 text-primary" />
                          {hr.company_name}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <FiMail className="w-4 h-4 text-primary" />
                          {hr.company_email}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <FiCalendar className="w-4 h-4 text-primary" />
                          Interview: {formatDate(hr.interview_date)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        NTN: {hr.ntn_number}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 lg:shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-600 hover:border-primary/50 hover:text-primary transition-all duration-300"
                      leftIcon={<FiEye className="w-4 h-4" />}
                      onClick={() => {
                        setSelectedHR(hr);
                        setShowDetailModal(true);
                      }}
                    >
                      View Details
                    </Button>
                    {hr.approval_letter_url && (
                      <button
                        onClick={() => openDocument(hr.approval_letter_url)}
                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer"
                        title="View Approval Letter"
                      >
                        <FiFileText className="w-4 h-4" />
                      </button>
                    )}
                    <Button
                      size="sm"
                      className="bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white transition-all duration-300"
                      leftIcon={<FiX className="w-4 h-4" />}
                      onClick={() => {
                        setSelectedHR(hr);
                        setShowRejectModal(true);
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
                      leftIcon={<FiCheck className="w-4 h-4" />}
                      onClick={() => {
                        setSelectedHR(hr);
                        setShowApproveModal(true);
                      }}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white border-primary/20 shadow-sm">
          <CardBody className="py-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-sm">
              <FiCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">All Caught Up!</h3>
            <p className="text-gray-500 mt-1">No pending HR approvals at the moment.</p>
          </CardBody>
        </Card>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedHR(null);
        }}
        title="HR Application Details"
        size="lg"
        className="bg-white border-primary/20"
      >
        {selectedHR && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-sm">
                <span className="text-white text-xl font-bold">
                  {getInitials(selectedHR.user?.full_name || 'HR')}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedHR.user?.full_name}
                </h3>
                <p className="text-gray-500">{selectedHR.user?.email}</p>
              </div>
            </div>

            {/* Company Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                <p className="text-sm text-gray-500">Company Name</p>
                <p className="font-medium text-gray-900">{selectedHR.company_name}</p>
              </div>
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                <p className="text-sm text-gray-500">Company Email</p>
                <p className="font-medium text-gray-900">{selectedHR.company_email}</p>
              </div>
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                <p className="text-sm text-gray-500">NTN Number</p>
                <p className="font-medium text-gray-900">{selectedHR.ntn_number}</p>
              </div>
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                <p className="text-sm text-gray-500">Interview Date</p>
                <p className="font-medium text-gray-900">{formatDate(selectedHR.interview_date)}</p>
              </div>
            </div>

            {/* Approval Letter */}
            {selectedHR.approval_letter_url && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Approval Letter</p>
                <button
                  onClick={() => openDocument(selectedHR.approval_letter_url!)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-all duration-300 shadow-sm cursor-pointer"
                >
                  <FiDownload className="w-4 h-4" />
                  View/Download Document
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                onClick={() => {
                  setShowDetailModal(false);
                  setShowRejectModal(true);
                }}
              >
                Reject
              </Button>
              <Button
                className="flex-1 bg-primary text-white hover:bg-primary/90 shadow-sm"
                onClick={() => {
                  setShowDetailModal(false);
                  setShowApproveModal(true);
                }}
              >
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedHR(null);
          setDesignation('');
        }}
        title="Approve HR Account"
        size="sm"
        className="bg-white border-primary/20"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Approve <strong className="text-gray-900">{selectedHR?.user?.full_name}</strong> from{' '}
            <strong className="text-gray-900">{selectedHR?.company_name}</strong>
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Designation <span className="text-primary">*</span>
            </label>
            <select
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
            >
              <option value="" className="bg-white">Select designation...</option>
              {DESIGNATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-white">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
              onClick={() => {
                setShowApproveModal(false);
                setSelectedHR(null);
                setDesignation('');
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary text-white hover:bg-primary/90 shadow-sm"
              isLoading={isSubmitting}
              onClick={handleApprove}
              disabled={!designation}
            >
              Approve
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedHR(null);
          setRejectionReason('');
        }}
        title="Reject HR Application"
        size="sm"
        className="bg-white border-primary/20"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Reject application from <strong className="text-gray-900">{selectedHR?.user?.full_name}</strong>?
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              rows={4}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 resize-none placeholder:text-gray-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
              onClick={() => {
                setShowRejectModal(false);
                setSelectedHR(null);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white transition-all duration-300"
              isLoading={isSubmitting}
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
