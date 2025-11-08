import type React from "react"

import {
    Users,
    Calendar,
    AlertTriangle,
    Hourglass,
    Activity,
} from "lucide-react"
import { AppCard } from "@/components/layout-ui/app-card"

// Types
import { type ICombinedDashboardData } from "@shared/interfaces/dashboard.interface"
import { BillingOverview, SessionsAnalyticsCard } from "./cards"
import { useAuthUser } from "@/hooks/use-auth-user"
import { EUserLevels } from "@shared/enums/user.enum"
import { formatCurrency } from "@/lib/utils"
import { fetchSessionsAnalytics, fetchBillingAnalytics } from "@/services/dashboard.api"
import { useEffect, useState } from "react"
import type { ISessionsAnalytics, IBillingAnalytics } from "@shared/interfaces/dashboard.interface"

import RevenueIcon from '@/assets/icons/revenue.png';
import PendingPymentsIcon from '@/assets/icons/payments.png';
import TrainersIcon from '@/assets/icons/trainers.png';
import ClientsIcon from '@/assets/icons/clients.png';
import { Progress } from "@/components/ui/progress"
import { type IExtraProps } from "./dashboard-view"
import type { TSingleHandlerStore } from "@/stores"


interface CompactDashboardProps {
    store: TSingleHandlerStore<ICombinedDashboardData, IExtraProps>
}

