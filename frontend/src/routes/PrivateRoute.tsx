// React & Hooks
import { Suspense } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

// Custom Hooks
import { useAuthUser } from "@/hooks/use-auth-user";

// Config
import { PUBLIC_ROUTES } from "@/config/routes.config";


// Layout Components
import { AppLoader } from "@/components/layout-ui/app-loader";

export default function PrivateRoute() {
  const { user, isLoading } = useAuthUser();
  const location = useLocation();

  if (isLoading) return <AppLoader />;

  if (!user) {
    return (
      <Navigate to={PUBLIC_ROUTES.LOGIN} state={{ from: location }} replace />
    );
  }

  return (
    <Suspense fallback={<AppLoader />}>
      <Outlet />
    </Suspense>
  );
}
