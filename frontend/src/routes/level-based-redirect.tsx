import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthUser } from "@/hooks/use-auth-user";
import { PUBLIC_ROUTES, ROOT_ROUTE, ROUTES_REDIRECTS, SEGMENTS } from "@/config/routes.config";
import { AppLoader } from "@/components/layout-ui/app-loader";

const LevelBasedRedirect = () => {
  const { user, isLoading } = useAuthUser();
  const location = useLocation();

  if (isLoading) return <AppLoader />;

  if (!user) return <Navigate to={PUBLIC_ROUTES.LOGIN} replace />;

  if (!location.pathname.includes(SEGMENTS[user.level])
    || location.pathname === ROOT_ROUTE
    || location.pathname === SEGMENTS[user.level]
  ) {
    const redirectPath = ROUTES_REDIRECTS[user.level];

    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;

};

export default LevelBasedRedirect; 