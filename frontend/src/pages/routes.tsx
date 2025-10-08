


import { COMMON_ROUTES } from "@/config/routes.config";
import NotFound from "./404";
import UnauthorizedPage from "./unauthorized";

const commonRoutes = [
    {
        path: COMMON_ROUTES.NOT_FOUND,
        element: <NotFound />,
    },
    {
        path: COMMON_ROUTES.UNAUTHORIZED,
        element: <UnauthorizedPage />,
    }
];

export default commonRoutes;

export { default as authRoutes } from "./auth/auth-routes";
export { default as adminRoutes } from "./admin/admin-routes";
