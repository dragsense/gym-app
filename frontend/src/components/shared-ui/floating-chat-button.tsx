import { MessageSquare, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatWindow } from './chat-window';
import { useI18n } from '@/hooks/use-i18n';

export function FloatingChatButton() {
    const { direction } = useI18n();
    
    return (
        <div className={`fixed bottom-6 z-50 flex flex-col gap-3 ${direction === 'rtl' ? 'left-6' : 'right-6'}`}>
            <ChatWindow />
        </div>
    );
}

