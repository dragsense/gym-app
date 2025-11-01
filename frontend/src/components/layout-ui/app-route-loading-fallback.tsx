import { useId } from "react";
import { AppLoader } from "./app-loader";

interface AppRouteLoadingFallbackProps {
    title?: string;
    message?: string;
}

export function AppRouteLoadingFallback({
    title = "Application",
    message = "Initializing application components..."
}: AppRouteLoadingFallbackProps = {}) {
    const componentId = useId();

    return (
        <div className="h-screen w-screen" data-component-id={componentId}>
            <AppLoader>
                <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground">{message}</p>
                </div>
            </AppLoader>
        </div>
    );
}