// src/routes/appRouter.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ROOT_ROUTE, ADMIN_ROUTES } from "@/config/routes.config";

import { MainLayout, DashboardLayoutWrapper, AuthLayout } from "@/layouts";
import { PrivateRoute, PublicRoute } from "@/routes";

// Pages Routes
import commonRoutes, { authRoutes, adminRoutes, } from "@/pages/routes";


const appRouter = createBrowserRouter([
  {
    path: ROOT_ROUTE,
    element: <MainLayout />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: authRoutes,
          },
        ],
      },
      {
        element: <PrivateRoute />,
        children: [
          {
            index: true,
            element: <Navigate to={ADMIN_ROUTES.DASHBOARD} replace />,
          },
          {
            element: <DashboardLayoutWrapper />,
            children: adminRoutes,
          },

        ],
      },
      ...commonRoutes
    ],
  },
]);

export default appRouter;
