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
import { useUserSettings } from "@/hooks/use-user-settings"
import { useI18n } from "@/hooks/use-i18n";
import { buildSentence } from "@/locales/translations";

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
                        <h2 className="text-xl font-semibold">{buildSentence(t, 'client', 'dashboard')}</h2>
                    </div>
                }
                footer={
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded">
                        {buildSentence(t, 'refresh', 'when', 'ready')}
                    </button>
                }
                className="max-w-md w-full text-center"
            >
                <p className="text-muted-foreground mb-3">
                    {buildSentence(t, 'your', 'client', 'dashboard', 'is', 'under', 'construction', 'and', 'will', 'be', 'available', 'soon')}
                </p>
                <p className="text-sm text-muted-foreground">
                    {buildSentence(t, 'we', 'are', 'working', 'on', 'bringing', 'you', 'insights', 'schedules', 'and', 'progress', 'tracking', 'right', 'here')}
                    {buildSentence(t, 'check', 'back', 'later', 'for', 'updates')}
                </p>
            </AppCard>
        </div>
    );
};

export default function CompactDashboard({ store }: CompactDashboardProps) {
    const { t } = useI18n();

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
    const { settings } = useUserSettings();

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

    const isSuperAdmin = user?.level === EUserLevels.SUPER_ADMIN;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <p className="text-red-500 mb-4">{t('error')}: {error.message}</p>
            </div>
        );
    }

    if (!data) {
        return <div>{buildSentence(t, 'no', 'dashboard', 'data', 'available')}</div>;
    }

    const periodLabel = period
        ? `${period.charAt(0).toUpperCase() + period.slice(1)} ${t('overview')}`
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
                                <h2 className="font-semibold text-md">{t('summary')}</h2>
                                <p className="text-xs text-muted-foreground">{dynamicDateLabel}</p>
                            </div>
                        }
                    >
                        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${isSuperAdmin ? '4' : '3'} gap-2`}>
                            {/* Super Admin: Total Admins */}
                            {overview.totalAdmins !== undefined && (
                                <AppCard
                                    className="flex-1 gap-2 bg-primary/30 dark:bg-[#20232a] shadow-2xl"
                                    header={
                                        <span className="text-sm font-medium dark:text-[#A3BFFD]">
                                            {buildSentence(t, 'total', 'admins')}
                                        </span>
                                    }
                                >
                                    <div className="space-y-2">
                                        <Users className="h-8 w-8 dark:text-[#A3BFFD]" />
                                        <div className="text-2xl font-bold dark:text-white">{overview.totalAdmins}</div>
                                    </div>
                                </AppCard>
                            )}

                            {/* Admin/Super Admin: Total Users */}
                            {overview.totalUsers !== undefined && (
                                <AppCard
                                    className="flex-1 gap-2 bg-[#FFE2E5] dark:bg-[#2f2232] shadow-2xl"
                                    header={
                                        <span className="text-sm font-medium dark:text-[#FFAEBC]">
                                            {buildSentence(t, 'total', 'users')}
                                        </span>
                                    }
                                >
                                    <div className="space-y-2">
                                        <Users className="h-8 w-8 dark:text-[#FFAEBC]" />
                                        <div className="text-2xl font-bold dark:text-white">{overview.totalUsers}</div>
                                    </div>
                                </AppCard>
                            )}

                            {/* Super Admin/Admin/Trainer: Total Trainers */}
                            {overview.totalTrainers !== undefined && (
                                <AppCard
                                    className="flex-1 gap-2 bg-secondary/30 dark:bg-[#213842] shadow-2xl"
                                    header={
                                        <span className="text-sm font-medium dark:text-[#51E1ED]">
                                            {buildSentence(t, 'total', 'trainers')}
                                        </span>
                                    }
                                    footer={
                                        <p className="text-xs text-muted-foreground dark:text-[#88E1F2]">
                                            {buildSentence(t, 'active')} {activeTrainerRate}%
                                        </p>
                                    }
                                >
                                    <div className="space-y-2">
                                        <img src={TrainersIcon} alt="Trainers" className="h-8 w-8 dark:brightness-110" />
                                        <div className="text-2xl font-bold dark:text-white">{overview.totalTrainers}</div>
                                    </div>
                                </AppCard>
                            )}

                            {/* Super Admin/Admin/Trainer: Total Clients */}
                            {overview.totalClients !== undefined && (
                                <AppCard
                                    className="flex-1 gap-2 bg-[#DCFCE7] dark:bg-[#204038] shadow-2xl"
                                    header={
                                        <span className="text-sm font-medium dark:text-[#6DFFB0]">
                                            {buildSentence(t, 'total', 'clients')}
                                        </span>
                                    }
                                    footer={
                                        <p className="text-xs text-muted-foreground dark:text-[#ABF1C8]">
                                            {buildSentence(t, 'active')} {overview.totalActiveClients || 0}/{overview.totalClients}
                                        </p>
                                    }
                                >
                                    <div className="space-y-2">
                                        <img src={ClientsIcon} alt="Clients" className="h-8 w-8 dark:brightness-110" />
                                        <div className="text-2xl font-bold dark:text-white">{overview.totalClients}</div>
                                    </div>
                                </AppCard>
                            )}

                            {/* All roles: Total Sessions */}
                            {overview.totalSessions !== undefined && (
                                <AppCard
                                    className="flex-1 gap-2 bg-blue-50 dark:bg-[#202c3b] shadow-2xl"
                                    header={
                                        <span className="text-sm font-medium dark:text-[#9AD0EC]">
                                            {buildSentence(t, 'total', 'sessions')}
                                        </span>
                                    }
                                    footer={
                                        <p className="text-xs text-muted-foreground dark:text-[#9AD0EC]">
                                            {overview.activeSessions || 0} {t('active')}, {overview.completedSessions || 0} {t('completed')}
                                        </p>
                                    }
                                >
                                    <div className="space-y-2">
                                        <Calendar className="h-8 w-8 dark:text-[#9AD0EC]" />
                                        <div className="text-2xl font-bold dark:text-white">{overview.totalSessions}</div>
                                    </div>
                                </AppCard>
                            )}

                            {/* Super Admin/Admin/Client: Total Billings */}
                            {overview.totalBillings !== undefined && (
                                <AppCard
                                    className="flex-1 gap-2 bg-green-50 dark:bg-[#17321E] shadow-2xl"
                                    header={
                                        <span className="text-sm font-medium dark:text-[#72F8BA]">
                                            {buildSentence(t, 'total', 'billings')}
                                        </span>
                                    }
                                    footer={
                                        <p className="text-xs text-muted-foreground dark:text-[#AFE6D2]">
                                            {overview.paidBillings || 0} {t('paid')}, {overview.pendingBillings || 0} {t('pending')}
                                        </p>
                                    }
                                >
                                    <div className="space-y-2">
                                        <Calendar className="h-8 w-8 dark:text-[#72F8BA]" />
                                        <div className="text-2xl font-bold dark:text-white">{overview.totalBillings}</div>
                                    </div>
                                </AppCard>
                            )}

                            {/* Super Admin/Admin/Client: Paid Billings / Revenue */}
                            {overview.paidBillings !== undefined && billingData && (
                                <AppCard
                                    className="flex-1 gap-2 bg-primary/30 dark:bg-[#372A49] shadow-2xl"
                                    header={
                                        <span className="text-sm font-medium dark:text-[#D7B3F5]">
                                            {buildSentence(t, 'total', 'revenue')}
                                        </span>
                                    }
                                    footer={
                                        <p className="text-xs text-muted-foreground dark:text-[#B9A6DA]">
                                            {billingData.revenue?.transactions || overview.paidBillings} {t('transactions')}
                                        </p>
                                    }
                                >
                                    <div className="space-y-2">
                                        <img src={RevenueIcon} alt="Revenue" className="h-8 w-8 dark:brightness-110" />
                                        <div className="text-2xl font-bold dark:text-white">
                                            {formatCurrency((billingData.revenue?.total || (overview.paidBillings || 0) * 100) / 100, undefined, undefined, 2, 2, settings)}
                                        </div>
                                    </div>
                                </AppCard>
                            )}

                            {/* Super Admin/Admin/Client: Pending Billings */}
                            {overview.pendingBillings !== undefined && billingData && (
                                <AppCard
                                    className="flex-1 gap-2 bg-[#FFE2E5] dark:bg-[#442733] shadow-2xl"
                                    header={
                                        <span className="text-sm font-medium dark:text-[#FFB2C9]">
                                            {buildSentence(t, 'pending', 'billings')}
                                        </span>
                                    }
                                    footer={
                                        <p className="text-xs text-muted-foreground dark:text-[#FFDDE9]">
                                            {billingData.summary?.pending_billings || overview.pendingBillings} {t('awaiting')}
                                        </p>
                                    }
                                >
                                    <div className="space-y-2">
                                        <img src={PendingPymentsIcon} alt="Pending Payments" className="h-8 w-8 dark:brightness-110" />
                                        <div className="text-2xl font-bold dark:text-white">
                                            {formatCurrency((billingData.summary?.total_pending || (overview.pendingBillings || 0) * 100) / 100, undefined, undefined, 2, 2, settings)}
                                        </div>
                                    </div>
                                </AppCard>
                            )}


                        </div>
                    </AppCard>
                </div>

                <div className="space-y-4">
                    <KPICard
                        title={buildSentence(t, 'performance', 'overview')}
                        subtitle={dynamicDateLabel}
                        metrics={[
                            {
                                label: buildSentence(t, 'session', 'completion'),
                                value: metrics.sessionCompletionRate || 0,
                                status:
                                    (metrics.sessionCompletionRate || 0) > 80 ? "good" : (metrics.sessionCompletionRate || 0) > 50 ? "warning" : "danger",
                                icon: <Calendar className="h-3 w-3" />,
                            },
                            {
                                label: buildSentence(t, 'client', 'engagement'),
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
                                label: buildSentence(t, 'session', 'utilization'),
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
                                ? buildSentence(t, 'no', 'sessions', 'completed', 'yet', 'check', 'session', 'management')
                                : (metrics.paymentSuccessRate === 0 || !metrics.paymentSuccessRate) && (overview.totalBillings || 0) > 0
                                    ? buildSentence(t, 'payment', 'processing', 'needs', 'attention')
                                    : Number.parseFloat(billingPendingRate) > 50
                                        ? `${billingPendingRate}% ${buildSentence(t, 'of', 'billings', 'are', 'pending')}`
                                        : undefined
                        }
                    />

                    {/* Referral Links Stats - Under Performance Overview */}
                    {referralLinks && (
                        <AppCard
                            header={
                                <div>
                                    <h2 className="font-semibold text-md">{buildSentence(t, 'referral', 'links', 'statistics')}</h2>
                                    <p className="text-xs text-muted-foreground">{dynamicDateLabel}</p>
                                </div>
                            }
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3">
                                    <p className="text-sm text-muted-foreground mb-1">{buildSentence(t, 'total', 'links')}</p>
                                    <p className="text-2xl font-bold">{referralLinks.total}</p>
                                </div>
                                <div className="text-center p-3">
                                    <p className="text-sm text-muted-foreground mb-1">{buildSentence(t, 'active', 'links')}</p>
                                    <p className="text-2xl font-bold">{referralLinks.active}</p>
                                </div>
                                <div className="text-center p-3">
                                    <p className="text-sm text-muted-foreground mb-1">{buildSentence(t, 'total', 'referrals')}</p>
                                    <p className="text-2xl font-bold">{referralLinks.totalReferralCount}</p>
                                </div>
                                <div className="text-center p-3">
                                    <p className="text-sm text-muted-foreground mb-1">{buildSentence(t, 'total', 'uses')}</p>
                                    <p className="text-2xl font-bold">{referralLinks.totalUses}</p>
                                </div>
                            </div>
                        </AppCard>
                    )}
                </div>
            </div>

            <SessionsAnalyticsCard dynamicDateLabel={dynamicDateLabel} data={sessionsData} loading={sessionsLoading || isLoading} />


            <BillingOverview dynamicDateLabel={dynamicDateLabel} isSuperAdmin={isSuperAdmin} data={billingData} loading={billingLoading || isLoading} />

        </div>
    )
}
