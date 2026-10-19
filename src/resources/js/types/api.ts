
export interface User {
  id: number;
  name: string;
  email: string;
  job_title: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  birth_date: string | null;
  is_active: boolean;
}

export interface UserSearchFilters {
  name?: string;
  email?: string;
  job_title?: string;
  bio?: string;
  city?: string;
  state?: string;
  is_active?: boolean;
}

export interface Task {
  id: number;
  name: string;
  is_done: boolean;
  id_user: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface LoginResponse {
  userId: number;
}

export type ValidationResult =
  | { valid: true; data: User }
  | { valid: false };

export interface AuthCheckResult {
  authenticated: boolean;
  idUser?: number;
}
