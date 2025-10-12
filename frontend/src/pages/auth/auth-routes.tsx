// src/routes/auth.routes.tsx
import { lazy, Suspense, useId } from "react";
import { PUBLIC_ROUTES } from "@/config/routes.config";
import { AppLoader } from "@/components/layout-ui/app-loader";

// React 19: Lazy load auth pages with enhanced performance
const LoginPage = lazy(() => import("./login"));
const SignupPage = lazy(() => import("./signup"));
const ForgotPasswordPage = lazy(() => import("./forgot-password"));
const ResetPasswordPage = lazy(() => import("./reset-password"));
const VerifyOtpPage = lazy(() => import("./otp"));

// React 19: Enhanced loading component for auth routes
const AuthRouteLoadingFallback = () => {
  const componentId = useId();
  
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-background"
      data-component-id={componentId}
    >
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Authentication</h3>
        <p className="text-sm text-muted-foreground">Preparing secure login experience...</p>
      </div>
      <AppLoader />
    </div>
  );
};

// React 19: Enhanced auth routes with lazy loading and Suspense
const authRoutes = [
  {
    path: PUBLIC_ROUTES.LOGIN,
    element: (
      <Suspense fallback={<AuthRouteLoadingFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: PUBLIC_ROUTES.SIGNUP,
    element: (
      <Suspense fallback={<AuthRouteLoadingFallback />}>
        <SignupPage />
      </Suspense>
    ),
  },
  {
    path: PUBLIC_ROUTES.FORGOT_PASSWORD,
    element: (
      <Suspense fallback={<AuthRouteLoadingFallback />}>
        <ForgotPasswordPage />
      </Suspense>
    ),
  },
  {
    path: PUBLIC_ROUTES.RESET_PASSWORD,
    element: (
      <Suspense fallback={<AuthRouteLoadingFallback />}>
        <ResetPasswordPage />
      </Suspense>
    ),
  },
  {
    path: PUBLIC_ROUTES.VERIFY_OTP,
    element: (
      <Suspense fallback={<AuthRouteLoadingFallback />}>
        <VerifyOtpPage />
      </Suspense>
    ),
  }
];

export default authRoutes;
