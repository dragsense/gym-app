// External Libraries
import { useShallow } from 'zustand/shallow';
import { useId, useMemo, useTransition } from 'react';

// Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { User, MapPin, Calendar, Phone } from "lucide-react";

// Types
import { type IUser } from "@shared/interfaces/user.interface";

// Stores
import { type TSingleHandlerStore } from "@/stores";
import { type THandlerComponentProps } from "@/@types/handler-types";


export type TUserViewExtraProps = {
   level: number;
}

interface IUserViewProps extends THandlerComponentProps<TSingleHandlerStore<IUser, TUserViewExtraProps>> {
}

export default function UserView({ storeKey, store }: IUserViewProps) {
    // React 19: Essential IDs and transitions
    const componentId = useId();
    const [, startTransition] = useTransition();

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { response: user, action, reset } = store(useShallow(state => ({
        response: state.response,
        action: state.action,
        reset: state.reset,
    })));

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
                    title="User Details"
                    description="View detailed information about this user"
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
    
    const profile = user.profile;

    // React 19: Memoized user creation date for better performance
    const userCreationDate = useMemo(() => 
        new Date(user.createdAt).toLocaleDateString(), 
        [user.createdAt]
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
                                {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                User since {userCreationDate}
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
                                <span className="font-semibold">Personal Information</span>
                                <p className="text-sm text-muted-foreground">Basic user details and contact information</p>
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