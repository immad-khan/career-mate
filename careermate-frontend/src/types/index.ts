// Profile Component Types
export interface Skill {
  id: number;
  name: string;
  proficiency: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  image: string | null;
  url: string | null;
}

export interface EducationEntry {
  id: number;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
}

export interface UserLanguage {
  id: number;
  language: string;
  proficiency: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'job_seeker' | 'hr' | 'admin';
  profile_picture_url: string | null;
  is_email_verified: boolean;
  is_google_user: boolean;
  created_at: string;
  skills?: Skill[];
  portfolio_items?: PortfolioItem[];
  education_entries?: EducationEntry[];
  languages?: UserLanguage[];
}

export interface JobSeekerProfile {
  id: string;
  user: User;
  phone: string | null;
  university: string | null;
  graduation_year: number | null;
  degree: string | null;
  field_of_study: string | null;
  tokens_balance: number;
  created_at: string;
  updated_at: string;
}

export interface HRProfile {
  id: string;
  user: User;
  company_name: string;
  company_email: string;
  ntn_number: string;
  interview_date: string;
  approval_letter_url: string | null;
  designation: string | null;
  designation_display: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_status_display: string;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Auth Types
export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    profile: JobSeekerProfile | HRProfile | null;
    tokens: AuthTokens;
    hr_approval_status?: string | null;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    full_name: string;
    role: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// Admin Types
export interface PlatformStats {
  total_users: number;
  total_job_seekers: number;
  total_hrs: number;
  pending_hr_approvals: number;
  verified_users: number;
  active_users: number;
  users_today: number;
  users_this_week: number;
  users_this_month: number;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_email_verified: boolean;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  profile: JobSeekerProfile | HRProfile | null;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface JobSeekerRegisterFormData {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  phone?: string;
  university?: string;
  graduation_year?: number;
  degree?: string;
  field_of_study?: string;
}

export interface HRRegisterFormData {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  company_name: string;
  company_email: string;
  ntn_number: string;
  interview_date: string;
  approval_letter: FileList;
}

export interface VerifyEmailFormData {
  email: string;
  otp: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}

// Designation Options
export const DESIGNATION_OPTIONS = [
  { value: 'junior_hr_executive', label: 'Junior HR Executive' },
  { value: 'senior_hr_executive', label: 'Senior HR Executive' },
  { value: 'hr_manager', label: 'HR Manager' },
  { value: 'talent_acquisition', label: 'Talent Acquisition Specialist' },
  { value: 'recruitment_lead', label: 'Recruitment Lead' },
  { value: 'hr_director', label: 'HR Director' },
];
