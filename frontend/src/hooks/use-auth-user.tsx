// React & Hooks
import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";

// Types
import { type IAuthUser } from '@shared/interfaces/auth.interface';

// Services
import { me } from "@/services/user.api";

interface IAuthUserContextType {
  user?: IAuthUser;
  isLoading: boolean;
  error: Error | null;
}

const AuthUserContext = createContext<IAuthUserContextType | undefined>(undefined);

export function AuthUserProvider({ children }: { children: React.ReactNode }) {

  const {
    data,
    isLoading,
    error,
  } = useQuery<IAuthUser>({
    queryKey: ["me"],
    queryFn: me,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });


  const value = {
    user: data,
    isLoading,
    error,
  };

  return <AuthUserContext.Provider value={value}>{children}</AuthUserContext.Provider>;
}

export function useAuthUser() {
  const context = useContext(AuthUserContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a UserProvider");
  }
  return context;
}
