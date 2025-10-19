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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{billing.title}</h1>
                    <p className="text-muted-foreground mt-1">{billing.description}</p>
                </div>
                <Badge variant={status.variant} className={`text-sm ${status.color}`}>
                    {status.label}
                </Badge>
            </div>

            {/* Main Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Amount and Due Date */}
                <AppCard>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Payment Details
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Amount:</span>
                                <span className="text-2xl font-bold text-green-600">${billing.amount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Issue Date:</span>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{format(new Date(billing.issueDate), "MMM dd, yyyy")}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Due Date:</span>
                                <div className={`flex items-center gap-1 ${isOverdue ? "text-red-600" : ""}`}>
                                    <Calendar className="h-4 w-4" />
                                    <span>{format(new Date(billing.dueDate), "MMM dd, yyyy")}</span>
                                    {isOverdue && <AlertCircle className="h-4 w-4" />}
                                </div>
                            </div>
                        </div>
                    </div>
                </AppCard>

                {/* Type and Recurrence */}
                <AppCard>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Billing Type
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Type:</span>
                                <Badge variant="outline" className="capitalize">
                                    {billing.type.toLowerCase()}
                                </Badge>
                            </div>
                            {billing.recurrence && billing.recurrence !== EScheduleFrequency.ONCE && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Recurrence:</span>
                                    <Badge variant="outline" className="capitalize">
                                        {billing.recurrence.toLowerCase()}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>
                </AppCard>
            </div>

            {/* Participants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Trainer */}
                <AppCard>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Trainer
                        </h3>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{billing?.recipientUser?.profile?.firstName} {billing?.recipientUser?.profile?.lastName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{billing?.recipientUser?.email}</p>
                    </div>
                </AppCard>

                
            </div>

            {/* Notes */}
            {billing.notes && (
                <AppCard>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Notes
                        </h3>
                        <p className="text-sm">{billing.notes}</p>
                    </div>
                </AppCard>
            )}

            {/* Reminders */}
            {billing.enableReminders && (
                <AppCard>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Reminders
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Enabled:</span>
                                <Badge variant="default">Yes</Badge>
                            </div>
                            {billing.reminderConfig && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Types:</span>
                                    <div className="flex gap-1">
                                        {billing.reminderConfig.reminderTypes.map((type, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {type}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </AppCard>
            )}

            {/* Timestamps */}
            <AppCard>
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Timestamps
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Created:</span>
                            <span className="text-sm text-muted-foreground">
                                {billing.createdAt && format(new Date(billing.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Updated:</span>
                            <span className="text-sm text-muted-foreground">
                                {billing.updatedAt && format(new Date(billing.updatedAt), "MMM dd, yyyy 'at' h:mm a")}
                            </span>
                        </div>
                    </div>
                </div>
            </AppCard>
        </div>
    );
}