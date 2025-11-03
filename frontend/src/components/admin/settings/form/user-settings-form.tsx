import { useId, useTransition, useState, useMemo } from "react";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/form-ui/form";
import { AppCard } from "@/components/layout-ui/app-card";

// Icons
import { DollarSign, Shield, Building, CreditCard, Bell, Loader2, Clock } from "lucide-react";

// Types
import { type TUserSettingsData } from "@shared/types/settings.type";
import { type TFormHandlerStore } from "@/stores";
import { type THandlerComponentProps } from "@/@types/handler-types";
import { type TFieldConfigObject } from "@/@types/form/field-config.type";
import { type FormInputs } from "@/hooks/use-input";

// Hooks
import { useInput } from "@/hooks/use-input";
import type { BillingSettingsDto, BusinessSettingsDto, LimitSettingsDto, CurrencySettingsDto, NotificationSettingsDto, TimeSettingsDto } from "@shared/dtos";
import { FormErrors } from "@/components/shared-ui/form-errors";

interface IUserSettingsFormProps extends THandlerComponentProps<TFormHandlerStore<TUserSettingsData, any, any>> { }

export default function UserSettingsForm({
    storeKey,
    store,
}: IUserSettingsFormProps) {
    // React 19: Essential IDs and transitions
    const componentId = useId();
    const [activeTab, setActiveTab] = useState("currency");

    if (!store) {
        return <div>Form store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const isSubmitting = store(state => state.isSubmitting);
    const originalFields = store(state => state.fields);



    // React 19: Memoized fields for better performance
    const fields = useMemo(() => ({
        ...originalFields,
        time: {
            ...originalFields.time,
            renderItem: (item: TimeSettingsDto) => {
                return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {item.dateFormat}
                    {item.timeFormat}
                    {item.timezone}
                </div>;
            }
        },
        currency: {
            ...originalFields.currency,
            renderItem: (item: CurrencySettingsDto) => {
                return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {item.defaultCurrency}
                    {item.currencySymbol}

                </div>;
            }
        },
        limits: {
            ...originalFields.limits,
            renderItem: (item: LimitSettingsDto) => {
                return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {item.maxSessionsPerDay}
                    {item.maxClientsPerTrainer}
                    {item.sessionDurationDefault}
                </div>;
            }
        },
        business: {
            ...originalFields.business,
            renderItem: (item: BusinessSettingsDto) => {
                return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {item.businessName}
                    {item.businessEmail}
                    {item.businessPhone}
                    {item.businessAddress}
                    {item.businessLogo}
                </div>;
            }
        },
        billing: {
            ...originalFields.billing,
            renderItem: (item: BillingSettingsDto) => {
                return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {item.taxRate}
                    {item.invoicePrefix}
                </div>;
            }
        },
        notifications: {
            ...originalFields.notifications,
            renderItem: (item: NotificationSettingsDto) => {
                return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {item.emailEnabled}
                    {item.smsEnabled}
                    {item.pushEnabled}
                    {item.inAppEnabled}
                </div>;
            }
        }
    }), [originalFields]);

    const inputs = useInput<TUserSettingsData>({
        fields: fields as TFieldConfigObject<TUserSettingsData>,
        showRequiredAsterisk: true,
    }) as FormInputs<TUserSettingsData>;

    const settingsTabs = [
        {
            id: "time",
            label: "Time",
            icon: Clock,
            description: "Time settings"
        },
        {
            id: "currency",
            label: "Currency",
            icon: DollarSign,
            description: "Currency and localization settings"
        },
        {
            id: "limits",
            label: "Limits",
            icon: Shield,
            description: "Session and client limits"
        },
        {
            id: "business",
            label: "Business",
            icon: Building,
            description: "Business information and branding"
        },
        {
            id: "billing",
            label: "Billing",
            icon: CreditCard,
            description: "Billing and commission settings"
        },
        {
            id: "notifications",
            label: "Notifications",
            icon: Bell,
            description: "Notification preferences"
        }
    ];

    return (
        <Form<TUserSettingsData, any>
            formStore={store}
        >
            <AppCard
                header={
                    <>
                        <p className="text-sm text-muted-foreground">Configure your application settings and preferences</p>
                    </>
                }
                footer={
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting} data-component-id={componentId}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Settings
                        </Button>
                    </div>
                }
            >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

                    <TabsList className="flex justify-between gap-5">
                        {settingsTabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    {settingsTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <TabsContent key={tab.id} value={tab.id} className="mt-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Icon className="h-6 w-6 text-primary" />

                                    </div>

                                    {tab.id === "time" && (
                                        inputs.time
                                    )}

                                    {tab.id === "currency" && (
                                        inputs.currency
                                    )}

                                    {tab.id === "limits" && (
                                        inputs.limits

                                    )}

                                    {tab.id === "business" && (
                                        inputs.business
                                    )}

                                    {tab.id === "billing" && (
                                        inputs.billing
                                    )}

                                    {tab.id === "notifications" && (
                                        inputs.notifications

                                    )}
                                </div>
                            </TabsContent>
                        );
                    })}
                </Tabs>
                <FormErrors />
            </AppCard>
        </Form>
    );
}
