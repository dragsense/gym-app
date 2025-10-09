// React & Hooks
import { RouterProvider } from "react-router-dom";

// External Libraries
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Local
import appRouter from "./AppRoutes";
import { AuthUserProvider } from "./hooks/use-auth-user";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, //5 * 60 * 1000,

      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthUserProvider>
        <RouterProvider router={appRouter} />
      </AuthUserProvider>
    </QueryClientProvider>
  );
}

export default App;
