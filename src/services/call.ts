import useSWR, { mutate } from 'swr';
import { api } from './api';
import toast from 'react-hot-toast';
import { 
  Call, 
  InitiateCallRequest, 
  EndCallRequest, 
  CallApiResponse 
} from '@/interfaces/call';
import { ApiError } from '@/interfaces/auth';

const CALLS_ENDPOINT = '/calls/';

export const callAPI = {
  getHistory: async (): Promise<CallApiResponse> => {
    try {
      const response = await api.get(`${CALLS_ENDPOINT}history/`);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to fetch call history');
      throw error;
    }
  },

  initiate: async (data: InitiateCallRequest): Promise<CallApiResponse> => {
    try {
      const response = await api.post(`${CALLS_ENDPOINT}initiate/`, data);
      const result = response.data;
      
      if (result.status === 'success') {
        toast.success('Call initiated successfully');
        mutate(`${CALLS_ENDPOINT}history/`);
      }
      
      return result;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to initiate call');
      throw error;
    }
  },

  end: async (callId: number, data: Omit<EndCallRequest, 'call_id'>): Promise<CallApiResponse> => {
    try {
      const response = await api.post(`${CALLS_ENDPOINT}${callId}/end/`, {
        call_id: callId,
        ...data
      });
      const result = response.data;
      
      if (result.status === 'success') {
        toast.success('Call ended successfully');
        mutate(`${CALLS_ENDPOINT}history/`);
      }
      
      return result;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to end call');
      throw error;
    }
  },

  updateNotes: async (callId: number, data: { notes: string }): Promise<CallApiResponse> => {
    try {
      const response = await api.patch(`${CALLS_ENDPOINT}${callId}/notes/`, data);
      const result = response.data;
      
      if (result.status === 'success') {
        mutate(`${CALLS_ENDPOINT}history/`);
      }
      
      return result;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to update notes');
      throw error;
    }
  },

  uploadRecording: async (callId: number, recordingFile: File): Promise<CallApiResponse> => {
    try {
      const formData = new FormData();
      formData.append('call_id', callId.toString());
      formData.append('recording', recordingFile);

      const response = await api.post(`${CALLS_ENDPOINT}${callId}/upload-recording/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = response.data;
      
      if (result.status === 'success') {
        toast.success('Recording uploaded successfully');
        mutate(`${CALLS_ENDPOINT}history/`);
      }
      
      return result;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to upload recording');
      throw error;
    }
  },

  downloadRecording: async (callId: number): Promise<CallApiResponse> => {
    try {
      const response = await api.post(`${CALLS_ENDPOINT}${callId}/download-recording/`, {
        call_id: callId
      });
      const result = response.data;
      
      if (result.status === 'success') {
        toast.success('Recording downloaded successfully');
        mutate(`${CALLS_ENDPOINT}history/`);
      }
      
      return result;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to download recording');
      throw error;
    }
  },

  getStatus: async (callId: number): Promise<CallApiResponse> => {
    try {
      const response = await api.get(`${CALLS_ENDPOINT}${callId}/status/`);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to fetch call status');
      throw error;
    }
  },

  getDetail: async (callId: number): Promise<CallApiResponse> => {
    try {
      const response = await api.get(`${CALLS_ENDPOINT}${callId}/status/`);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to fetch call details');
      throw error;
    }
  },

  transcribe: async (callId: number): Promise<CallApiResponse> => {
    try {
      const response = await api.post(`${CALLS_ENDPOINT}${callId}/transcribe/`);
      const result = response.data;
      
      if (result.status === 'success') {
        toast.success('Transcription started successfully');
        mutate(`${CALLS_ENDPOINT}history/`);
      }
      
      return result;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to start transcription');
      throw error;
    }
  },

  summarize: async (callId: number): Promise<CallApiResponse> => {
    try {
      const response = await api.post(`${CALLS_ENDPOINT}${callId}/summarize/`);
      const result = response.data;
      
      if (result.status === 'success') {
        toast.success('Summary generated successfully');
        mutate(`${CALLS_ENDPOINT}history/`);
      }
      
      return result;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to generate summary');
      throw error;
    }
  },

  getAudioUrl: (callId: number): string => {
    // Use the same base URL as the main API configuration
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${baseUrl}/calls/${callId}/audio/`;
  },

  getAudioBlob: async (callId: number): Promise<string> => {
    try {
      const response = await api.get(`/calls/${callId}/audio/`, {
        responseType: 'blob'
      });
      
      // Create object URL from blob
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      return URL.createObjectURL(audioBlob);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error fetching audio blob:', apiError);
      throw error;
    }
  }
};

// Custom hook for fetching call history
export const useCallHistory = () => {
  const { data, error, isLoading, mutate } = useSWR(
    `${CALLS_ENDPOINT}history/`,
    () => callAPI.getHistory().then(res => res.data as Call[])
  );
  
  return {
    calls: data,
    isLoading,
    isError: error,
    mutate
  };
};

// Custom hook for fetching call status
export const useCallStatus = (callId: number | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    callId ? `${CALLS_ENDPOINT}${callId}/status/` : null,
    () => callId ? callAPI.getStatus(callId).then(res => res.data as Call) : null
  );
  
  return {
    call: data,
    isLoading,
    isError: error,
    mutate
  };
}; 