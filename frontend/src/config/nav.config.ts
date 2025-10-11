import {Activity, type LucideIcon, UserCheck, FileText, CalendarClock, Database, Workflow, Server, Cpu } from "lucide-react";
import { ADMIN_ROUTES } from "./routes.config";

// Separate settings configuration object

export const navItems: {
    title: string;
    icon?: LucideIcon;
    urls: string[];
    children?: {
        title: string;
        icon?: LucideIcon;
        url: string;
    }[];
}[] = [
   
        {
            title: "Users",
            urls: [ADMIN_ROUTES.USERS],
            icon: UserCheck,
        },
        {
            title: "Activit Logs",
            urls: [ADMIN_ROUTES.ACTIVITY_LOGS],
            icon: Activity,
        },
        {
            title: "Files",
            urls: [ADMIN_ROUTES.FILES],
            icon: FileText,
        },
        {
            title: "Schedules",
            urls: [ADMIN_ROUTES.SCHEDULES],
            icon: CalendarClock,
        },
        {
            title: "Queue Management",
            urls: [ADMIN_ROUTES.QUEUES],
            icon: Database,
        },
        {
            title: "Job Management",
            urls: [ADMIN_ROUTES.JOBS],
            icon: Workflow,
        },
        {
            title: "Cluster Dashboard",
            urls: [ADMIN_ROUTES.CLUSTER],
            icon: Server,
        },
        {
            title: "Worker Management",
            urls: [ADMIN_ROUTES.WORKERS],
            icon: Cpu,
        },
    ];


