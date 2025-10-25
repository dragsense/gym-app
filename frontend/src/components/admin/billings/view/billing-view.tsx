// External Libraries
import React from 'react';
import { useShallow } from 'zustand/shallow';
import { useId, useMemo, useTransition } from 'react';
import { format } from 'date-fns';

// Components
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { DollarSign, Calendar, User, Users, AlertCircle, FileText, Clock } from "lucide-react";

// Types
import { type IBilling } from "@shared/interfaces/billing.interface";
import { EBillingStatus, EBillingType } from "@shared/enums/billing.enum";
// Stores
import { type TSingleHandlerStore } from "@/stores";
import { type THandlerComponentProps } from "@/@types/handler-types";
import { EScheduleFrequency } from '@shared/enums';

export type TBillingViewExtraProps = {
    // Add any extra props if needed
}

interface IBillingViewProps extends THandlerComponentProps<TSingleHandlerStore<IBilling, TBillingViewExtraProps>> {
}

export default function BillingView({ storeKey, store }: IBillingViewProps) {
    // React 19: Essential IDs and transitions
    const componentId = useId();
    const [, startTransition] = useTransition();

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { response: billing, action, reset } = store(useShallow(state => ({
        response: state.response,
        action: state.action,
        reset: state.reset,
    })));

    if (!billing) {
        return null;
    }

    const handleCloseView = () => {
        startTransition(() => reset());
    };

    return (
        <Dialog open={action === 'view'} onOpenChange={handleCloseView} data-component-id={componentId}>
            <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
                <AppDialog
                    title="Billing Details"
                    description="View detailed information about this billing"
                >
                    <BillingDetailContent billing={billing} />
                </AppDialog>
            </DialogContent>
        </Dialog>
    );
}

interface IBillingDetailContentProps {
    billing: IBilling;
}

