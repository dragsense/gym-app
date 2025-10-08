import { apiRequest } from "@/utils/fetcher";
import { type IMessageResponse } from "@shared/interfaces/api/response.interface";
import { type ILoginResponse } from "@shared/interfaces/auth.interface";
import type {
  TLoginData,
  TSignupData,
  TForgotPasswordData,
  TAuthResetPasswordData,
} from "@shared/types/auth.type";

const AUTH_API_PATH = "/auth";


export const login = async (data: TLoginData) =>
  apiRequest<ILoginResponse>(`${AUTH_API_PATH}/login`, "POST", data, undefined);

export const signup = async (data: TSignupData) =>
  apiRequest<IMessageResponse>(`${AUTH_API_PATH}/signup`, "POST", data, undefined);

export const signupWithReferral = async (data: TSignupData, referralCode: string) =>
  apiRequest<IMessageResponse>(`${AUTH_API_PATH}/signup/${referralCode}`, "POST", data, undefined);

export const forgotPassword = async (data: TForgotPasswordData) =>
  apiRequest<IMessageResponse>(`${AUTH_API_PATH}/send-reset-link`, "POST", data, undefined);

export const resetPassword = async (data: TAuthResetPasswordData) =>
  apiRequest<IMessageResponse>(`${AUTH_API_PATH}/reset-password`, "POST", data, undefined);

export const logout = async () =>
  apiRequest<IMessageResponse>(`${AUTH_API_PATH}/logout`, "POST", undefined);
