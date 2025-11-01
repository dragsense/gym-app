import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// Types
import type { IClient } from '@shared/interfaces/client.interface';

// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Components
import { ClientList, ClientView } from "@/components/admin";

// Services
import { fetchClients, fetchClient, deleteClient } from '@/services/client.api';

// Page Components
import { ClientForm, ProfileForm } from "@/page-components";

// Layouts
import { PageInnerLayout } from "@/layouts";
import { EUserLevels } from "@shared/enums";
import type { TClientListData } from "@shared/types";
import type { TClientViewExtraProps } from "@/components/admin/clients/view/client-view";
import type { IClientListExtraProps } from "@/components/admin/clients/list/client-list";
import { ClientListDto } from "@shared/dtos";

export default function ClientsPage() {
    const queryClient = useQueryClient();

    const CLIENTS_STORE_KEY = 'client';

    return (
        <PageInnerLayout Header={<Header />}>
            <SingleHandler<IClient>
                queryFn={fetchClient}
                initialParams={{
                    _relations: 'user.profile',
                }}
                deleteFn={deleteClient}
                storeKey={CLIENTS_STORE_KEY}
                onDeleteSuccess={() => queryClient.invalidateQueries({ queryKey: [CLIENTS_STORE_KEY + "-list"] })}
                SingleComponent={ClientView}
                actionComponents={[
                    {
                        action: 'createOrUpdate',
                        comp: ClientForm
                    },
                    {
                        action: 'updateProfile',
                        comp: ProfileForm
                    }
                ]}
            />

            <ListHandler<IClient, TClientListData, IClientListExtraProps, IClient, TClientViewExtraProps>
                queryFn={fetchClients}
                initialParams={{
                    _relations: 'user.profile',
                    _select: 'user.email, user.isActive, user.profile.firstName, user.profile.lastName, user.profile.phoneNumber',
                    sortBy: 'createdAt',
                    sortOrder: 'DESC',
                }}
                ListComponent={ClientList}
                dto={ClientListDto}
                storeKey={CLIENTS_STORE_KEY}
                listProps={{
                    level: EUserLevels.CLIENT
                }}
            />
        </PageInnerLayout>
    );
}

const Header = () => null;
