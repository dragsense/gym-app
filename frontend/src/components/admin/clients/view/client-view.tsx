// External Libraries
import { useShallow } from 'zustand/shallow';
import { useId, useMemo, useTransition } from 'react';

// Components
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { User, MapPin, Phone, Target, Activity, Heart } from "lucide-react";

// Types
import { type IClient } from "@shared/interfaces/client.interface";

// Stores
import { type TSingleHandlerStore } from "@/stores";
import { type THandlerComponentProps } from "@/@types/handler-types";

// Hooks & Utils
import { useUserSettings } from "@/hooks/use-user-settings";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import { buildSentence } from "@/locales/translations";

export type TClientViewExtraProps = {
    level: number;
}

interface IClientViewProps extends THandlerComponentProps<TSingleHandlerStore<IClient, TClientViewExtraProps>> {
}

export default function ClientView({ storeKey, store }: IClientViewProps) {
    // React 19: Essential IDs and transitions
    const componentId = useId();
    const [, startTransition] = useTransition();
    const { t } = useI18n();

    if (!store) {
        return <div>{buildSentence(t, 'single', 'store')} "{storeKey}" {buildSentence(t, 'not', 'found')}. {buildSentence(t, 'did', 'you', 'forget', 'to', 'register', 'it')}?</div>;
    }

    const { response: client, action, reset } = store(useShallow(state => ({
        response: state.response,
        action: state.action,
        reset: state.reset,
    })));

    if (!client) {
        return null;
    }

    const handleCloseView = () => {
        startTransition(() => reset());
    };

    return (
        <Dialog open={action === 'view'} onOpenChange={handleCloseView} data-component-id={componentId}>
            <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
                <AppDialog
                    title={buildSentence(t, 'client', 'details')}
                    description={buildSentence(t, 'view', 'detailed', 'information', 'about', 'this', 'client')}
                >
                    <ClientDetailContent client={client} />
                </AppDialog>
            </DialogContent>
        </Dialog>
    );
}

interface IClientDetailContentProps {
    client: IClient;
}

function ClientDetailContent({ client }: IClientDetailContentProps) {
    // React 19: Essential IDs
    const componentId = useId();
    const { t } = useI18n();

    const profile = client.user?.profile;

    // React 19: Memoized client creation date for better performance
    const { settings } = useUserSettings();
    const clientCreationDate = useMemo(() =>
        client.createdAt ? formatDate(client.createdAt, settings) : '',
        [client.createdAt, settings]
    );

    return (
        <div className="space-y-6" data-component-id={componentId}>
            {/* Quick Preview Card */}
            <AppCard className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {profile?.firstName} {profile?.lastName}
                        </h2>
                        <p className="text-blue-600 font-medium">{client.user?.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={client.isActive ? "default" : "secondary"}>
                                {client.isActive ? t('active') : t('inactive')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                {buildSentence(t, 'client', 'since')} {clientCreationDate}
                            </span>
                        </div>
                    </div>
                </div>
            </AppCard>

            <div className="space-y-6">
                {/* Client Information */}
                <AppCard
                    header={
                        <div className="flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            <div>
                                <span className="font-semibold">{buildSentence(t, 'client', 'information')}</span>
                                <p className="text-sm text-muted-foreground">{buildSentence(t, 'fitness', 'goals', 'and', 'health', 'details')}</p>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Target className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">{t('goal')}:</span>
                                <p className="font-medium">{client.goal || buildSentence(t, 'not', 'specified')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Activity className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">{buildSentence(t, 'fitness', 'level')}:</span>
                                <p className="font-medium">{client.fitnessLevel || buildSentence(t, 'not', 'specified')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Heart className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">{buildSentence(t, 'medical', 'conditions')}:</span>
                                <p className="font-medium">{client.medicalConditions || buildSentence(t, 'none', 'specified')}</p>
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
                                <p className="text-sm text-muted-foreground">{buildSentence(t, 'basic', 'client', 'details', 'and', 'contact', 'information')}</p>
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