function BillingDetailContent({ billing }: IBillingDetailContentProps) {
    // React 19: Essential IDs
    const componentId = useId();

    // React 19: Memoized date formatting for better performance
    const issueDate = useMemo(() =>
        billing.issueDate ? format(new Date(billing.issueDate), 'EEEE, MMMM dd, yyyy') : '',
        [billing.issueDate]
    );

    const dueDate = useMemo(() =>
        billing.dueDate ? format(new Date(billing.dueDate), 'EEEE, MMMM dd, yyyy') : '',
        [billing.dueDate]
    );

    const createdDate = useMemo(() =>
        billing.createdAt ? format(new Date(billing.createdAt), 'EEEE, MMMM dd, yyyy') : '',
        [billing.createdAt]
    );

    const updatedDate = useMemo(() =>
        billing.updatedAt ? format(new Date(billing.updatedAt), 'EEEE, MMMM dd, yyyy') : '',
        [billing.updatedAt]
    );

    // React 19: Memoized status configuration
    const statusConfig = useMemo(() => ({
        [EBillingStatus.PENDING]: { variant: "secondary" as const, label: "Pending", color: "text-yellow-600" },
        [EBillingStatus.PAID]: { variant: "default" as const, label: "Paid", color: "text-green-600" },
        [EBillingStatus.OVERDUE]: { variant: "destructive" as const, label: "Overdue", color: "text-red-600" },
        [EBillingStatus.CANCELLED]: { variant: "outline" as const, label: "Cancelled", color: "text-gray-600" },
        [EBillingStatus.REFUNDED]: { variant: "outline" as const, label: "Refunded", color: "text-blue-600" },
    }), []);

    const status = statusConfig[billing.status] || { variant: "secondary" as const, label: billing.status, color: "text-gray-600" };
    const isOverdue = new Date(billing.dueDate) < new Date() && billing.status === EBillingStatus.PENDING;

    return (
        <div className="space-y-6" data-component-id={componentId}>
            {/* Quick Preview Card */}
            <AppCard className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
                        <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {billing.title}
                        </h2>
                        <p className="text-green-600 font-medium">${billing.amount}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={status.variant} className={`text-sm ${status.color}`}>
                                {status.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                {dueDate}
                            </span>
                        </div>
                    </div>
                </div>
            </AppCard>

            <div className="space-y-6">
                {/* Billing Information */}
                <AppCard
                    header={
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            <div>
                                <span className="font-semibold">Billing Information</span>
                                <p className="text-sm text-muted-foreground">Details about this billing</p>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><DollarSign className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Amount:</span>
                                <p className="font-medium text-2xl text-green-600">${billing.amount}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Calendar className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Issue Date:</span>
                                <p className="font-medium">{issueDate}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Calendar className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Due Date:</span>
                                <p className={`font-medium ${isOverdue ? "text-red-600" : ""}`}>
                                    {dueDate}
                                    {isOverdue && <AlertCircle className="inline w-4 h-4 ml-2" />}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><FileText className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Type:</span>
                                <p className="font-medium capitalize">{billing.type}</p>
                            </div>
                        </div>
                        {billing.recurrence && billing.recurrence !== EScheduleFrequency.ONCE && (
                            <div className="flex items-center gap-3">
                                <div className="text-muted-foreground"><Clock className="w-4 h-4" /></div>
                                <div className="flex-1">
                                    <span className="text-sm text-muted-foreground">Recurrence:</span>
                                    <p className="font-medium capitalize">{billing.recurrence}</p>
                                </div>
                            </div>
                        )}
                        {billing.description && (
                            <div className="flex items-start gap-3">
                                <div className="text-muted-foreground mt-1"><FileText className="w-4 h-4" /></div>
                                <div className="flex-1">
                                    <span className="text-sm text-muted-foreground">Description:</span>
                                    <p className="font-medium mt-1">{billing.description}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </AppCard>

                {/* Trainer Information */}
                <AppCard
                    header={
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            <div>
                                <span className="font-semibold">Trainer</span>
                                <p className="text-sm text-muted-foreground">Billing recipient details</p>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><User className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Name:</span>
                                <p className="font-medium">
                                    {billing?.recipientUser?.profile?.firstName} {billing?.recipientUser?.profile?.lastName}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><User className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Email:</span>
                                <p className="font-medium">{billing?.recipientUser?.email}</p>
                            </div>
                        </div>
                    </div>
                </AppCard>

                {/* Reminders */}
                {billing.enableReminders && (
                    <AppCard
                        header={
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <div>
                                    <span className="font-semibold">Reminders</span>
                                    <p className="text-sm text-muted-foreground">Notification settings for this billing</p>
                                </div>
                            </div>
                        }
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="text-muted-foreground"><Clock className="w-4 h-4" /></div>
                                <div className="flex-1">
                                    <span className="text-sm text-muted-foreground">Enabled:</span>
                                    <p className="font-medium">Yes</p>
                                </div>
                            </div>
                            {billing.reminderConfig && (
                                <div className="flex items-start gap-3">
                                    <div className="text-muted-foreground mt-1"><FileText className="w-4 h-4" /></div>
                                    <div className="flex-1">
                                        <span className="text-sm text-muted-foreground">Types:</span>
                                        <div className="flex gap-1 mt-1">
                                            {billing.reminderConfig.reminderTypes.map((type, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {type}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </AppCard>
                )}

                {/* Notes */}
                {billing.notes && (
                    <AppCard
                        header={
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                <div>
                                    <span className="font-semibold">Notes</span>
                                    <p className="text-sm text-muted-foreground">Additional information about this billing</p>
                                </div>
                            </div>
                        }
                    >
                        <p className="text-sm">{billing.notes}</p>
                    </AppCard>
                )}

                {/* Timestamps */}
                <AppCard
                    header={
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            <div>
                                <span className="font-semibold">Timestamps</span>
                                <p className="text-sm text-muted-foreground">Creation and update information</p>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Clock className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Created:</span>
                                <p className="font-medium">{createdDate}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Clock className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Updated:</span>
                                <p className="font-medium">{updatedDate}</p>
                            </div>
                        </div>
                    </div>
                </AppCard>
            </div>
        </div>
    );
}