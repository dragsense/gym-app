// React & Routing
import { Suspense, useId } from "react";
import { Navigate, Outlet } from "react-router-dom";

// Custom Hooks
import { useAuthUser } from "@/hooks/use-auth-user";

// Config
import { ADMIN_ROUTES } from "@/config/routes.config";

// Layout Components
import { AppLoader } from "@/components/layout-ui/app-loader";




export default function PublicRoute() {
  // React 19: Essential IDs
  const componentId = useId();

  const { user, isLoading } = useAuthUser();

  if (isLoading) return <AppLoader />;


  if (user) {
    return <Navigate to={ADMIN_ROUTES.DASHBOARD} replace />;
  }

  return (
    <Suspense fallback={<AppLoader />}>
      <div data-component-id={componentId}>
        <Outlet />
      </div>
    </Suspense>
  );
} 
