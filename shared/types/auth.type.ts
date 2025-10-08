import { LoginDto, ForgotPasswordDto, ResetPasswordWithTokenDto, SignupDto } from '../dtos';

export type TLoginData = {} & LoginDto;

export type TSignupData = SignupDto;

export type TForgotPasswordData = ForgotPasswordDto;

export type TAuthResetPasswordData = ResetPasswordWithTokenDto;

