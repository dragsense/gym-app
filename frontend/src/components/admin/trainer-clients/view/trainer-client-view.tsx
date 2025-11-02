// External Libraries
import { useShallow } from 'zustand/shallow';
import { useId, useMemo, useTransition } from 'react';

// Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { Users, Calendar, User } from "lucide-react";

// Types
import { type ITrainerClient } from "@shared/interfaces/trainer-client.interface";

// Stores
import { type TSingleHandlerStore } from "@/stores";
import { type THandlerComponentProps } from "@/@types/handler-types";
import { ETrainerClientStatus } from '@shared/enums/trainer-client.enum';

export type TTrainerClientViewExtraProps = {
    level: number;
}

interface ITrainerClientViewProps extends THandlerComponentProps<TSingleHandlerStore<ITrainerClient, TTrainerClientViewExtraProps>> {
}

export default function TrainerClientView({ storeKey, store }: ITrainerClientViewProps) {
    // React 19: Essential IDs and transitions
    const componentId = useId();
    const [, startTransition] = useTransition();

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { response: trainerClient, action, reset } = store(useShallow(state => ({
        response: state.response,
        action: state.action,
        reset: state.reset,
    })));

    if (!trainerClient) {
        return null;
    }

    const handleCloseView = () => {
        startTransition(() => reset());
    };

    return (
        <Dialog open={action === 'view'} onOpenChange={handleCloseView} data-component-id={componentId}>
            <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
                <AppDialog
                    title="Trainer-Client Relationship Details"
                    description="View detailed information about this trainer-client relationship"
                >
                    <TrainerClientDetailContent trainerClient={trainerClient} />
                </AppDialog>
            </DialogContent>
        </Dialog>
    );
}

interface ITrainerClientDetailContentProps {
    trainerClient: ITrainerClient;
}

function TrainerClientDetailContent({ trainerClient }: ITrainerClientDetailContentProps) {
    // React 19: Essential IDs
    const componentId = useId();

    const trainer = trainerClient.trainer;
    const client = trainerClient.client;


    return (
        <div className="space-y-6" data-component-id={componentId}>
            {/* Quick Preview Card */}
            <AppCard className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {trainer?.user?.firstName} {trainer?.user?.lastName} - {client?.user?.firstName} {client?.user?.lastName}
                        </h2>
                        <p className="text-purple-600 font-medium">Trainer-Client Relationship</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={trainerClient.status === ETrainerClientStatus.ACTIVE ? "default" : "secondary"}>
                                {trainerClient.status}
                            </Badge>

                        </div>
                    </div>
                </div>
            </AppCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Trainer Information */}
                <AppCard
                    header={
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            <div>
                                <span className="font-semibold">Trainer Information</span>
                                <p className="text-sm text-muted-foreground">Details about the trainer</p>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><User className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Name:</span>
                                <p className="font-medium">{trainer?.user?.firstName} {trainer?.user?.lastName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><User className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Email:</span>
                                <p className="font-medium">{trainer?.user?.email || 'Not specified'}</p>
                            </div>
                        </div>

                    </div>
                </AppCard>

                {/* Client Information */}
                <AppCard
                    header={
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            <div>
                                <span className="font-semibold">Client Information</span>
                                <p className="text-sm text-muted-foreground">Details about the client</p>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><User className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Name:</span>
                                <p className="font-medium">{client?.user?.firstName} {client?.user?.lastName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><User className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Email:</span>
                                <p className="font-medium">{client?.user?.email || 'Not specified'}</p>
                            </div>
                        </div>

                    </div>
                </AppCard>
            </div>

            {/* Relationship Details */}
            <AppCard
                header={
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <div>
                            <span className="font-semibold">Relationship Details</span>
                            <p className="text-sm text-muted-foreground">Information about the trainer-client relationship</p>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="text-muted-foreground"><Calendar className="w-4 h-4" /></div>
                        <div className="flex-1">
                            <span className="text-sm text-muted-foreground">Notes:</span>
                            <p className="font-medium">{trainerClient.notes || 'Not specified'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-muted-foreground"><Users className="w-4 h-4" /></div>
                        <div className="flex-1">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <p className="font-medium">{trainerClient.status === ETrainerClientStatus.ACTIVE ? "Active" : "Inactive"}</p>
                        </div>
                    </div>
                </div>
            </AppCard>
        </div>
    );
}
