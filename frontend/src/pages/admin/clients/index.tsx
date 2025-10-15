import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// Types
import type { IClient } from '@shared/interfaces/client.interface';

// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Components
import { ClientList } from "@/components/admin";

// Services
import { fetchClients, fetchClient, deleteClient } from '@/services/client.api';

// Page Components
import { ClientForm } from "@/page-components";

// Layouts
import { PageInnerLayout } from "@/layouts";
import { EUserLevels } from "@shared/enums";
import { EUserRole } from "@shared/enums";
import type { TClientListData } from "@shared/types";
import type { TClientViewExtraProps } from "@/components/admin/clients/view/client-view";
import type { IClientListExtraProps } from "@/components/admin/clients/list/client-list";

export default function ClientsPage() {
    const queryClient = useQueryClient();

    const CLIENTS_STORE_KEY = 'client';

    return (
        <PageInnerLayout Header={<Header />}>
            <SingleHandler<IClient, any>
                queryFn={fetchClient}
                deleteFn={deleteClient}
                storeKey={CLIENTS_STORE_KEY}
                onDeleteSuccess={() => queryClient.invalidateQueries({ queryKey: [CLIENTS_STORE_KEY + "-list"] })}
                SingleComponent={() => <div>Client View Component</div>}
                actionComponents={[
                    {
                        action: 'createOrUpdate',
                        comp: ClientForm
                    }
                ]}
            />

            <ListHandler<IClient, TClientListData, IClientListExtraProps, IClient, TClientViewExtraProps>
                queryFn={fetchClients}
                ListComponent={ClientList}
                storeKey={CLIENTS_STORE_KEY}
                listProps={{
                    level: EUserLevels[EUserRole.CLIENT]
                }}
            />
        </PageInnerLayout>
    );
}

const Header = () => null;
