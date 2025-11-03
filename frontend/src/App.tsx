
// React & Hooks
import { RouterProvider } from "react-router-dom";

// External Libraries
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Local
import appRouter from "./AppRoutes";
import { AuthUserProvider } from "./hooks/use-auth-user";
import { ThemeProvider } from "./hooks/use-theme";
import { I18nProvider } from "./hooks/use-i18n";
import { FloatingChatButton } from "./components/shared-ui/floating-chat-button";
import "./config/i18n.config";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,// 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ThemeProvider defaultTheme="system" storageKey="app-theme">
          <AuthUserProvider>
            <RouterProvider router={appRouter} />
            <FloatingChatButton />
          </AuthUserProvider>
        </ThemeProvider>
      </I18nProvider>
      <ReactQueryDevtools initialIsOpen={false} position="top" />
    </QueryClientProvider>
  );
}

export default App;
