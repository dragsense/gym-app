// External Libraries
import { Loader2, User, UserCircle, Lock } from "lucide-react";
import { useId, useState } from "react";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Components
import { AccountTab, ProfileTab, PasswordResetTab } from "./tabs";

// Services
import { fetchMyProfile } from "@/services/user.api";
import { me } from "@/services/auth.api";

// Hooks
import { useApiQuery } from "@/hooks/use-api-query";
import type { IProfile } from "@shared/interfaces/user.interface";
import type { IAuthUser } from "@shared/interfaces/auth.interface";

export default function AccountPage() {
    // React 19: Essential IDs
    const componentId = useId();
    const [activeTab, setActiveTab] = useState("account");

    // Fetch profile data for loading state
    const { isLoading: isLoadingProfile } = useApiQuery<IProfile>(
        ["account-profile"],
        fetchMyProfile,
        {}
    );

    // Fetch user data for loading state
    const { isLoading: isLoadingUser } = useApiQuery<IAuthUser>(
        ["me"],
        me as () => Promise<IAuthUser>,
        {}
    );

    if (isLoadingProfile || isLoadingUser) {
        return (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const accountTabs = [
        {
            id: "account",
            label: "Account",
            icon: User,
            description: "User information"
        },
        {
            id: "profile",
            label: "Profile",
            icon: UserCircle,
            description: "Profile information"
        },
        {
            id: "password-reset",
            label: "Password Reset",
            icon: Lock,
            description: "Change your password"
        }
    ];

    return (
        <div data-component-id={componentId} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex justify-start gap-5 mb-6">
                    {accountTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                <TabsContent value="account" className="mt-0">
                    <AccountTab />
                </TabsContent>

                <TabsContent value="profile" className="mt-0">
                    <ProfileTab />
                </TabsContent>

                <TabsContent value="password-reset" className="mt-0">
                    <PasswordResetTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}

