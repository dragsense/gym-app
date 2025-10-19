import { useState } from "react";
import { PageInnerLayout } from "@/layouts";
import { SettingsLayout } from "@/components/admin/settings";

// Settings components
import { UserSettingsForm } from "@/page-components/user-settings";
import { UserAvailabilityForm } from "@/page-components/user-availability";
import { PaymentMethodsManagement } from "@/components/admin/settings";

// UI Components
import { User, Clock, CreditCard } from "lucide-react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<string>('user-settings');

    return (
        <PageInnerLayout Header={<Header />}>
            <SettingsLayout
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabs={[
                    {
                        id: 'user-settings',
                        label: 'User Settings',
                        icon: User,
                        content: <UserSettingsForm />
                    },
                    {
                        id: 'availability',
                        label: 'Availability',
                        icon: Clock,
                        content: <UserAvailabilityForm />
                    },
                    {
                        id: 'payment-methods',
                        label: 'Payment Methods',
                        icon: CreditCard,
                        content: <PaymentMethodsManagement />
                    }
                ]}
            />
        </PageInnerLayout>
    );
}

const Header = () => null;