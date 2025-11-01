import { Suspense } from "react";
import { AppRouteLoadingFallback } from "@/components/layout-ui/app-route-loading-fallback";


/**
 * Creates a route element with loading fallback
 * @param Component - The lazy-loaded component to render
 * @param userLevel - The user level or context (default: "App")
 * @param message - Custom loading message (optional)
 * @returns React element with Suspense and loading fallback
 */
export function createRouteElement(
    Component: React.LazyExoticComponent<React.ComponentType<Record<string, never>>>,
    userLevel: string,
    message?: string
) {
    const defaultMessage = message || `Loading ${userLevel.toLowerCase()} page...`;

    return (
        <Suspense fallback={<AppRouteLoadingFallback title={userLevel} message={defaultMessage} />}>
            <Component />
        </Suspense>
    );
}
