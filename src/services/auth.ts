import useSWR, { mutate } from 'swr';
import { api } from './api';
import { LoginRequest, RegisterRequest, AuthResponse, User, ApiResponse } from '@/interfaces/auth';
import toast from 'react-hot-toast';

// Error interface for proper typing
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Fetcher function for SWR
const fetcher = (url: string) => api.get(url).then(res => res.data);

// Auth API endpoints
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/users/login/', data);
      const result = response.data as AuthResponse;
      
      if (result.status === 'success' && result.data) {
        // Store tokens
        localStorage.setItem('access_token', result.data.access_token);
        localStorage.setItem('refresh_token', result.data.refresh_token);
        
        // Show success toast
        toast.success(result.data.message || 'Login successful!');
        
        // Mutate user data
        mutate('/users/profile/', result.data.user);
      } else {
        toast.error(result.message || 'Login failed');
      }
      
      return result;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/users/register/', data);
      const result = response.data as AuthResponse;
      
      if (result.status === 'success' && result.data) {
        // Store tokens
        localStorage.setItem('access_token', result.data.access_token);
        localStorage.setItem('refresh_token', result.data.refresh_token);
        
        // Show success toast
        toast.success(result.data.message || 'Registration successful!');
        
        // Mutate user data
        mutate('/users/profile/', result.data.user);
      } else {
        toast.error(result.message || 'Registration failed');
      }
      
      return result;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get('/users/profile/');
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to fetch profile');
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    mutate('/users/profile/', null);
    toast.success('Logged out successfully');
  }
};

// Custom hooks using SWR
export const useUser = () => {
  const { data, error, isLoading, mutate: mutateUser } = useSWR<ApiResponse<{ user: User }>>(
    '/users/profile/',
    fetcher,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }
  );

  return {
    user: data?.data?.user,
    isLoading,
    isError: error,
    mutateUser,
    isLoggedIn: !!data?.data?.user
  };
};

// Auth helpers
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

export const isAuthenticated = () => {
  return !!getToken();
}; 