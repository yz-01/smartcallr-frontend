import useSWR, { mutate } from 'swr';
import { api } from './api';
import toast from 'react-hot-toast';
import { Lead, CreateLeadRequest, UpdateLeadRequest, LeadApiResponse } from '@/interfaces/lead';
import { ApiError } from '@/interfaces/auth';

const LEADS_ENDPOINT = '/leads/';

export const leadAPI = {
  getAll: async (): Promise<LeadApiResponse> => {
    try {
      const response = await api.get(`${LEADS_ENDPOINT}list/`);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to fetch leads');
      throw error;
    }
  },

  create: async (data: CreateLeadRequest): Promise<LeadApiResponse> => {
    try {
      const response = await api.post(`${LEADS_ENDPOINT}create/`, data);
      const result = response.data;
      
      if (result.status === 'success') {
        toast.success('Lead created successfully');
        mutate(`${LEADS_ENDPOINT}list/`);
      }
      
      return result;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to create lead');
      throw error;
    }
  },

  update: async (id: number, data: UpdateLeadRequest): Promise<LeadApiResponse> => {
    try {
      const response = await api.put(`${LEADS_ENDPOINT}${id}/update/`, data);
      const result = response.data;
      
      if (result.status === 'success') {
        toast.success('Lead updated successfully');
        mutate(`${LEADS_ENDPOINT}list/`);
      }
      
      return result;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to update lead');
      throw error;
    }
  },

  delete: async (id: number): Promise<LeadApiResponse> => {
    try {
      const response = await api.delete(`${LEADS_ENDPOINT}${id}/delete/`);
      const result = response.data;
      
      if (result.status === 'success') {
        toast.success('Lead deleted successfully');
        mutate(`${LEADS_ENDPOINT}list/`);
      }
      
      return result;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to delete lead');
      throw error;
    }
  },

  get: async (id: number): Promise<LeadApiResponse> => {
    try {
      const response = await api.get(`${LEADS_ENDPOINT}${id}/detail/`);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to fetch lead');
      throw error;
    }
  }
};

// Custom hook for fetching leads
export const useLeads = () => {
  const { data, error, isLoading, mutate } = useSWR(
    `${LEADS_ENDPOINT}list/`,
    () => leadAPI.getAll().then(res => res.data as Lead[])
  );
  
  return {
    leads: data,
    isLoading,
    isError: error,
    mutate
  };
};

// Custom hook for fetching a single lead
export const useLead = (id: number) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `${LEADS_ENDPOINT}${id}/detail/` : null,
    () => leadAPI.get(id).then(res => res.data as Lead)
  );
  
  return {
    lead: data,
    isLoading,
    isError: error,
    mutate
  };
}; 