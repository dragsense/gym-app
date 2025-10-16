import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// Types
import type { ITrainerClient } from '@shared/interfaces/trainer-client.interface';

// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Components
import { TrainerClientList } from "@/components/admin";

// Services
import { fetchTrainerClients, fetchTrainerClient, deleteTrainerClient } from '@/services/trainer-client.api';

// Page Components
import { TrainerClientForm } from "@/page-components";

// Layouts
import { PageInnerLayout } from "@/layouts";
import type { TTrainerClientData, TTrainerClientListData } from "@shared/types";
import type { TTrainerClientViewExtraProps } from "@/components/admin/trainer-clients/view/trainer-client-view";

export default function TrainerClientsPage() {
    const queryClient = useQueryClient();

    const TRAINER_CLIENTS_STORE_KEY = 'trainer-client';

    return (
        <PageInnerLayout Header={<Header />}>
            <SingleHandler<ITrainerClient, any>
                queryFn={fetchTrainerClient}
                deleteFn={deleteTrainerClient}
                storeKey={TRAINER_CLIENTS_STORE_KEY}
                onDeleteSuccess={() => queryClient.invalidateQueries({ queryKey: [TRAINER_CLIENTS_STORE_KEY + "-list"] })}
                SingleComponent={() => <div>Trainer-Client View Component</div>}
                actionComponents={[
                    {
                        action: 'createOrUpdate',
                        comp: TrainerClientForm
                    }
                ]}
            />

            <ListHandler<ITrainerClient, TTrainerClientListData, any, ITrainerClient, TTrainerClientViewExtraProps>
                queryFn={fetchTrainerClients}
                initialParams={{
                    _relations: 'trainer.user, client.user',
                    _select: 'trainer.user.email, client.user.email, status, notes, createdAt',
                    sortBy: 'createdAt',
                    sortOrder: 'DESC',
                }}
                ListComponent={TrainerClientList}
                storeKey={TRAINER_CLIENTS_STORE_KEY}
            />
        </PageInnerLayout>
    );
}

const Header = () => null;
