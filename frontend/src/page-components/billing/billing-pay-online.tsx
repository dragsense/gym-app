// External Libraries
import { useId, useTransition, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CreditCard, Loader2 } from "lucide-react";
import { useShallow } from 'zustand/shallow';

// Types
import { type TListHandlerComponentProps } from "@/@types/handler-types";
import { type TListHandlerStore } from "@/stores";
import { type IBilling } from "@shared/interfaces/billing.interface";

// Components
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Services
import { createCheckoutSession, handleCheckoutSuccess, handleCheckoutCancel } from "@/services/billing.api";
import { useI18n } from "@/hooks/use-i18n";
import { buildSentence } from "@/locales/translations";

export type TBillingPayOnlineExtraProps = Record<string, any>;

interface IBillingPayOnlineProps extends TListHandlerComponentProps<TListHandlerStore<IBilling, Record<string, any>, TBillingPayOnlineExtraProps>> {
}

export default function BillingPayOnline({
    storeKey,
    store,
}: IBillingPayOnlineProps) {
    const componentId = useId();
    const [, startTransition] = useTransition();
    const queryClient = useQueryClient();
    const { t } = useI18n();
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

    const { action, payload, setAction } = store(useShallow(state => ({
        action: state.action,
        payload: state.payload,
        setAction: state.setAction,
    })));

    const billingId = payload as string;

    const handleClose = useCallback(() => {
        startTransition(() => {
            setAction('', null);
            setCheckoutUrl(null);
        });
    }, [setAction, startTransition]);

    // Handle checkout success/cancel from URL params
    useEffect(() => {
        if (!action || action !== 'pay-online') return;

        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const sessionId = urlParams.get('session_id');
        const cancel = urlParams.get('cancel');

        if (token) {
            if (cancel === 'true') {
                handleCheckoutCancel().then(() => {
                        toast.info(buildSentence(t, 'payment', 'was', 'canceled'));
                    handleClose();
                });
            } else if (sessionId) {
                handleCheckoutSuccess(token, sessionId).then((result: any) => {
                    if (result.success) {
                        toast.success(buildSentence(t, 'payment', 'completed', 'successfully'));
                        queryClient.invalidateQueries({ queryKey: [storeKey + "-list"] });
                        handleClose();
                    } else {
                        toast.error(buildSentence(t, 'payment', 'verification', 'failed'));
                    }
                });
            }
        }
    }, [action, storeKey, queryClient, handleClose]);

    const handleCreateCheckout = async () => {
        if (!billingId) return;

        setIsProcessing(true);
        try {
            const successUrl = `/billings/checkout/success`;
            const cancelUrl = `/billings/checkout/cancel`;

            const result: any = await createCheckoutSession(billingId, {
                paymentSuccessUrl: successUrl,
                paymentCancelUrl: cancelUrl,
            });

            if (result.checkoutUrl) {
                setCheckoutUrl(result.checkoutUrl);
                // Open checkout in new window
                window.open(result.checkoutUrl, '_blank');
            } else {
                toast.error(result.message || buildSentence(t, 'failed', 'to', 'create', 'checkout', 'session'));
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : buildSentence(t, 'failed', 'to', 'create', 'checkout', 'session'));
        } finally {
            setIsProcessing(false);
        }
    };

    if (!billingId) {
        return null;
    }

    return (
        <Dialog open={action === 'pay-online'} onOpenChange={handleClose} data-component-id={componentId}>
            <DialogContent className="min-w-md">
                <AppDialog
                    title={buildSentence(t, 'pay', 'online')}
                    description={buildSentence(t, 'create', 'checkout')}
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                <strong>{t('billing')} ID:</strong> {billingId}
                            </p>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={isProcessing}
                            >
                                    {t('cancel')}
                            </Button>
                            <Button
                                onClick={handleCreateCheckout}
                                disabled={isProcessing || !!checkoutUrl}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {t('processing')}
                                    </>
                                ) : checkoutUrl ? (
                                    <>
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        {buildSentence(t, 'checkout', 'opened')}
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        {buildSentence(t, 'create', 'checkout')}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </AppDialog>
            </DialogContent>
        </Dialog>
    );
}

