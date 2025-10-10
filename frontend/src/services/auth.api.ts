import { apiRequest } from "@/utils/fetcher";
import { type IMessageResponse } from "@shared/interfaces/api/response.interface";
import { type ILoginResponse } from "@shared/interfaces/auth.interface";
import type {
  TLoginData,
  TSignupData,
  TForgotPasswordData,
  TAuthResetPasswordData,
  TVerifyOtpData,
} from "@shared/types/auth.type";

const AUTH_API_PATH = "/auth";


export const login = async (data: TLoginData) =>
  apiRequest<ILoginResponse>(`${AUTH_API_PATH}/login`, "POST", data);

export const signup = async (data: TSignupData) =>
  apiRequest<IMessageResponse>(`${AUTH_API_PATH}/signup`, "POST", data);


export const verifyOtp = async (data: TVerifyOtpData) =>
  apiRequest<IMessageResponse>(`${AUTH_API_PATH}/verify-otp`, "POST", data);

export const resendOtp = async (data: { token: string }) =>
  apiRequest<IMessageResponse>(`${AUTH_API_PATH}/resend-otp`, "POST", data);

export const forgotPassword = async (data: TForgotPasswordData) =>
  apiRequest<IMessageResponse>(`${AUTH_API_PATH}/send-reset-link`, "POST", data);

export const resetPassword = async (data: TAuthResetPasswordData) =>
  apiRequest<IMessageResponse>(`${AUTH_API_PATH}/reset-password`, "POST", data);

export const logout = async () =>
  apiRequest<IMessageResponse>(`${AUTH_API_PATH}/logout`, "POST");


export const logoutAll = async () =>
  apiRequest<IMessageResponse>(`${AUTH_API_PATH}/logout-all`, "POST", undefined);


