export interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadRequest {
  name: string;
  phone: string;
  email: string;
}

export interface UpdateLeadRequest {
  name: string;
  phone: string;
  email: string;
}

export interface LeadApiResponse {
  status: "success" | "error";
  status_code: number;
  data?: Lead | Lead[];
  message?: string;
} 