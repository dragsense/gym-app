import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format } from 'date-fns';
import { useChat } from '@/hooks/use-chat';
import { useAuthUser } from '@/hooks/use-auth-user';
import { cn } from '@/lib/utils';
import { chatService } from '@/services/socket-services/chat.service';

export function ChatWindow() {
    const [open, setOpen] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [showConversations, setShowConversations] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuthUser();
    const {
        conversations,
        currentConversation,
        messages,
        isTyping,
        setCurrentConversation,
        sendMessage,
        isConnected,
    } = useChat();

    // Auto-open chat window when a conversation is set
    useEffect(() => {
        if (currentConversation && !open) {
            setOpen(true);
            setShowConversations(false);
        }
    }, [currentConversation, open]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Focus input when conversation is selected
    useEffect(() => {
        if (currentConversation && inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentConversation]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !currentConversation) return;

        const recipientId = currentConversation.participantId;
        await sendMessage(messageInput, recipientId);
        setMessageInput('');

        // Stop typing indicator
        if (currentConversation.id && chatService.isConnected) {
            chatService.sendTyping(currentConversation.id, false);
        }
    };

    const handleInputChange = (value: string) => {
        setMessageInput(value);

        // Send typing indicator
        if (currentConversation && chatService.isConnected && value.trim()) {
            chatService.sendTyping(currentConversation.id, true);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Chat"
                >
                    <MessageSquare className="h-5 w-5" />
                    {totalUnread > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {totalUnread > 99 ? '99+' : totalUnread}
                        </Badge>
                    )}
                    {!isConnected && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 bg-yellow-500 rounded-full" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 h-[600px] p-0 flex flex-col" align="end">
                {showConversations && !currentConversation ? (
                    // Conversations List
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Conversations
                            </h3>
                        </div>
                        <ScrollArea className="flex-1">
                            {conversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                    <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                                    <p className="text-sm">No conversations yet</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {conversations.map((conversation) => (
                                        <div
                                            key={conversation.id}
                                            className={cn(
                                                'p-4 hover:bg-muted/50 transition-colors cursor-pointer',
                                                conversation.unreadCount > 0 && 'bg-muted/30'
                                            )}
                                            onClick={() => {
                                                setCurrentConversation(conversation.id);
                                                setShowConversations(false);
                                            }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage
                                                        src={conversation.participantAvatar}
                                                        alt={conversation.participantName}
                                                    />
                                                    <AvatarFallback>
                                                        {conversation.participantName
                                                            .substring(0, 2)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="font-medium text-sm truncate">
                                                            {conversation.participantName}
                                                        </p>
                                                        {conversation.unreadCount > 0 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {conversation.unreadCount}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {conversation.lastMessage && (
                                                        <>
                                                            <p className="text-sm text-muted-foreground truncate">
                                                                {conversation.lastMessage.message}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {formatDistanceToNow(
                                                                    new Date(conversation.lastMessage.timestamp),
                                                                    { addSuffix: true }
                                                                )}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                ) : currentConversation ? (
                    // Chat Messages
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                        setCurrentConversation(null);
                                        setShowConversations(true);
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src={currentConversation.participantAvatar}
                                        alt={currentConversation.participantName}
                                    />
                                    <AvatarFallback>
                                        {currentConversation.participantName
                                            .substring(0, 2)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-sm">
                                        {currentConversation.participantName}
                                    </p>
                                    {isTyping[currentConversation.participantId] && (
                                        <p className="text-xs text-muted-foreground">typing...</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                        <p className="text-sm">No messages yet</p>
                                        <p className="text-xs mt-1">Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map((message) => {
                                        const isOwn = message.senderId === user?.id;
                                        return (
                                            <div
                                                key={message.id}
                                                className={cn(
                                                    'flex gap-2',
                                                    isOwn ? 'justify-end' : 'justify-start'
                                                )}
                                            >
                                                {!isOwn && (
                                                    <Avatar className="h-6 w-6 mt-1">
                                                        <AvatarImage
                                                            src={message.senderAvatar || message.sender?.profile?.image?.url}
                                                            alt={message.senderName || `${message.sender?.firstName} ${message.sender?.lastName}`}
                                                        />
                                                        <AvatarFallback className="text-xs">
                                                            {(message.senderName || `${message.sender?.firstName || ''} ${message.sender?.lastName || ''}`).substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div
                                                    className={cn(
                                                        'rounded-lg px-3 py-2 max-w-[75%]',
                                                        isOwn
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted'
                                                    )}
                                                >
                                                    {!isOwn && (
                                                        <p className="text-xs font-medium mb-1 opacity-80">
                                                            {message.senderName || `${message.sender?.firstName} ${message.sender?.lastName}`}
                                                        </p>
                                                    )}
                                                    <p className="text-sm whitespace-pre-wrap break-words">
                                                        {message.message}
                                                    </p>
                                                    <p
                                                        className={cn(
                                                            'text-xs mt-1',
                                                            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {format(new Date(message.timestamp || message.createdAt), 'HH:mm')}
                                                    </p>
                                                </div>
                                                {isOwn && (
                                                    <Avatar className="h-6 w-6 mt-1">
                                                        <AvatarFallback className="text-xs">
                                                            {user?.firstName?.substring(0, 1).toUpperCase() ||
                                                                'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t">
                            <div className="flex gap-2">
                                <Input
                                    ref={inputRef}
                                    value={messageInput}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type a message..."
                                    className="flex-1"
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    size="icon"
                                    disabled={!messageInput.trim()}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </PopoverContent>
        </Popover>
    );
}

