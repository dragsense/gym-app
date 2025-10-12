// External Libraries
import { Loader2 } from 'lucide-react';
import { useId, useMemo } from 'react';

export function AppLoader() {
  // React 19: Essential IDs
  const componentId = useId();
  
  // React 19: Memoized loader for better performance
  const memoizedLoader = useMemo(() => (
    <Loader2 className="animate-spin" />
  ), []);

  return (
    <div 
      className="min-h-screen min-w-screen relative overflow-hidden"
      data-component-id={componentId}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-background/50 z-10 flex items-center justify-center rounded-lg">
        {memoizedLoader}
      </div>
    </div>
  );
}
