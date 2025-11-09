// External Libraries
import { useShallow } from 'zustand/shallow';
import { useId, useMemo, useTransition } from 'react';

// Components
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { User, MapPin, Phone, Building2, Mail, Globe } from "lucide-react";

// Types
import { type IUser } from "@shared/interfaces/user.interface";
import { EUserLevels } from "@shared/enums/user.enum";

// Stores
import { type TSingleHandlerStore } from "@/stores";
import { type THandlerComponentProps } from "@/@types/handler-types";

// Hooks & Utils
import { useUserSettings, useUserSettingsById } from "@/hooks/use-user-settings";
import { useAuthUser } from "@/hooks/use-auth-user";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import { buildSentence } from "@/locales/translations";


export type TUserViewExtraProps = {
    level: number;
}

interface IUserViewProps extends THandlerComponentProps<TSingleHandlerStore<IUser, TUserViewExtraProps>> {
    // Component props for UserView
}

export default function UserView({ storeKey, store }: IUserViewProps) {
    // React 19: Essential IDs and transitions
    const componentId = useId();
    const [, startTransition] = useTransition();

    const storeState = store(useShallow(state => ({
        response: state.response,
        action: state.action,
        reset: state.reset,
    })));

    const { response: user, action, reset } = storeState || { response: null, action: '', reset: () => { } };

    const { t } = useI18n();
    
    if (!store) {
        return <div>{buildSentence(t, 'single', 'store')} "{storeKey}" {buildSentence(t, 'not', 'found')}. {buildSentence(t, 'did', 'you', 'forget', 'to', 'register', 'it')}?</div>;
    }

    if (!user) {
        return null;
    }

    const handleCloseView = () => {
        startTransition(() => reset());
    };

    return (
        <Dialog open={action === 'view'} onOpenChange={handleCloseView} data-component-id={componentId}>
            <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
                <AppDialog
                    title={buildSentence(t, 'user', 'details')}
                    description={buildSentence(t, 'view', 'detailed', 'information', 'about', 'this', 'user')}
                >
                    <UserDetailContent user={user} />
                </AppDialog>
            </DialogContent>
        </Dialog>
    );
}

interface IUserDetailContentProps {
    user: IUser;
}

function UserDetailContent({ user }: IUserDetailContentProps) {
    // React 19: Essential IDs
    const componentId = useId();
    const { settings } = useUserSettings();
    const { user: currentUser } = useAuthUser();
    const { t } = useI18n();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = (user as any).profile;
    const isSuperAdmin = currentUser?.level === EUserLevels.SUPER_ADMIN;

    // Fetch user settings if current user is SUPER_ADMIN
    const { settings: userSettings } = useUserSettingsById(user.id, isSuperAdmin);

    // React 19: Memoized user creation date for better performance
    const userCreationDate = useMemo(() =>
        formatDate(user.createdAt, settings),
        [user.createdAt, settings]
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
                        <p className="text-green-600 font-medium">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                                {user.isActive ? t('active') : t('inactive')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                {buildSentence(t, 'user', 'since')} {userCreationDate}
                            </span>
                        </div>
                    </div>
                </div>
            </AppCard>

            <div className="">
                {/* Personal Information */}
                <AppCard
                    header={
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            <div>
                                <span className="font-semibold">{buildSentence(t, 'personal', 'information')}</span>
                                <p className="text-sm text-muted-foreground">{buildSentence(t, 'basic', 'user', 'details', 'and', 'contact', 'information')}</p>
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

            {/* Business Settings - Only visible to SUPER_ADMIN */}
            {isSuperAdmin && userSettings?.business && (
                <AppCard
                    header={
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            <div>
                                <span className="font-semibold">{buildSentence(t, 'business', 'settings')}</span>
                                <p className="text-sm text-muted-foreground">{buildSentence(t, 'business', 'information', 'and', 'details')}</p>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        {userSettings.business.businessName && (
                            <div className="flex items-center gap-3">
                                <div className="text-muted-foreground"><Building2 className="w-4 h-4" /></div>
                                <div className="flex-1">
                                    <span className="text-sm text-muted-foreground">{buildSentence(t, 'business', 'name')}:</span>
                                    <p className="font-medium">{userSettings.business.businessName}</p>
                                </div>
                            </div>
                        )}
                        {userSettings.business.businessEmail && (
                            <div className="flex items-center gap-3">
                                <div className="text-muted-foreground"><Mail className="w-4 h-4" /></div>
                                <div className="flex-1">
                                    <span className="text-sm text-muted-foreground">{buildSentence(t, 'business', 'email')}:</span>
                                    <p className="font-medium">{userSettings.business.businessEmail}</p>
                                </div>
                            </div>
                        )}
                        {userSettings.business.businessPhone && (
                            <div className="flex items-center gap-3">
                                <div className="text-muted-foreground"><Phone className="w-4 h-4" /></div>
                                <div className="flex-1">
                                    <span className="text-sm text-muted-foreground">{buildSentence(t, 'business', 'phone')}:</span>
                                    <p className="font-medium">{userSettings.business.businessPhone}</p>
                                </div>
                            </div>
                        )}
                        {userSettings.business.businessAddress && (
                            <div className="flex items-center gap-3">
                                <div className="text-muted-foreground"><MapPin className="w-4 h-4" /></div>
                                <div className="flex-1">
                                    <span className="text-sm text-muted-foreground">{buildSentence(t, 'business', 'address')}:</span>
                                    <p className="font-medium">{userSettings.business.businessAddress}</p>
                                </div>
                            </div>
                        )}
                        {userSettings.business.businessLogo && (
                            <div className="flex items-center gap-3">
                                <div className="text-muted-foreground"><Globe className="w-4 h-4" /></div>
                                <div className="flex-1">
                                    <span className="text-sm text-muted-foreground">{buildSentence(t, 'business', 'logo')}:</span>
                                    <p className="font-medium">
                                        <a
                                            href={userSettings.business.businessLogo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {userSettings.business.businessLogo}
                                        </a>
                                    </p>
                                </div>
                            </div>
                        )}
                        {!userSettings.business.businessName &&
                            !userSettings.business.businessEmail &&
                            !userSettings.business.businessPhone &&
                            !userSettings.business.businessAddress &&
                            !userSettings.business.businessLogo && (
                                <p className="text-sm text-muted-foreground">{buildSentence(t, 'no', 'business', 'settings', 'configured')}</p>
                            )}
                    </div>
                </AppCard>
            )}

        </div>
    );
}