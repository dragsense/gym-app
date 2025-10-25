// React & Hooks
import React, { createContext, useContext, useDeferredValue, useMemo, useTransition, useId } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types
import { type IUserSettings } from '@shared/interfaces/user-settings.interface';
import { type TUserSettingsData, type TUpdateUserSettingsData } from '@shared/types/settings.type';

// Services
import {
    getUserSettings,
    createOrUpdateUserSettings,
    updateCurrentUserSettings,
    deleteCurrentUserSettings
} from "@/services/settings.api";

interface IUserSettingsContextType {
    settings?: IUserSettings;
    isLoading: boolean;
    error: Error | null;
    componentId: string;
    startTransition: (callback: () => void) => void;
    createOrUpdateSettings: (data: TUserSettingsData) => Promise<void>;
    updateSettings: (data: TUpdateUserSettingsData) => Promise<void>;
    deleteSettings: () => Promise<void>;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
}

const UserSettingsContext = createContext<IUserSettingsContextType | undefined>(undefined);

export function UserSettingsProvider({ children }: { children: React.ReactNode }) {
    // React 19: Essential IDs and transitions
    const componentId = useId();
    const [, startTransition] = useTransition();
    const queryClient = useQueryClient();

    const {
        data,
        isLoading,
        error,
    } = useQuery<IUserSettings>({
        queryKey: ["user-settings"],
        queryFn: getUserSettings,
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // React 19: Deferred settings data for better performance
    const deferredSettings = useDeferredValue(data);

    // Create or update settings mutation
    const createOrUpdateMutation = useMutation({
        mutationFn: createOrUpdateUserSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-settings"] });
            toast.success("Settings saved successfully");
        },
        onError: (error: Error) => {
            toast.error(`Failed to save settings: ${error.message}`);
        },
    });

    // Update settings mutation
    const updateMutation = useMutation({
        mutationFn: updateCurrentUserSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-settings"] });
            toast.success("Settings updated successfully");
        },
        onError: (error: Error) => {
            toast.error(`Failed to update settings: ${error.message}`);
        },
    });

    // Delete settings mutation
    const deleteMutation = useMutation({
        mutationFn: deleteCurrentUserSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-settings"] });
            toast.success("Settings deleted successfully");
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete settings: ${error.message}`);
        },
    });

    // React 19: Memoized context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        settings: deferredSettings,
        isLoading,
        error,
        componentId,
        startTransition,
        createOrUpdateSettings: async (data: TUserSettingsData) => {
            await createOrUpdateMutation.mutateAsync(data);
        },
        updateSettings: async (data: TUpdateUserSettingsData) => {
            await updateMutation.mutateAsync(data);
        },
        deleteSettings: async () => {
            await deleteMutation.mutateAsync();
        },
        isCreating: createOrUpdateMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    }), [
        deferredSettings,
        isLoading,
        error,
        componentId,
        startTransition,
        createOrUpdateMutation,
        updateMutation,
        deleteMutation
    ]);

    return <UserSettingsContext.Provider value={value}>{children}</UserSettingsContext.Provider>;
}

export function useUserSettings() {
    const context = useContext(UserSettingsContext);
    if (context === undefined) {
        throw new Error("useUserSettings must be used within a UserSettingsProvider");
    }
    return context;
}
