import { useState } from "react";
import { PageInnerLayout } from "@/layouts";
import { SettingsLayout } from "@/components/admin/settings";

// Settings components


// UI Components
import { User, Clock, CreditCard } from "lucide-react";
import { UserAvailabilityForm } from "@/page-components";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<string>('user-settings');

    return (
        <PageInnerLayout Header={<Header />}>
            <SettingsLayout
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabs={[
                  
                    {
                        id: 'availability',
                        label: 'Availability',
                        icon: Clock,
                        content: <div>ssdsd</div>
                    },
                 
                ]}
            />
        </PageInnerLayout>
    );
}

const Header = () => null;