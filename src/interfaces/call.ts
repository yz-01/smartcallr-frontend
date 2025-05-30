export interface Call {
  id: number;
  phone_number: string;
  twilio_call_sid?: string;
  status: 'initiated' | 'ringing' | 'in_progress' | 'completed' | 'failed' | 'no_answer' | 'busy';
  start_time: string;
  end_time?: string;
  duration?: number;
  duration_formatted: string;
  recording_file_path?: string;
  notes: string;
  created_at: string;
  updated_at: string;
  lead_name?: string;
}

export interface InitiateCallRequest {
  phone_number: string;
  lead_id?: number;
}

export interface EndCallRequest {
  call_id: number;
  duration: number;
  notes?: string;
}

export interface UploadRecordingRequest {
  call_id: number;
  recording: File;
}

export interface CallApiResponse {
  status: "success" | "error";
  status_code: number;
  data?: Call | Call[];
  message?: string;
} 