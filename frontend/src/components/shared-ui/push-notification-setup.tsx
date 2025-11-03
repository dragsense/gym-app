import { useEffect } from 'react';
import { Bell, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useState } from 'react';

export function PushNotificationSetup() {
    const {
        permission,
        isSupported,
        requestPermission,
        subscribe,
        subscription,
    } = usePushNotifications();
    const [open, setOpen] = useState(false);

    const handleEnable = async () => {
        try {
            const result = await requestPermission();
            if (result === 'granted') {
                await subscribe();
                setOpen(false);
            }
        } catch (error) {
            console.error('Failed to enable push notifications:', error);
        }
    };

    if (!isSupported) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <Bell className="h-4 w-4" />
                    {subscription ? (
                        <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Push Enabled
                        </>
                    ) : permission === 'granted' ? (
                        <>
                            <XCircle className="h-4 w-4 text-yellow-500" />
                            Not Subscribed
                        </>
                    ) : (
                        'Enable Push'
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enable Push Notifications</DialogTitle>
                    <DialogDescription>
                        Get notified even when you're not on the app. We'll send you updates
                        about important events and messages.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {permission === 'granted' && subscription ? (
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <p>Push notifications are enabled!</p>
                        </div>
                    ) : permission === 'granted' ? (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Permission granted. Click below to complete the setup.
                            </p>
                            <Button onClick={subscribe} className="w-full">
                                Complete Setup
                            </Button>
                        </div>
                    ) : permission === 'denied' ? (
                        <div className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-5 w-5" />
                            <p>
                                Push notifications are blocked. Please enable them in your
                                browser settings.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Allow notifications to stay updated with real-time alerts.
                            </p>
                            <Button onClick={handleEnable} className="w-full">
                                Enable Notifications
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}


