import {Activity, type LucideIcon, UserCheck, FileText, CalendarClock, Database, Workflow, Server, Cpu, Shield, Users, UserPlus, UserCog, Calendar } from "lucide-react";
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
            title: "Trainers",
            urls: [ADMIN_ROUTES.TRAINERS],
            icon: Users,
        },
        {
            title: "Clients",
            urls: [ADMIN_ROUTES.CLIENTS],
            icon: UserPlus,
        },
        {
            title: "Trainer-Clients",
            urls: [ADMIN_ROUTES.TRAINER_CLIENTS],
            icon: UserCog,
        },
        {
            title: "Sessions",
            urls: [ADMIN_ROUTES.SESSIONS],
            icon: Calendar,
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
       
    ];


