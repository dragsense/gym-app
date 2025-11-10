import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Users, UserPlus, Search } from 'lucide-react';
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
import { useSearchableUsers } from '@/hooks/use-searchable';
import type { IUser } from '@shared/interfaces/user.interface';
import { useI18n } from '@/hooks/use-i18n';
import { buildSentence } from '@/locales/translations';
import { useUserSettings } from '@/hooks/use-user-settings';
import { formatTime } from '@/lib/utils';

export function ChatWindow() {
    const [open, setOpen] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [showChats, setShowChats] = useState(true);
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const userClosedRef = useRef(false);
    const { user } = useAuthUser();
    const { t } = useI18n();
    const { settings } = useUserSettings();
    const {
        chats,
        currentChat,
        messages,
        isTyping,
        setCurrentChat,
        sendMessage,
        startNewChat,
        isConnected,
        loadMoreMessages,
        isLoadingMore,
        hasMoreMessages,
        shouldAutoScroll,
        setShouldAutoScroll,
    } = useChat();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const previousScrollHeightRef = useRef<number>(0);
    const { response: usersResponse, isLoading: isLoadingUsers, setFilters } = useSearchableUsers({
        initialParams: { page: 1, limit: 20 }
    });

    // Auto-open chat window when a chat is set (only if user didn't manually close it)
    useEffect(() => {
        if (currentChat && !open && !userClosedRef.current) {
            setOpen(true);
            setShowChats(false);
            userClosedRef.current = false; // Reset after auto-opening
        }
    }, [currentChat, open]);

    // Scroll to bottom when new messages arrive (only if user is at bottom or it's a new message)

    useEffect(() => {
        if (messagesEndRef.current && shouldAutoScroll) {
            // Small delay to ensure DOM is updated
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [messages, shouldAutoScroll]);

    // Handle scroll to detect when user scrolls up
    const handleScroll = useCallback((e: Event) => {
        const target = e.currentTarget as HTMLDivElement;
        const isNearTop = target.scrollTop < 100;
        const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;

        // Auto-scroll if user is near bottom
        setShouldAutoScroll(isNearBottom);

        // Load more messages when scrolling to top
        if (isNearTop && hasMoreMessages && !isLoadingMore) {
            loadMoreMessages(target, previousScrollHeightRef).then(() => {
                // Restore scroll position after loading older messages
                setTimeout(() => {
                    if (target && previousScrollHeightRef.current) {
                        const newScrollHeight = target.scrollHeight;
                        const scrollDifference = newScrollHeight - previousScrollHeightRef.current;
                        target.scrollTop = scrollDifference;
                    }
                }, 50);
            });
        }
    }, [hasMoreMessages, isLoadingMore, loadMoreMessages]);

    // Focus input when chat is selected
    useEffect(() => {
        if (currentChat && inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentChat]);

    // Cleanup scroll listener
    useEffect(() => {
        const viewport = scrollContainerRef.current;
        if (viewport) {
            viewport.addEventListener('scroll', handleScroll as any);
            return () => {
                viewport.removeEventListener('scroll', handleScroll as any);
            };
        }
    }, [handleScroll]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !currentChat) return;

        const recipientId = currentChat.participantId;

        try {
            await sendMessage(messageInput, recipientId);
            setMessageInput('');

            // Stop typing indicator - use actual chat ID after send (may have changed)
            // Note: chat ID will be updated by sendMessage if it was a temp ID
            setTimeout(() => {
                const actualChatId = currentChat.id;
                if (actualChatId && !actualChatId.startsWith('chat_') && chatService.isConnected) {
                    chatService.sendTyping(actualChatId, false);
                }
            }, 100);
        } catch (error) {
            console.error('Failed to send message:', error);
            // Keep message input on error so user can retry
        }
    };

    const handleInputChange = (value: string) => {
        setMessageInput(value);

        // Send typing indicator - only if chat ID is valid (not temp ID)
        if (currentChat && chatService.isConnected && value.trim()) {
            const chatId = currentChat.id;
            // Only send typing indicator if we have a valid UUID chat ID
            if (chatId && !chatId.startsWith('chat_')) {
                chatService.sendTyping(chatId, true);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSearchUsers = (query: string) => {
        setSearchQuery(query);
        setFilters({ search: query, page: 1 });
    };

    const handleStartChat = (user: IUser) => {
        // Check if chat already exists
        const existingChat = chats.find(
            (c) => c.participantId === user.id
        );

        if (existingChat) {
            // Use existing chat
            setCurrentChat(existingChat.id);
            setShowChats(false);
            setShowUserSearch(false);
        } else {
            // Start new chat
            startNewChat(
                user.id,
                `${user.firstName} ${user.lastName}`
            );
            setCurrentChat(null, user.id);
            setShowChats(false);
            setShowUserSearch(false);
        }
    };

    const filteredUsers = usersResponse?.data?.filter(
        (userItem) => userItem.id !== user?.id
    ) || [];

    const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            // User manually closed the chat
            userClosedRef.current = true;
            // Reset after a short delay so auto-open can work again for new chats
            setTimeout(() => {
                userClosedRef.current = false;
            }, 100);
        }
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange} modal={true}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-14 w-14 rounded-full shadow-lg"
                    aria-label={t('chat')}
                    onClick={(e) => {
                        // Toggle open state
                        if (open) {
                            e.preventDefault();
                            handleOpenChange(false);
                        }
                    }}
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
            <PopoverContent
                className="w-96 h-[600px] p-0 flex flex-col"
                align="end"
                onEscapeKeyDown={() => handleOpenChange(false)}
                onPointerDownOutside={() => {
                    // Allow closing on outside click
                    handleOpenChange(false);
                }}
            >
                {showUserSearch ? (
                    // User Search View
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                {buildSentence(t, 'start', 'new', 'chat')}
                            </h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                    setShowUserSearch(false);
                                    setSearchQuery('');
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="p-4 border-b">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={buildSentence(t, 'search', 'users')}
                                    value={searchQuery}
                                    onChange={(e) => handleSearchUsers(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <ScrollArea className="flex-1 min-h-0">
                            <div className="pr-4">
                                {isLoadingUsers ? (
                                    <div className="flex items-center justify-center py-8">
                                        <p className="text-sm text-muted-foreground">{buildSentence(t, 'loading', 'users')}</p>
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                        <UserPlus className="h-12 w-12 mb-4 opacity-50" />
                                        <p className="text-sm">{buildSentence(t, 'no', 'users', 'found')}</p>
                                        {searchQuery && (
                                            <p className="text-xs mt-1">{buildSentence(t, 'try', 'a', 'different', 'search', 'term')}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {filteredUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                className={cn(
                                                    'flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer'
                                                )}
                                                onClick={() => handleStartChat(user)}
                                            >
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage
                                                        src={undefined}
                                                        alt={`${user.firstName} ${user.lastName}`}
                                                    />
                                                    <AvatarFallback>
                                                        {user.firstName?.substring(0, 2).toUpperCase() || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">
                                                        {user.firstName} {user.lastName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                ) : showChats && !currentChat ? (
                    // Chats List
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {t('chat')}
                            </h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setShowUserSearch(true)}
                                title={buildSentence(t, 'start', 'new', 'chat')}
                            >
                                <UserPlus className="h-4 w-4" />
                            </Button>
                        </div>
                        <ScrollArea className="flex-1 min-h-0">
                            <div className="pr-4">
                                {chats.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                        <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                                        <p className="text-sm">{buildSentence(t, 'no', 'chats', 'yet')}</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {chats.map((chat) => (
                                            <div
                                                key={chat.id}
                                                className={cn(
                                                    'p-4 hover:bg-muted/50 transition-colors cursor-pointer',
                                                    chat.unreadCount > 0 && 'bg-muted/30'
                                                )}
                                                onClick={() => {
                                                    setCurrentChat(chat.id);
                                                    setShowChats(false);
                                                }}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage
                                                            src={chat.participantAvatar}
                                                            alt={chat.participantName}
                                                        />
                                                        <AvatarFallback>
                                                            {chat.participantName
                                                                .substring(0, 2)
                                                                .toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="font-medium text-sm truncate">
                                                                {chat.participantName}
                                                            </p>
                                                            {chat.unreadCount > 0 && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {chat.unreadCount}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {chat.lastMessage && (
                                                            <>
                                                                <p className="text-sm text-muted-foreground truncate">
                                                                    {chat.lastMessage.message}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {formatDistanceToNow(
                                                                        new Date(chat.lastMessage.timestamp),
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
                            </div>
                        </ScrollArea>
                    </div>
                ) : currentChat ? (
                    // Chat Messages
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => {
                                            setCurrentChat(null);
                                            setShowChats(true);
                                        }}
                                        title={buildSentence(t, 'back', 'to', 'chats')}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setShowUserSearch(true)}
                                        title={buildSentence(t, 'start', 'new', 'chat')}
                                    >
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src={currentChat.participantAvatar}
                                        alt={currentChat.participantName}
                                    />
                                    <AvatarFallback>
                                        {currentChat.participantName
                                            .substring(0, 2)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-sm">
                                        {currentChat.participantName}
                                    </p>
                                    {isTyping[currentChat.participantId] && (
                                        <p className="text-xs text-muted-foreground">{buildSentence(t, 'typing')}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 min-h-0">
                            <div
                                className="p-4 space-y-4"
                                ref={(el) => {
                                    // Access the ScrollArea viewport
                                    if (el) {
                                        const viewport = el.closest('[data-slot="scroll-area-viewport"]') as HTMLDivElement;
                                        if (viewport) {
                                            scrollContainerRef.current = viewport;
                                        }
                                    }
                                }}
                            >
                                {isLoadingMore && (
                                    <div className="flex justify-center py-2">
                                        <p className="text-xs text-muted-foreground">{buildSentence(t, 'loading', 'older', 'messages')}</p>
                                    </div>
                                )}
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                        <p className="text-sm">{buildSentence(t, 'no', 'messages', 'yet')}</p>
                                        <p className="text-xs mt-1">{buildSentence(t, 'start', 'the', 'chat')}</p>
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
                                                            src={message.senderAvatar}
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
                                                        {formatTime(message.timestamp || message.createdAt, settings)}
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
                                    placeholder={buildSentence(t, 'type', 'a', 'message')}
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

