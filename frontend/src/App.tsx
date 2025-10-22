
// React & Hooks
import { RouterProvider } from "react-router-dom";

// External Libraries
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Local
import appRouter from "./AppRoutes";
import { AuthUserProvider } from "./hooks/use-auth-user";
import { ThemeProvider } from "./hooks/use-theme";

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
      <ThemeProvider defaultTheme="system" storageKey="app-theme">
        <AuthUserProvider>
          <RouterProvider router={appRouter} />
        </AuthUserProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
