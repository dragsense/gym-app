// External Libraries
import { Loader2 } from 'lucide-react';


export function AppLoader() {
  return (
    <div className="min-h-screen min-w-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-background/50 z-10 flex items-center justify-center rounded-lg">
        <Loader2 />
      </div>
    </div>
  );
}
