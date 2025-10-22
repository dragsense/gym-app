import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// Types
import type { ITrainer } from '@shared/interfaces/trainer.interface';

// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Components
import { TrainerList, TrainerView } from "@/components/admin";

// Services
import { fetchTrainers, fetchTrainer, deleteTrainer } from '@/services/trainer.api';

// Page Components
import { TrainerForm } from "@/page-components/trainer";

// Layouts
import { PageInnerLayout } from "@/layouts";
import { EUserLevels, EUserRole } from "@shared/enums";
import type { ITrainerListExtraProps } from "@/components/admin/trainers/list/trainer-list";
import type { TTrainerListData } from "@shared/types";
import type { TTrainerViewExtraProps } from "@/components/admin/trainers/view/trainer-view";
import { ProfileForm } from "@/page-components";

export default function TrainersPage() {
    const queryClient = useQueryClient();

    const TRAINERS_STORE_KEY = 'trainer';

    return (
        <PageInnerLayout Header={<Header />}>
            <SingleHandler<ITrainer, any>
                queryFn={fetchTrainer}
                initialParams={{ 
                    _relations: 'user.profile',
                }}
                deleteFn={deleteTrainer}
                storeKey={TRAINERS_STORE_KEY}
                onDeleteSuccess={() => queryClient.invalidateQueries({ queryKey: [TRAINERS_STORE_KEY + "-list"] })}
                SingleComponent={TrainerView}
                actionComponents={[
                    {
                        action: 'createOrUpdate',
                        comp: TrainerForm
                    },
                    {
                        action: 'updateProfile',
                        comp: ProfileForm  as any
                      }
                ]}
            />

            <ListHandler<ITrainer, TTrainerListData, ITrainerListExtraProps, ITrainer, TTrainerViewExtraProps>
                queryFn={fetchTrainers}
                initialParams={{
                    _relations: 'user.profile',
                    _select: 'user.email, user.profile.firstName, user.profile.lastName, user.profile.phoneNumber',
                }}
                ListComponent={TrainerList} 
                storeKey={TRAINERS_STORE_KEY}
                listProps={{
                    level: EUserLevels[EUserRole.TRAINER]
                }}
            />
        </PageInnerLayout>
    );
}

const Header = () => null;
