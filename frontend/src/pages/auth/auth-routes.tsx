// src/routes/auth.routes.tsx
import { PUBLIC_ROUTES } from "@/config/routes.config";
import LoginPage from "./login";
import SignupPage from "./signup";
import ForgotPasswordPage from "./forgot-password";
import ResetPasswordPage from "./reset-password";
import VerifyOtpPage from "./otp";

const authRoutes = [
  {
    path: PUBLIC_ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: PUBLIC_ROUTES.SIGNUP,
    element: <SignupPage />,
  },
  {
    path: PUBLIC_ROUTES.FORGOT_PASSWORD,
    element: <ForgotPasswordPage />,
  },
  {
    path: PUBLIC_ROUTES.RESET_PASSWORD,
    element: <ResetPasswordPage />,
  },
  {
    path: PUBLIC_ROUTES.VERIFY_OTP,
    element: <VerifyOtpPage />,
  }
];

export default authRoutes;
