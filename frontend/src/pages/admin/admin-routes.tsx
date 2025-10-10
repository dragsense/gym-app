import { ADMIN_ROUTES } from "@/config/routes.config";
import UsersPage from "./users";
import ActivityLogsPage from "./activity-logs";

const adminRoutes = [
  {
    path: ADMIN_ROUTES.USERS,
    element: <UsersPage />,
  },
  {
    path: ADMIN_ROUTES.ACTIVITY_LOGS,
    element: <ActivityLogsPage />,
  },
];

export default adminRoutes;
