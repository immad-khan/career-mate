import axios, { AxiosError, AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    // If data is not FormData, default to application/json
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refresh_token');
        
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          if (response.data.success) {
            const { access } = response.data.data;
            Cookies.set('access_token', access, { expires: 1 });
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Register Job Seeker
  registerJobSeeker: async (data: any) => {
    const response = await api.post('/auth/register/job-seeker/', data);
    return response.data;
  },

  // Register HR (with file upload)
  registerHR: async (formData: FormData) => {
    const response = await api.post('/auth/register/hr/', formData);
    return response.data;
  },

  // Verify Email
  verifyEmail: async (data: { email: string; otp: string }) => {
    const response = await api.post('/auth/verify-email/', data);
    return response.data;
  },

  // Resend OTP
  resendOTP: async (data: { email: string }) => {
    const response = await api.post('/auth/resend-otp/', data);
    return response.data;
  },

  // Login
  login: async (data: { email: string; password: string; role: string }) => {
    const response = await api.post('/auth/login/', data);
    return response.data;
  },

  // Google Auth
  googleAuth: async (data: { token: string; role: string }) => {
    const response = await api.post('/auth/google/', data);
    return response.data;
  },

  // Complete HR Google Registration
  completeHRGoogle: async (formData: FormData) => {
    const response = await api.post('/auth/google/complete-hr/', formData);
    return response.data;
  },

  // Logout
  logout: async (refreshToken: string) => {
    const response = await api.post('/auth/logout/', { refresh: refreshToken });
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (data: { email: string }) => {
    const response = await api.post('/auth/forgot-password/', data);
    return response.data;
  },

  // Verify Reset OTP
  verifyResetOTP: async (data: { email: string; otp: string }) => {
    const response = await api.post('/auth/verify-reset-otp/', data);
    return response.data;
  },

  // Reset Password
  resetPassword: async (data: {
    email: string;
    otp: string;
    new_password: string;
    confirm_password: string;
  }) => {
    const response = await api.post('/auth/reset-password/', data);
    return response.data;
  },

  // Change Password
  changePassword: async (data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) => {
    const response = await api.post('/auth/change-password/', data);
    return response.data;
  },

  // Get Current User
  getCurrentUser: async () => {
    const response = await api.get('/auth/me/');
    return response.data;
  },

  // Refresh Token
  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },
};

// Profile API
export const profileAPI = {
  // Update Job Seeker Profile
  updateJobSeekerProfile: async (formData: FormData) => {
    const response = await api.put('/profile/job-seeker/', formData);
    return response.data;
  },

  // Update HR Profile
  updateHRProfile: async (formData: FormData) => {
    const response = await api.put('/profile/hr/', formData);
    return response.data;
  },

  // Get HR Approval Status
  getHRApprovalStatus: async () => {
    const response = await api.get('/hr/approval-status/');
    return response.data;
  },

  // Skills
  addSkill: async (data: { name: string; proficiency: string }) => {
    const response = await api.post('/profile/skills/', data);
    return response.data;
  },
  deleteSkill: async (id: number) => {
    const response = await api.delete(`/profile/skills/${id}/`);
    return response.data;
  },

  // Portfolio
  addPortfolioItem: async (formData: FormData) => {
    const response = await api.post('/profile/portfolio-items/', formData);
    return response.data;
  },
  deletePortfolioItem: async (id: number) => {
    const response = await api.delete(`/profile/portfolio-items/${id}/`);
    return response.data;
  },

  // Education
  addEducation: async (data: {
    institution: string;
    degree: string;
    field_of_study?: string;
    start_date: string;
    end_date?: string;
    is_current?: boolean;
    description?: string;
  }) => {
    const response = await api.post('/profile/education/', data);
    return response.data;
  },
  deleteEducation: async (id: number) => {
    const response = await api.delete(`/profile/education/${id}/`);
    return response.data;
  },

  // Languages
  addLanguage: async (data: { language: string; proficiency: string }) => {
    const response = await api.post('/profile/languages/', data);
    return response.data;
  },
  deleteLanguage: async (id: number) => {
    const response = await api.delete(`/profile/languages/${id}/`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  // Get Stats
  getStats: async () => {
    const response = await api.get('/admin/stats/');
    return response.data;
  },

  // Get Users
  getUsers: async (params?: {
    role?: string;
    is_verified?: string;
    is_active?: string;
    search?: string;
  }) => {
    const response = await api.get('/admin/users/', { params });
    return response.data;
  },

  // Get User Detail
  getUserDetail: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}/`);
    return response.data;
  },

  // Update User
  updateUser: async (userId: string, data: { full_name?: string; is_active?: boolean }) => {
    const response = await api.patch(`/admin/users/${userId}/update/`, data);
    return response.data;
  },

  // Change User Password
  changeUserPassword: async (userId: string, data: { new_password: string }) => {
    const response = await api.post(`/admin/users/${userId}/change-password/`, data);
    return response.data;
  },

  // Delete User
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}/delete/`);
    return response.data;
  },

  // Get Pending HRs
  getPendingHRs: async () => {
    const response = await api.get('/admin/hr/pending/');
    return response.data;
  },

  // Get HR Detail
  getHRDetail: async (hrId: string) => {
    const response = await api.get(`/admin/hr/${hrId}/`);
    return response.data;
  },

  // Approve HR
  approveHR: async (hrId: string, data: { designation: string }) => {
    const response = await api.post(`/admin/hr/${hrId}/approve/`, data);
    return response.data;
  },

  // Reject HR
  rejectHR: async (hrId: string, data: { reason: string }) => {
    const response = await api.post(`/admin/hr/${hrId}/reject/`, data);
    return response.data;
  },

  // Update HR Designation
  updateHRDesignation: async (hrId: string, data: { designation: string }) => {
    const response = await api.put(`/admin/hr/${hrId}/designation/`, data);
    return response.data;
  },
};

export default api;