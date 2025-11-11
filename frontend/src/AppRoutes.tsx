// src/routes/appRouter.tsx
import { Navigate, createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import { ROOT_ROUTE, SUPER_ADMIN_SEGMENT, ADMIN_SEGMENT, TRAINER_SEGMENT, CLIENT_SEGMENT, SEGMENTS } from "@/config/routes.config";
import { createRouteElement } from "@/lib/route-utils";

// Pages Routes - React 19: Lazy loaded with enhanced performance
import commonRoutes, { authRoutes, adminRoutes } from "@/pages/routes";
import LevelBasedRedirect from "./routes/level-based-redirect";

// React 19: Lazy load layouts with enhanced performance
const MainLayout = lazy(() => import("@/layouts/MainLayout"));
const DashboardLayoutWrapper = lazy(() => import("@/layouts/DashboardLayout").then(module => ({ default: module.DashboardLayoutWrapper })));
const AuthLayout = lazy(() => import("@/layouts/AuthLayout"));
const PrivateRoute = lazy(() => import("@/routes/private-route"));
const PublicRoute = lazy(() => import("@/routes/public-route"));


// React 19: Enhanced route configuration with lazy loading
const appRouter = createBrowserRouter([
  {
    path: ROOT_ROUTE,
    element: createRouteElement(MainLayout, "App", ["initializing", "application"]),
    children: [
      {
        element: createRouteElement(PublicRoute, "App", ["loading", "public", "routes"]),
        children: [
          {
            element: createRouteElement(AuthLayout, "App", ["loading", "authentication"]),
            children: authRoutes,
          },
        ],
      },
      {
        element: createRouteElement(PrivateRoute, "App", ["loading", "private", "routes"]),
        children: [
          {
            index: true,
            element: <LevelBasedRedirect />,
          },
          {
            element: <LevelBasedRedirect />,
            children: [
              {
                element: createRouteElement(DashboardLayoutWrapper, "App", ["loading", "dashboard"]),
                children: [
                  {
                    path: SUPER_ADMIN_SEGMENT,
                    children: adminRoutes.superAdminRoutes,
                  },
                  {
                    path: ADMIN_SEGMENT,
                    children: adminRoutes.adminRoutes,
                  },
                  {
                    path: TRAINER_SEGMENT,
                    children: adminRoutes.trainerRoutes,
                  },
                  {
                    path: CLIENT_SEGMENT,
                    children: adminRoutes.clientRoutes,
                  },
                ],
              },
            ],
          },
        ],
      },
      ...commonRoutes
    ],
  },
]);

export default appRouter;
