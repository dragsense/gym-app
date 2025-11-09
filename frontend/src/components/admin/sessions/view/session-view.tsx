// External Libraries
import { useShallow } from 'zustand/shallow';
import { useId, useMemo, useTransition } from 'react';

// Components
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { Calendar, Clock, MapPin, DollarSign, User, Target, FileText, Mail } from "lucide-react";

// Types
import { type ISession } from "@shared/interfaces/session.interface";
import { ESessionStatus, ESessionType } from "@shared/enums/session.enum";

// Stores
import { type TSingleHandlerStore } from "@/stores";
import { type THandlerComponentProps } from "@/@types/handler-types";

// Hooks & Utils
import { useUserSettings } from "@/hooks/use-user-settings";
import { formatDate, formatTime, formatDateTime } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import { buildSentence } from "@/locales/translations";

export type TSessionViewExtraProps = {
    // Add any extra props if needed
}

interface ISessionViewProps extends THandlerComponentProps<TSingleHandlerStore<ISession, TSessionViewExtraProps>> {
}

export default function SessionView({ storeKey, store }: ISessionViewProps) {
    // React 19: Essential IDs and transitions
    const componentId = useId();
    const [, startTransition] = useTransition();
    const { t } = useI18n();

    if (!store) {
        return <div>{buildSentence(t, 'single', 'store')} "{storeKey}" {buildSentence(t, 'not', 'found')}. {buildSentence(t, 'did', 'you', 'forget', 'to', 'register', 'it')}?</div>;
    }

    const { response: session, action, reset } = store(useShallow(state => ({
        response: state.response,
        action: state.action,
        reset: state.reset,
    })));

    if (!session) {
        return null;
    }


    const handleCloseView = () => {
        startTransition(() => reset());
    };




    return (
        <Dialog open={action === 'view'} onOpenChange={handleCloseView} data-component-id={componentId}>
            <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
                <AppDialog
                    title={buildSentence(t, 'session', 'details')}
                    description={buildSentence(t, 'view', 'detailed', 'information', 'about', 'this', 'session')}
                >
                    <SessionDetailContent session={session} />
                </AppDialog>
            </DialogContent>
        </Dialog>
    );
}

interface ISessionDetailContentProps {
    session: ISession;
}

function SessionDetailContent({ session }: ISessionDetailContentProps) {
    // React 19: Essential IDs
    const componentId = useId();
    const { settings } = useUserSettings();
    const { t } = useI18n();

    const trainer = session.trainer?.user;
    const clients = session.clients?.map((c) => c.user);

    // React 19: Memoized session dates for better performance
    const sessionStartDate = useMemo(() =>
        session.startDateTime ? formatDate(session.startDateTime, settings) : '',
        [session.startDateTime, settings]
    );

    const sessionStartTime = useMemo(() =>
        session.startDateTime ? formatTime(session.startDateTime, settings) : '',
        [session.startDateTime, settings]
    );


    const sessionEndStartDate = useMemo(() =>
        session.endDateTime ? formatDate(session.endDateTime, settings) : '',
        [session.endDateTime, settings]
    );


    const sessionEndTime = useMemo(() =>
        session.endDateTime ? formatTime(session.endDateTime, settings) : '',
        [session.endDateTime, settings]
    );


    const statusColors = {
        [ESessionStatus.SCHEDULED]: 'bg-blue-100 text-blue-800 border-blue-200',
        [ESessionStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        [ESessionStatus.COMPLETED]: 'bg-green-100 text-green-800 border-green-200',
        [ESessionStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
        [ESessionStatus.NO_SHOW]: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
        <div className="space-y-6" data-component-id={componentId}>
            {/* Quick Preview Card */}
            <AppCard className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {session.title}
                        </h2>
                        <p className="text-blue-600 font-medium">{session.type} {t('session')}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge className={statusColors[session.status] || 'bg-gray-100 text-gray-800'}>
                                {session.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                {sessionStartDate}
                            </span>
                        </div>
                    </div>
                </div>
            </AppCard>

            <div className="space-y-6">
                {/* Session Information */}
                <AppCard
                    header={
                        <div className="flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            <div>
                                <span className="font-semibold">{buildSentence(t, 'session', 'information')}</span>
                                <p className="text-sm text-muted-foreground">{buildSentence(t, 'details', 'about', 'this', 'training', 'session')}</p>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Clock className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">{buildSentence(t, 'start', 'time')}:</span>
                                <p className="font-medium">{sessionStartDate} at {sessionStartTime}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Clock className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">{buildSentence(t, 'end', 'time')}:</span>
                                <p className="font-medium">{sessionEndStartDate} at {sessionEndTime}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Clock className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">{t('duration')}:</span>
                                <p className="font-medium">{session.duration} {t('minutes')}</p>
                            </div>
                        </div>
                        {session.location && (
                            <div className="flex items-center gap-3">
                                <div className="text-muted-foreground"><MapPin className="w-4 h-4" /></div>
                                <div className="flex-1">
                                    <span className="text-sm text-muted-foreground">{t('location')}:</span>
                                    <p className="font-medium">{session.location}</p>
                                </div>
                            </div>
                        )}
                        {session.price && (
                            <div className="flex items-center gap-3">
                                <div className="text-muted-foreground"><DollarSign className="w-4 h-4" /></div>
                                <div className="flex-1">
                                    <span className="text-sm text-muted-foreground">{t('price')}:</span>
                                    <p className="font-medium">${session.price}</p>
                                </div>
                            </div>
                        )}
                        {session.description && (
                            <div className="flex items-start gap-3">
                                <div className="text-muted-foreground mt-1"><FileText className="w-4 h-4" /></div>
                                <div className="flex-1">
                                    <span className="text-sm text-muted-foreground">{t('description')}:</span>
                                    <p className="font-medium mt-1">{session.description}</p>
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
                                <span className="font-semibold">{t('trainer')}</span>
                                <p className="text-sm text-muted-foreground">{buildSentence(t, 'session', 'trainer', 'details')}</p>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><User className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">{t('name')}:</span>
                                <p className="font-medium">
                                    {trainer?.firstName} {trainer?.lastName}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><User className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">{t('email')}:</span>
                                <p className="font-medium">{trainer?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Target className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">{t('specialization')}:</span>
                                <p className="font-medium">{trainer?.specialization || buildSentence(t, 'not', 'specified')}</p>
                            </div>
                        </div>
                    </div>
                </AppCard>

                {/* Clients Information */}
                <AppCard
                    header={
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            <div>
                                <span className="font-semibold">Clients ({clients.length})</span>
                                <p className="text-sm text-muted-foreground">Session participants</p>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        {clients.map((client, index) => (
                            <div key={client.id || index}>
                                <div className="space-y-2">
                                    <AppCard className="p-0">
                                        <div className="flex gap-3 items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="text-muted-foreground"><User className="w-4 h-4" /></div>
                                                <div className="flex-1">
                                                    <p className="font-medium">
                                                        {client.firstName} {client.lastName}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-muted-foreground"><Mail className="w-4 h-4" /></div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{client.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </AppCard>

                                </div>
                            </div>
                        ))}
                    </div>
                </AppCard>

                {/* Session Notes */}
                {session.notes && (
                    <AppCard
                        header={
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                <div>
                                    <span className="font-semibold">Session Notes</span>
                                    <p className="text-sm text-muted-foreground">Additional information about this session</p>
                                </div>
                            </div>
                        }
                    >
                        <p className="text-sm">{session.notes}</p>
                    </AppCard>
                )}
            </div>
        </div>
    );
}
