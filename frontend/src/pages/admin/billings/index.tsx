import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// Types
import type { IBilling } from "@shared/interfaces/billing.interface";

// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Components
import { BillingList, BillingView } from "@/components/admin";

// Services
import { fetchBillings, fetchBilling, deleteBilling } from '@/services/billing.api';

// Page Components
import { BillingForm, BillingPayOnline, BillingSendEmail } from "@/page-components/billing";

// Layouts
import { PageInnerLayout } from "@/layouts";
import type { IBillingListExtraProps } from "@/components/admin/billings/list/billing-list";
import type { TBillingListData } from "@shared/types/billing.type";
import type { TBillingViewExtraProps } from "@/components/admin/billings/view/billing-view";
import { BillingListDto } from "@shared/dtos/billing-dtos/billing.dto";


export default function BillingsPage() {
    const queryClient = useQueryClient();

    const BILLINGS_STORE_KEY = 'billing';

    return (
        <PageInnerLayout Header={<Header />}>
            <SingleHandler<IBilling, any>
                queryFn={fetchBilling}
                initialParams={{
                    _relations: 'recipientUser',
                    _select: 'recipientUser.email, recipientUser.firstName, recipientUser.lastName',
                }}
                deleteFn={deleteBilling}
                storeKey={BILLINGS_STORE_KEY}
                onDeleteSuccess={() => queryClient.invalidateQueries({ queryKey: [BILLINGS_STORE_KEY + "-list"] })}
                SingleComponent={BillingView}
                actionComponents={[
                    {
                        action: 'createOrUpdate',
                        comp: BillingForm
                    }
                ]}
            />

            <ListHandler<IBilling, TBillingListData, IBillingListExtraProps, IBilling, TBillingViewExtraProps>
                queryFn={fetchBillings}
                initialParams={{
                    _relations: 'recipientUser',
                    _select: 'recipientUser.email, recipientUser.firstName, recipientUser.lastName',
                }}
                ListComponent={BillingList}
                dto={BillingListDto}
                storeKey={BILLINGS_STORE_KEY}
                listProps={{}}
                actionComponents={[
                    {
                        action: 'pay-online',
                        comp: BillingPayOnline
                    },
                    {
                        action: 'sendEmail',
                        comp: BillingSendEmail
                    }
                ]}
            />
        </PageInnerLayout>
    );
}

const Header = () => null;

