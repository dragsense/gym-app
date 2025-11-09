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

// Hooks & Utils
import { useUserSettings } from "@/hooks/use-user-settings";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import { buildSentence } from "@/locales/translations";

export type TTrainerViewExtraProps = {
   level: number;
}

interface ITrainerViewProps extends THandlerComponentProps<TSingleHandlerStore<ITrainer, TTrainerViewExtraProps>> {
}

export default function TrainerView({ storeKey, store }: ITrainerViewProps) {
    // React 19: Essential IDs and transitions
    const componentId = useId();
    const [, startTransition] = useTransition();
    const { t } = useI18n();

    if (!store) {
        return <div>{buildSentence(t, 'single', 'store')} "{storeKey}" {buildSentence(t, 'not', 'found')}. {buildSentence(t, 'did', 'you', 'forget', 'to', 'register', 'it')}?</div>;
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
                    title={buildSentence(t, 'trainer', 'details')}
                    description={buildSentence(t, 'view', 'detailed', 'information', 'about', 'this', 'trainer')}
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
    const { t } = useI18n();
    
    const profile = trainer.user?.profile;

    // React 19: Memoized trainer creation date for better performance
    const { settings } = useUserSettings();
    const trainerCreationDate = useMemo(() => 
        trainer.createdAt ? formatDate(trainer.createdAt, settings) : '', 
        [trainer.createdAt, settings]
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
                                {trainer.isActive ? t('active') : t('inactive')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                {buildSentence(t, 'trainer', 'since')} {trainerCreationDate}
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
                                <span className="font-semibold">{buildSentence(t, 'trainer', 'information')}</span>
                                <p className="text-sm text-muted-foreground">{buildSentence(t, 'professional', 'details', 'and', 'expertise')}</p>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Target className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">{t('specialization')}:</span>
                                <p className="font-medium">{trainer.specialization || buildSentence(t, 'not', 'specified')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Clock className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">{t('experience')}:</span>
                                <p className="font-medium">{trainer.experience ? `${trainer.experience} ${t('years')}` : buildSentence(t, 'not', 'specified')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Award className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">{t('certification')}:</span>
                                <p className="font-medium">{trainer.certification || buildSentence(t, 'not', 'specified')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><DollarSign className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">{buildSentence(t, 'hourly', 'rate')}:</span>
                                <p className="font-medium">{trainer.hourlyRate ? `$${trainer.hourlyRate}/${t('hour')}` : buildSentence(t, 'not', 'specified')}</p>
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
                                <span className="font-semibold">{buildSentence(t, 'personal', 'information')}</span>
                                <p className="text-sm text-muted-foreground">{buildSentence(t, 'basic', 'trainer', 'details', 'and', 'contact', 'information')}</p>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                    <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Phone className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">{t('phone')}:</span>
                                <p className="font-medium">{profile?.phoneNumber || buildSentence(t, 'not', 'specified')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><MapPin className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">{t('address')}:</span>
                                <p className="font-medium">{profile?.address || buildSentence(t, 'not', 'specified')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><User className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">{t('gender')}:</span>
                                <p className="font-medium">{profile?.gender || buildSentence(t, 'not', 'specified')}</p>
                            </div>
                        </div>
                    </div>
                </AppCard>
            </div>
         
    
        </div>
    );
}
