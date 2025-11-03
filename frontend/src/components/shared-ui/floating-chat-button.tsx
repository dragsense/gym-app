import { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSearchableUsers } from '@/hooks/use-searchable';
import type { IUser } from '@shared/interfaces/user.interface';
import { useChat } from '@/hooks/use-chat';
import { useAuthUser } from '@/hooks/use-auth-user';
import { cn } from '@/lib/utils';
import { ChatWindow } from './chat-window';

export function FloatingChatButton() {
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { user: currentUser } = useAuthUser();
    const { setCurrentConversation, startNewConversation } = useChat();
    const { response: usersResponse, isLoading, setFilters } = useSearchableUsers({
        initialParams: { page: 1, limit: 20 }
    });

    const handleSearchUsers = (query: string) => {
        setSearchQuery(query);
        setFilters({ search: query, page: 1 });
    };

    const handleStartChat = (user: IUser) => {
        // Close user search dialog
        setShowUserSearch(false);

        // Start new conversation
        startNewConversation(
            user.id,
            `${user.firstName} ${user.lastName}`
        );

        // Set current conversation to open chat window
        setCurrentConversation(null, user.id);
    };

    const filteredUsers = usersResponse?.data?.filter(
        (user) => user.id !== currentUser?.id
    ) || [];

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                <Button
                    onClick={() => setShowUserSearch(true)}
                    className="h-14 w-14 rounded-full shadow-lg"
                    size="icon"
                    variant="secondary"
                    aria-label="Start new chat"
                    title="Start new chat"
                >
                    <UserPlus className="h-5 w-5" />
                </Button>

                <ChatWindow />
            </div>

            {/* User Search Dialog */}
            <Dialog open={showUserSearch} onOpenChange={setShowUserSearch}>
                <DialogContent className="w-full max-w-md">
                    <DialogHeader>
                        <DialogTitle>Start New Chat</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => handleSearchUsers(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <ScrollArea className="h-[400px]">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <p className="text-sm text-muted-foreground">Loading users...</p>
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                    <UserPlus className="h-12 w-12 mb-4 opacity-50" />
                                    <p className="text-sm">No users found</p>
                                    {searchQuery && (
                                        <p className="text-xs mt-1">Try a different search term</p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className={cn(
                                                'flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer'
                                            )}
                                            onClick={() => handleStartChat(user)}
                                        >
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage
                                                    src={user.profile?.image?.url}
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
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

