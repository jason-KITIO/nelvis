'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import type {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '@/types/auth';

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: () => authService.refresh(),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authService.forgotPassword(data),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
  });
};

export const useMe = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => authService.getMe(),
    enabled,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authService.changePassword(data),
  });
};
