// External Libraries
import { type ReactNode } from "react";
import { useShallow } from 'zustand/shallow';

// Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { User, Mail, Phone, MapPin, Star, Calendar, Target } from "lucide-react";

// Types
import { type IUser } from "@shared/interfaces/user.interface";

// Stores
import { type TSingleHandlerStore } from "@/stores";

interface IUserViewProps {
    storeKey: string;
    store: TSingleHandlerStore<IUser, any>;
}

export default function UserView({ storeKey, store }: IUserViewProps) {
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
        reset();
    };

    return (
        <Dialog open={action === 'view'} onOpenChange={handleCloseView}>
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
    const profile = user.profile;

    return (
        <div className="space-y-6">
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
                                User since {new Date(user.createdAt).toLocaleDateString()}
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
                                <p className="text-sm text-muted-foreground">Basic trainer details and contact information</p>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
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

            {/* Additional Information */}
            <AppCard
                header={
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <div>
                            <span className="font-semibold">Additional Information</span>
                            <p className="text-sm text-muted-foreground">Account details and timestamps</p>
                        </div>
                    </div>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="text-muted-foreground"><Calendar className="w-4 h-4" /></div>
                        <div className="flex-1">
                            <span className="text-sm text-muted-foreground">Member Since:</span>
                            <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-muted-foreground"><Calendar className="w-4 h-4" /></div>
                        <div className="flex-1">
                            <span className="text-sm text-muted-foreground">Last Updated:</span>
                            <p className="font-medium">{new Date(user.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </AppCard>

         
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button size="sm">
                    Edit User
                </Button>
            </div>
        </div>
    );
}