// Ultra-compact KPI card
function KPICard({
    title,
    subtitle,
    metrics,
    alert,
}: {
    title: string,
    subtitle: string
    metrics: Array<{
        label: string
        value: number
        status?: "good" | "warning" | "danger"
        icon?: React.ReactNode
    }>
    alert?: string
}) {
    return (
        <AppCard className="h-fit">

            <div className="mb-2">
                <h3 className="font-semibold text-md flex items-center gap-2">
                    {title}
                    {alert && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                </h3>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="space-y-2">
                {metrics.map((metric, index) => (
                    <div key={index} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-5 justify-between">
                        <div className="flex flex-1 items-center gap-2">
                            {metric.icon && <span className="">{metric.icon}</span>}
                            <span className="text-xs ">{metric.label}</span>

                        </div>
                        <div
                            className={`text-sm flex-1 text-right bg-secondary/20 font-bold ${metric.status === "good"
                                ? "text-foreground/70"
                                : metric.status === "warning"
                                    ? "text-foreground/80"
                                    : metric.status === "danger"
                                        ? "text-foreground/90"
                                        : "text-foreground"
                                }`}
                        >
                            <span className="px-2">{metric.value}%</span>
                            <Progress className="bg-secondary/20" subClassName="bg-secondary" value={metric.value} />

                        </div>
                    </div>
                ))}
            </div>
            {alert && (
                <div className="mt-3 p-2 bg-amber-50 rounded text-xs text-amber-700 border-l-2 border-amber-200">{alert}</div>
            )}

        </AppCard>
    )
}

const ClientDashboardPlaceholder = () => {
    return (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
            <AppCard
                header={
                    <div className="flex items-center gap-3">
                        <Hourglass className="w-6 h-6 text-muted-foreground" />
                        <h2 className="text-xl font-semibold">Client Dashboard</h2>
                    </div>
                }
                footer={
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded">
                        Refresh when ready
                    </button>
                }
                className="max-w-md w-full text-center"
            >
                <p className="text-muted-foreground mb-3">
                    Your client dashboard is under construction and will be available soon.
                </p>
                <p className="text-sm text-muted-foreground">
                    We're working on bringing you insights, schedules, and progress tracking right here.
                    Check back later for updates!
                </p>
            </AppCard>
        </div>
    );
};

export default function CompactDashboard({ store }: CompactDashboardProps) {

    const period = store((state) => state.extra.period)
    const customRange = store((state) => state.extra.customRange)
    const isLoading = store((state) => state.isLoading)
    const data = store((state) => state.response)
    const error = store((state) => state.error)

    const [sessionsData, setSessionsData] = useState<ISessionsAnalytics | null>(null)
    const [billingData, setBillingData] = useState<IBillingAnalytics | null>(null)
    const [sessionsLoading, setSessionsLoading] = useState(false)
    const [billingLoading, setBillingLoading] = useState(false)

    const { user } = useAuthUser();

    // Fetch sessions and billing analytics when period or date range changes
    useEffect(() => {
        if (!data) return;

        const fetchAnalytics = async () => {
            const params: Record<string, string | undefined> = {};

            if (period) {
                params.period = period;
            }

            if (customRange?.from) {
                params.from = customRange.from.toISOString().split("T")[0];
            }

            if (customRange?.to) {
                params.to = customRange.to.toISOString().split("T")[0];
            }

            try {
                setSessionsLoading(true);
                setBillingLoading(true);

                const [sessions, billing] = await Promise.all([
                    fetchSessionsAnalytics(params),
                    fetchBillingAnalytics(params)
                ]);

                setSessionsData(sessions as ISessionsAnalytics);
                setBillingData(billing as IBillingAnalytics);
            } catch (err) {
                console.error("Failed to fetch analytics:", err);
            } finally {
                setSessionsLoading(false);
                setBillingLoading(false);
            }
        };

        fetchAnalytics();
    }, [period, customRange, data]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <AppCard key={i}>
                        <div className="p-4">
                            <div className="animate-pulse space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-6 bg-gray-200 rounded w-1/2" />
                                <div className="h-3 bg-gray-200 rounded w-full" />
                            </div>
                        </div>
                    </AppCard>
                ))}
            </div>
        )
    }

    if (user?.level === EUserLevels.USER) {
        return <ClientDashboardPlaceholder />
    }

    const isAdmin = user?.level === EUserLevels.SUPER_ADMIN;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <p className="text-red-500 mb-4">Error: {error.message}</p>
            </div>
        );
    }

    if (!data) {
        return <div>No dashboard data available</div>;
    }

    const periodLabel = period
        ? `${period.charAt(0).toUpperCase() + period.slice(1)} Overview`
        : '';

    const dynamicDateLabel = customRange ? `${customRange.from?.toDateString()} - ${customRange.to?.toDateString()}` : periodLabel

    const { overview, metrics, referralLinks } = data;


    // Calculate derived metrics
    const activeClientRate =
        (overview.totalClients || 0) > 0 ? (((overview.totalActiveClients || 0) / (overview.totalClients || 1)) * 100).toFixed(1) : "0"
    const activeTrainerRate =
        (overview.totalTrainers || 0) > 0 ? (((overview.totalActiveTrainers || 0) / (overview.totalTrainers || 1)) * 100).toFixed(1) : "0"
    const sessionUtilization =
        (overview.totalSessions || 0) > 0 ? (((overview.activeSessions || 0) / (overview.totalSessions || 1)) * 100).toFixed(1) : "0"
    const billingPendingRate =
        (overview.totalBillings || 0) > 0 ? (((overview.pendingBillings || 0) / (overview.totalBillings || 1)) * 100).toFixed(1) : "0"

    return (
        <div className="space-y-6">
            {/* People & Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
                <div className="space-y-2">
                    <AppCard
                        className="gap-2"
                        header={
                            <div>
                                <h2 className="font-semibold text-md">Summary</h2>
                                <p className="text-xs text-muted-foreground">{dynamicDateLabel}</p>
                            </div>
                        }
                    >
                        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${isAdmin ? '4' : '3'} gap-2`}>
                            {/* Super Admin: Total Admins */}
                            {overview.totalAdmins !== undefined && (
                                <AppCard
                                    className="flex-1 gap-2 bg-purple-50 dark:bg-purple-950/20 shadow-2xl"
                                    header={<span className="text-sm font-medium">Total Admins</span>}
                                >
                                    <div className="space-y-2">
                                        <Users className="h-8 w-8 text-purple-600" />
                                        <div className="text-2xl font-bold">{overview.totalAdmins}</div>
                                    </div>
                                </AppCard>
                            )}

                            {/* Admin/Super Admin: Total Users */}
                            {overview.totalUsers !== undefined && (
                                <AppCard
                                    className="flex-1 gap-2 bg-indigo-50 dark:bg-indigo-950/20 shadow-2xl"
                                    header={<span className="text-sm font-medium">Total Users</span>}
                                >
                                    <div className="space-y-2">
                                        <Users className="h-8 w-8 text-indigo-600" />
                                        <div className="text-2xl font-bold">{overview.totalUsers}</div>
                                    </div>
                                </AppCard>
                            )}

                            {/* Super Admin/Admin/Trainer: Total Trainers */}
                            {overview.totalTrainers !== undefined && (
                                <AppCard
                                    className="flex-1 gap-2 bg-secondary/30 shadow-2xl"
                                    header={<span className="text-sm font-medium">Total Trainers</span>}
                                    footer={<p className="text-xs text-muted-foreground">{`Active ${activeTrainerRate}%`}</p>}
                                >
                                    <div className="space-y-2">
                                        <img src={TrainersIcon} alt="Trainers" className="h-8 w-8" />
                                        <div className="text-2xl font-bold">{overview.totalTrainers}</div>
                                    </div>
                                </AppCard>
                            )}

                            {/* Super Admin/Admin/Trainer: Total Clients */}
                            {overview.totalClients !== undefined && (
                                <AppCard
                                    className="flex-1 gap-2 bg-[#DCFCE7] dark:bg-green-950/20 shadow-2xl"
                                    header={<span className="text-sm font-medium">Total Clients</span>}
                                    footer={<p className="text-xs text-muted-foreground">{`Active ${overview.totalActiveClients || 0}/${overview.totalClients}`}</p>}
                                >
                                    <div className="space-y-2">
                                        <img src={ClientsIcon} alt="Clients" className="h-8 w-8" />
                                        <div className="text-2xl font-bold">{overview.totalClients}</div>
                                    </div>
                                </AppCard>
                            )}

                            {/* All roles: Total Sessions */}
                            {overview.totalSessions !== undefined && (
                                <AppCard
                                    className="flex-1 gap-2 bg-blue-50 dark:bg-blue-950/20 shadow-2xl"
                                    header={<span className="text-sm font-medium">Total Sessions</span>}
                                    footer={<p className="text-xs text-muted-foreground">{`${overview.activeSessions || 0} active, ${overview.completedSessions || 0} completed`}</p>}
                                >
                                    <div className="space-y-2">
                                        <Calendar className="h-8 w-8 text-blue-600" />
                                        <div className="text-2xl font-bold">{overview.totalSessions}</div>
                                    </div>
                                </AppCard>
                            )}

                            {/* Super Admin/Admin/Client: Total Billings */}
                            {overview.totalBillings !== undefined && (
                                <AppCard
                                    className="flex-1 gap-2 bg-green-50 dark:bg-green-950/20 shadow-2xl"
                                    header={<span className="text-sm font-medium">Total Billings</span>}
                                    footer={<p className="text-xs text-muted-foreground">{`${overview.paidBillings || 0} paid, ${overview.pendingBillings || 0} pending`}</p>}
                                >
                                    <div className="space-y-2">
                                        <Calendar className="h-8 w-8 text-green-600" />
                                        <div className="text-2xl font-bold">{overview.totalBillings}</div>
                                    </div>
                                </AppCard>
                            )}

                            {/* Super Admin/Admin/Client: Paid Billings / Revenue */}
                            {overview.paidBillings !== undefined && billingData && (
                                <AppCard
                                    className="flex-1 gap-2 bg-primary/30 shadow-2xl"
                                    header={<span className="text-sm font-medium">Total Revenue</span>}
                                    footer={<p className="text-xs text-muted-foreground">{`${billingData.revenue?.transactions || overview.paidBillings} transactions`}</p>}
                                >
                                    <div className="space-y-2">
                                        <img src={RevenueIcon} alt="Revenue" className="h-8 w-8" />
                                        <div className="text-2xl font-bold">{formatCurrency((billingData.revenue?.total || (overview.paidBillings || 0) * 100) / 100)}</div>
                                    </div>
                                </AppCard>
                            )}

                            {/* Super Admin/Admin/Client: Pending Billings */}
                            {overview.pendingBillings !== undefined && billingData && (
                                <AppCard
                                    className="flex-1 gap-2 bg-[#FFE2E5] dark:bg-red-950/20 shadow-2xl"
                                    header={<span className="text-sm font-medium">Pending Billings</span>}
                                    footer={<p className="text-xs text-muted-foreground">{`${billingData.summary?.pending_billings || overview.pendingBillings} awaiting`}</p>}
                                >
                                    <div className="space-y-2">
                                        <img src={PendingPymentsIcon} alt="Pending Payments" className="h-8 w-8" />
                                        <div className="text-2xl font-bold">{formatCurrency((billingData.summary?.total_pending || (overview.pendingBillings || 0) * 100) / 100)}</div>
                                    </div>
                                </AppCard>
                            )}

                            {/* Referral Links */}
                            {referralLinks && (
                                <AppCard
                                    className="flex-1 gap-2 bg-blue-50 dark:bg-blue-950/20 shadow-2xl"
                                    header={<span className="text-sm font-medium">Referral Links</span>}
                                    footer={<p className="text-xs text-muted-foreground">{`${referralLinks.active} active, ${referralLinks.totalUses} uses`}</p>}
                                >
                                    <div className="space-y-2">
                                        <Activity className="h-8 w-8 text-blue-600" />
                                        <div className="text-2xl font-bold">{referralLinks.total}</div>
                                    </div>
                                </AppCard>
                            )}
                        </div>
                    </AppCard>
                </div>

                <div className="space-y-4">
                    <KPICard
                        title="Performance Overview"
                        subtitle={dynamicDateLabel}
                        metrics={[
                            {
                                label: "Session Completion",
                                value: metrics.sessionCompletionRate || 0,
                                status:
                                    (metrics.sessionCompletionRate || 0) > 80 ? "good" : (metrics.sessionCompletionRate || 0) > 50 ? "warning" : "danger",
                                icon: <Calendar className="h-3 w-3" />,
                            },
                            {
                                label: "Client Engagement",
                                value: +activeClientRate,
                                status:
                                    Number.parseFloat(activeClientRate) > 80
                                        ? "good"
                                        : Number.parseFloat(activeClientRate) > 60
                                            ? "warning"
                                            : "danger",
                                icon: <Users className="h-3 w-3" />,
                            },
                            {
                                label: "Session Utilization",
                                value: +sessionUtilization,
                                status:
                                    Number.parseFloat(sessionUtilization) > 80
                                        ? "good"
                                        : Number.parseFloat(sessionUtilization) > 60
                                            ? "warning"
                                            : "danger",
                                icon: <Calendar className="h-3 w-3" />,
                            },
                        ]}
                        alert={
                            (metrics.sessionCompletionRate === 0 || !metrics.sessionCompletionRate) && (overview.totalSessions || 0) > 0
                                ? "No sessions completed yet - check session management"
                                : (metrics.paymentSuccessRate === 0 || !metrics.paymentSuccessRate) && (overview.totalBillings || 0) > 0
                                    ? "Payment processing needs attention"
                                    : Number.parseFloat(billingPendingRate) > 50
                                        ? `${billingPendingRate}% of billings are pending`
                                        : undefined
                        }
                    />

                    {/* Referral Links Stats - Under Performance Overview */}
                    {referralLinks && (
                        <AppCard
                            header={
                                <div>
                                    <h2 className="font-semibold text-md">Referral Links Statistics</h2>
                                    <p className="text-xs text-muted-foreground">{dynamicDateLabel}</p>
                                </div>
                            }
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3">
                                    <p className="text-sm text-muted-foreground mb-1">Total Links</p>
                                    <p className="text-2xl font-bold">{referralLinks.total}</p>
                                </div>
                                <div className="text-center p-3">
                                    <p className="text-sm text-muted-foreground mb-1">Active Links</p>
                                    <p className="text-2xl font-bold">{referralLinks.active}</p>
                                </div>
                                <div className="text-center p-3">
                                    <p className="text-sm text-muted-foreground mb-1">Total Referrals</p>
                                    <p className="text-2xl font-bold">{referralLinks.totalReferralCount}</p>
                                </div>
                                <div className="text-center p-3">
                                    <p className="text-sm text-muted-foreground mb-1">Total Uses</p>
                                    <p className="text-2xl font-bold">{referralLinks.totalUses}</p>
                                </div>
                            </div>
                        </AppCard>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
                <div>
                    <SessionsAnalyticsCard dynamicDateLabel={dynamicDateLabel} data={sessionsData} loading={sessionsLoading || isLoading} />
                </div>
                {/* Reminders card removed - not available in backend */}
            </div>

            <BillingOverview dynamicDateLabel={dynamicDateLabel} isAdmin={isAdmin} data={billingData} loading={billingLoading || isLoading} />

        </div>
    )
}
