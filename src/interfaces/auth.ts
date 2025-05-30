export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  status: "success" | "error";
  status_code: number;
  data?: {
    user: User;
    access_token: string;
    refresh_token: string;
    message: string;
  };
  message?: string;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  status_code: number;
  data?: T;
  message?: string;
} 