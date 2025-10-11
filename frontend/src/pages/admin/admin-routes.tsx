import { ADMIN_ROUTES } from "@/config/routes.config";
import UsersPage from "./users";
import ActivityLogsPage from "./activity-logs";
import FilesPage from "./files";
import SchedulesPage from "./schedules";
import QueuesPage from "./queues";
import ClusterPage from "./cluster";
import WorkersPage from "./workers";

const adminRoutes = [
  {
    path: ADMIN_ROUTES.USERS,
    element: <UsersPage />,
  },
  {
    path: ADMIN_ROUTES.ACTIVITY_LOGS,
    element: <ActivityLogsPage />,
  },
  {
    path: ADMIN_ROUTES.FILES,
    element: <FilesPage />,
  },
  {
    path: ADMIN_ROUTES.SCHEDULES,
    element: <SchedulesPage />,
  },
  {
    path: ADMIN_ROUTES.QUEUES,
    element: <QueuesPage />,
  },
  {
    path: ADMIN_ROUTES.CLUSTER,
    element: <ClusterPage />,
  },
  {
    path: ADMIN_ROUTES.WORKERS,
    element: <WorkersPage />,
  },
];

export default adminRoutes;
