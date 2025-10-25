// src/routes/appRouter.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense, useId } from "react";
import { ROOT_ROUTE, ADMIN_ROUTES } from "@/config/routes.config";
import { AppLoader } from "./components/layout-ui/app-loader";

// Pages Routes - React 19: Lazy loaded with enhanced performance
import commonRoutes, { authRoutes, adminRoutes } from "@/pages/routes";

// React 19: Lazy load layouts with enhanced performance
const MainLayout = lazy(() => import("@/layouts/MainLayout"));
const DashboardLayoutWrapper = lazy(() => import("@/layouts/DashboardLayout").then(module => ({ default: module.DashboardLayoutWrapper })));
const AuthLayout = lazy(() => import("@/layouts/AuthLayout"));
const PrivateRoute = lazy(() => import("@/routes/PrivateRoute"));
const PublicRoute = lazy(() => import("@/routes/PublicRoute"));

// React 19: Enhanced loading component with transitions
const RouteLoadingFallback = () => {
  const componentId = useId();

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-background"
      data-component-id={componentId}
    >
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Application</h3>
        <p className="text-sm text-muted-foreground">Initializing application components...</p>
      </div>
      <AppLoader />
    </div>
  );
};


// React 19: Enhanced route configuration with lazy loading
const appRouter = createBrowserRouter([
  {
    path: ROOT_ROUTE,
    element: (
      <Suspense fallback={<RouteLoadingFallback />}>
        <MainLayout />
      </Suspense>
    ),
    children: [
      {
        element: (
          <Suspense fallback={<RouteLoadingFallback />}>
            <PublicRoute />
          </Suspense>
        ),
        children: [
          {
            element: (
              <Suspense fallback={<RouteLoadingFallback />}>
                <AuthLayout />
              </Suspense>
            ),
            children: authRoutes,
          },
        ],
      },
      {
        element: (
          <Suspense fallback={<RouteLoadingFallback />}>
            <PrivateRoute />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: <Navigate to={ADMIN_ROUTES.DASHBOARD} replace />,
          },
          {
            element: (
              <Suspense fallback={<RouteLoadingFallback />}>
                <DashboardLayoutWrapper />
              </Suspense>
            ),
            children: adminRoutes,
          },
        ],
      },
      ...commonRoutes
    ],
  },
]);

export default appRouter;
