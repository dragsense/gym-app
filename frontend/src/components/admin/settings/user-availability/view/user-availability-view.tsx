// External Libraries
import { useShallow } from 'zustand/shallow';
import { useId, useMemo, useTransition } from 'react';

// Components
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { Calendar, Clock, User } from "lucide-react";

// Types
import { type IUserAvailability } from "@shared/interfaces/user-availability.interface";
import { EDayOfWeek, EDayOfWeekLabel, EAvailabilityStatus } from "@shared/enums";

// Stores
import { type TSingleHandlerStore } from "@/stores";
import { type THandlerComponentProps } from "@/@types/handler-types";

export type TUserAvailabilityViewExtraProps = {
  // Add any extra props if needed
}

interface IUserAvailabilityViewProps extends THandlerComponentProps<TSingleHandlerStore<IUserAvailability, TUserAvailabilityViewExtraProps>> {
}

export default function UserAvailabilityView({ storeKey, store }: IUserAvailabilityViewProps) {
    // React 19: Essential IDs and transitions
    const componentId = useId();
    const [, startTransition] = useTransition();

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { response: userAvailability, action, reset } = store(useShallow(state => ({
        response: state.response,
        action: state.action,
        reset: state.reset,
    })));

    if (!userAvailability) {
        return null;
    }

    const handleCloseView = () => {
        startTransition(() => reset());
    };

    // React 19: Memoized weekly schedule display for better performance
    const weeklyScheduleDisplay = useMemo(() => {
        const days = [
            { key: EDayOfWeek.MONDAY, label: EDayOfWeekLabel.MONDAY },
            { key: EDayOfWeek.TUESDAY, label: EDayOfWeekLabel.TUESDAY },
            { key: EDayOfWeek.WEDNESDAY, label: EDayOfWeekLabel.WEDNESDAY },
            { key: EDayOfWeek.THURSDAY, label: EDayOfWeekLabel.THURSDAY },
            { key: EDayOfWeek.FRIDAY, label: EDayOfWeekLabel.FRIDAY },
            { key: EDayOfWeek.SATURDAY, label: EDayOfWeekLabel.SATURDAY },
            { key: EDayOfWeek.SUNDAY, label: EDayOfWeekLabel.SUNDAY },
        ];

        return days.map(({ key, label }) => {
            const daySchedule = userAvailability.weeklySchedule[key as keyof typeof userAvailability.weeklySchedule] as any;
            const isEnabled = daySchedule.enabled;
            const status = isEnabled ? EAvailabilityStatus.ENABLED : EAvailabilityStatus.DISABLED;
            
            return (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{label}</span>
                        <Badge variant={isEnabled ? "default" : "secondary"}>
                            {status === EAvailabilityStatus.ENABLED ? "Enabled" : "Disabled"}
                        </Badge>
                    </div>
                    {isEnabled && daySchedule.timeSlots.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                            {daySchedule.timeSlots.map((slot, index) => (
                                <span key={index}>
                                    {slot.start} - {slot.end}
                                    {index < daySchedule.timeSlots.length - 1 && ", "}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            );
        });
    }, [userAvailability.weeklySchedule]);

    // React 19: Memoized unavailable periods display for better performance
    const unavailablePeriodsDisplay = useMemo(() => {
        if (userAvailability.unavailablePeriods.length === 0) {
            return (
                <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p>No unavailable periods set</p>
                </div>
            );
        }

        return userAvailability.unavailablePeriods.map((period, index) => (
            <div key={period.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{period.reason}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                    {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                </div>
            </div>
        ));
    }, [userAvailability.unavailablePeriods]);

    return (
        <Dialog open={action === 'view'} onOpenChange={handleCloseView} data-component-id={componentId}>
            <DialogContent className="min-w-4xl max-h-[90vh] overflow-y-auto">
                <AppDialog
                    title="User Availability Details"
                    description="View user availability information"
                >
                    <div className="space-y-6" data-component-id={componentId}>
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">User Availability #{userAvailability.id}</h1>
                                <p className="text-muted-foreground">User ID: {userAvailability.userId}</p>
                            </div>
                        </div>

                        {/* Weekly Schedule */}
                        <AppCard className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="h-5 w-5" />
                                <h2 className="text-lg font-semibold">Weekly Schedule</h2>
                            </div>
                            <div className="space-y-2">
                                {weeklyScheduleDisplay}
                            </div>
                        </AppCard>

                        {/* Unavailable Periods */}
                        <AppCard className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="h-5 w-5" />
                                <h2 className="text-lg font-semibold">Unavailable Periods</h2>
                            </div>
                            <div className="space-y-2">
                                {unavailablePeriodsDisplay}
                            </div>
                        </AppCard>

                        {/* Metadata */}
                        <AppCard className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="h-5 w-5" />
                                <h2 className="text-lg font-semibold">Metadata</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">Created At:</span>
                                    <p className="text-sm">{new Date(userAvailability.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">Updated At:</span>
                                    <p className="text-sm">{new Date(userAvailability.updatedAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </AppCard>
                    </div>
                </AppDialog>
            </DialogContent>
        </Dialog>
    );
}