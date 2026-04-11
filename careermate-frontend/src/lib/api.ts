import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the JWT token in all requests
api.interceptors.request.use(
  (config) => {
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

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and not a retry, try to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data.data; // Note the nested .data from your backend response
        Cookies.set('access_token', access);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  registerJobSeeker: async (userData: any) => {
    const response = await api.post('/auth/register/job-seeker/', userData);
    return response.data;
  },
  registerHR: async (userData: any) => {
    const response = await api.post('/auth/register/hr/', userData);
    return response.data;
  },
  login: async (credentials: any) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },
  logout: async (refreshToken: string) => {
    const response = await api.post('/auth/logout/', { refresh: refreshToken });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me/');
    return response.data;
  },
  updateJobSeekerProfile: async (data: any) => {
    const response = await api.put('/profile/job-seeker/', data);
    return response.data;
  },
  updateHRProfile: async (data: any) => {
    const response = await api.put('/profile/hr/', data);
    return response.data;
  },
  refreshToken: async (refreshToken: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
      refresh: refreshToken,
    });
    return response.data;
  },
  verifyEmail: async (data: { email: string; otp: string }) => {
    const response = await api.post('/auth/verify-email/', data);
    return response.data;
  },
  resendOTP: async (email: string) => {
    const response = await api.post('/auth/resend-otp/', { email });
    return response.data;
  },
};

// Resume API
export const resumeAPI = {
  generateResume: async (data: any) => {
    const response = await api.post('/resumes/generate/', data);
    return response.data;
  },
  saveResume: async (data: any) => {
    const response = await api.post('/resumes/save/', data);
    return response.data;
  },
  getUserResumes: async () => {
    const response = await api.get('/resumes/list/');
    return response.data;
  },
  getResumeDetail: async (id: string) => {
    const response = await api.get(`/resumes/${id}/`);
    return response.data;
  },
  deleteResume: async (id: string) => {
    const response = await api.delete(`/resumes/${id}/`);
    return response.data;
  },
  analyzeResume: async (id: string, jobDescription: string) => {
    const response = await api.post(`/resumes/${id}/analyze/`, { job_description: jobDescription });
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getStats: async () => {
    const response = await api.get('/admin/stats/');
    return response.data;
  },
  getPendingHRs: async () => {
    const response = await api.get('/admin/hr/pending/');
    return response.data;
  },
  getHRDetail: async (hrId: string) => {
    const response = await api.get(`/admin/hr/${hrId}/`);
    return response.data;
  },
  approveHR: async (hrId: string, data: { designation: string }) => {
    const response = await api.post(`/admin/hr/${hrId}/approve/`, data);
    return response.data;
  },
  rejectHR: async (hrId: string, data: { reason: string }) => {
    const response = await api.post(`/admin/hr/${hrId}/reject/`, data);
    return response.data;
  },
  updateHRDesignation: async (hrId: string, data: { designation: string }) => {
    const response = await api.put(`/admin/hr/${hrId}/designation/`, data);
    return response.data;
  },
  getUsers: async (params?: { search?: string; role?: string }) => {
    const response = await api.get('/admin/users/', { params });
    return response.data;
  },
  updateUser: async (userId: string, data: any) => {
    const response = await api.patch(`/admin/users/${userId}/update/`, data);
    return response.data;
  },
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}/delete/`);
    return response.data;
  },
  changeUserPassword: async (userId: string, data: { new_password: string }) => {
    const response = await api.post(`/admin/users/${userId}/change-password/`, data);
    return response.data;
  },
};

// Skill Roadmap API
export const roadmapAPI = {
  generateRoadmap: async (data: { role: string; level: string }) => {
    const response = await api.post('/skill-roadmap/generate/', data);
    return response.data;
  },
  getRoadmaps: async () => {
    const response = await api.get('/skill-roadmap/list/');
    return response.data;
  },
  getRoadmapDetail: async (id: string) => {
    const response = await api.get(`/skill-roadmap/${id}/`);
    return response.data;
  },
  updateSkillProgress: async (roadmapId: string, data: { skill_id: string; is_completed: boolean }) => {
    const response = await api.patch(`/skill-roadmap/${roadmapId}/`, data);
    return response.data;
  },
  skillbotChat: async (data: { message: string }) => {
    const response = await api.post('/skill-roadmap/chat/', data);
    return response.data;
  },
};

// Market Trends API
export const marketTrendsAPI = {
  fetchTrends: async (field: string) => {
    const response = await api.post('/market-trends/fetch/', { field });
    return response.data;
  },
  refreshTrends: async (field: string) => {
    const response = await api.post('/market-trends/refresh/', { field });
    return response.data;
  },
};

// Job Crawler API
export const jobCrawlerAPI = {
  searchJobs: async (keyword: string, location: string = 'Pakistan') => {
    const response = await api.post('/job-crawler/search/', { keyword, location });
    return response.data;
  },
  saveJob: async (jobData: any) => {
    const response = await api.post('/job-crawler/save/', jobData);
    return response.data;
  },
  getSavedJobs: async () => {
    const response = await api.get('/job-crawler/save/');
    return response.data;
  },
  unsaveJob: async (jobId: string) => {
    const response = await api.delete(`/job-crawler/save/${jobId}/`);
    return response.data;
  },
  applyJob: async (jobData: any) => {
    const response = await api.post('/job-crawler/apply/', jobData);
    return response.data;
  },
  getAppliedJobs: async () => {
    const response = await api.get('/job-crawler/apply/');
    return response.data;
  },
};

export default api;