import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  User,
} from '@/types/auth';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

const API_URL = '/api/auth';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async logout(): Promise<void> {
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  async refresh(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetchWithAuth(`${API_URL}/me`);
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async updateProfile(data: UpdateProfileRequest): Promise<{ user: User }> {
    const res = await fetch(`${API_URL}/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/me/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
};
