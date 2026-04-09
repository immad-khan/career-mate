import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User, JobSeekerProfile, HRProfile, AuthTokens } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthState {
  user: User | null;
  profile: JobSeekerProfile | HRProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hrApprovalStatus: string | null;

  // Actions
  setAuth: (user: User, profile: any, tokens: AuthTokens, hrStatus?: string | null) => void;
  setUser: (user: User) => void;
  setProfile: (profile: any) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: true,
      hrApprovalStatus: null,

      setAuth: (user, profile, tokens, hrStatus = null) => {
        // Store tokens in cookies
        Cookies.set('access_token', tokens.access, { expires: 1 }); // 1 day
        Cookies.set('refresh_token', tokens.refresh, { expires: 7 }); // 7 days

        set({
          user,
          profile,
          isAuthenticated: true,
          isLoading: false,
          hrApprovalStatus: hrStatus,
        });
      },

      setUser: (user) => set({ user }),

      setProfile: (profile) => set({ profile }),

      setLoading: (loading) => set({ isLoading: loading }),

      logout: async () => {
        try {
          const refreshToken = Cookies.get('refresh_token');
          if (refreshToken) {
            await authAPI.logout(refreshToken);
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear cookies
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');

          // Clear state
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
            hrApprovalStatus: null,
          });
        }
      },

      refreshUser: async () => {
        try {
          const response = await authAPI.getCurrentUser();
          if (response.success) {
            set({
              user: response.data.user,
              profile: response.data.profile,
              hrApprovalStatus: response.data.hr_approval_status,
            });
          }
        } catch (error) {
          console.error('Refresh user error:', error);
        }
      },

      checkAuth: async () => {
        const accessToken = Cookies.get('access_token');

        if (!accessToken) {
          set({ isAuthenticated: false, isLoading: false });
          return false;
        }

        try {
          const response = await authAPI.getCurrentUser();
          if (response.success) {
            set({
              user: response.data.user,
              profile: response.data.profile,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
        } catch (error) {
          // Token might be expired, try refresh
          const refreshToken = Cookies.get('refresh_token');
          if (refreshToken) {
            try {
              const refreshResponse = await authAPI.refreshToken(refreshToken);
              if (refreshResponse.success) {
                Cookies.set('access_token', refreshResponse.data.access, { expires: 1 });

                // Try getting user again
                const userResponse = await authAPI.getCurrentUser();
                if (userResponse.success) {
                  set({
                    user: userResponse.data.user,
                    profile: userResponse.data.profile,
                    isAuthenticated: true,
                    isLoading: false,
                  });
                  return true;
                }
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }

          // Clear everything
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return false;
        }

        return false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        hrApprovalStatus: state.hrApprovalStatus,
      }),
    }
  )
);