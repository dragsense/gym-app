// External Libraries
import { useShallow } from 'zustand/shallow';
import { useId, useMemo, useTransition } from 'react';

// Components
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { User, MapPin, Phone, Award, DollarSign, Clock, Target } from "lucide-react";

// Types
import { type ITrainer } from "@shared/interfaces/trainer.interface";

// Stores
import { type TSingleHandlerStore } from "@/stores";
import { type THandlerComponentProps } from "@/@types/handler-types";

export type TTrainerViewExtraProps = {
   level: number;
}

interface ITrainerViewProps extends THandlerComponentProps<TSingleHandlerStore<ITrainer, TTrainerViewExtraProps>> {
}

export default function TrainerView({ storeKey, store }: ITrainerViewProps) {
    // React 19: Essential IDs and transitions
    const componentId = useId();
    const [, startTransition] = useTransition();

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { response: trainer, action, reset } = store(useShallow(state => ({
        response: state.response,
        action: state.action,
        reset: state.reset,
    })));

    if (!trainer) {
        return null;
    }

    const handleCloseView = () => {
        startTransition(() => reset());
    };

    return (
        <Dialog open={action === 'view'} onOpenChange={handleCloseView} data-component-id={componentId}>
            <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
                <AppDialog
                    title="Trainer Details"
                    description="View detailed information about this trainer"
                >
                    <TrainerDetailContent trainer={trainer} />
                </AppDialog>
            </DialogContent>
        </Dialog>
    );
}

interface ITrainerDetailContentProps {
    trainer: ITrainer;
}

function TrainerDetailContent({ trainer }: ITrainerDetailContentProps) {
    // React 19: Essential IDs
    const componentId = useId();
    
    const profile = trainer.user?.profile;

    // React 19: Memoized trainer creation date for better performance
    const trainerCreationDate = useMemo(() => 
        trainer.createdAt ? new Date(trainer.createdAt).toLocaleDateString() : '', 
        [trainer.createdAt]
    );

    return (
        <div className="space-y-6" data-component-id={componentId}>
            {/* Quick Preview Card */}
            <AppCard className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {profile?.firstName} {profile?.lastName}
                        </h2>
                        <p className="text-green-600 font-medium">{trainer.user?.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={trainer.isActive ? "default" : "secondary"}>
                                {trainer.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                Trainer since {trainerCreationDate}
                            </span>
                        </div>
                    </div>
                </div>
            </AppCard>

            <div className="space-y-6">
                {/* Trainer Information */}
                <AppCard
                    header={
                        <div className="flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            <div>
                                <span className="font-semibold">Trainer Information</span>
                                <p className="text-sm text-muted-foreground">Professional details and expertise</p>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Target className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Specialization:</span>
                                <p className="font-medium">{trainer.specialization || 'Not specified'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Clock className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Experience:</span>
                                <p className="font-medium">{trainer.experience ? `${trainer.experience} years` : 'Not specified'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Award className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Certification:</span>
                                <p className="font-medium">{trainer.certification || 'Not specified'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><DollarSign className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Hourly Rate:</span>
                                <p className="font-medium">{trainer.hourlyRate ? `$${trainer.hourlyRate}/hour` : 'Not specified'}</p>
                            </div>
                        </div>
                    </div>
                </AppCard>

                {/* Personal Information */}
                <AppCard
                    header={
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            <div>
                                <span className="font-semibold">Personal Information</span>
                                <p className="text-sm text-muted-foreground">Basic trainer details and contact information</p>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                    <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Phone className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Phone:</span>
                                <p className="font-medium">{profile?.phoneNumber || 'Not specified'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><MapPin className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Address:</span>
                                <p className="font-medium">{profile?.address || 'Not specified'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><User className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Gender:</span>
                                <p className="font-medium">{profile?.gender || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>
                </AppCard>
            </div>
         
    
        </div>
    );
}
