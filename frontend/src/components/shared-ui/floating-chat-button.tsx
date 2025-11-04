import { MessageSquare, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatWindow } from './chat-window';

export function FloatingChatButton() {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
            <ChatWindow />
        </div>
    );
}

