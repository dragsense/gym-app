// External Libraries
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// Services
import { logout } from "@/services/auth.api";


export const useLogout = () => {
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();
    const handleLogout = async () => {
        setIsLoading(true);
        try {

            await logout();
            queryClient.invalidateQueries({ queryKey: ["me"] });
            window.location.reload();

        } catch (error) {
            if (error instanceof Error) {
                toast.error("Logout failed: " + error.message);
            }
            console.error("Logout error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return { logout: handleLogout, isLoading };
};