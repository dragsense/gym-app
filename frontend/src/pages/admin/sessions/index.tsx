import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// Types
import type { ISession } from "@shared/interfaces/session.interface";

// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Components
import { SessionList, SessionView } from "@/components/admin";
import SessionsCalendar from "./calendar";

// Services
import { fetchSessions, fetchSession, deleteSession } from '@/services/session.api';

// Page Components
import { SessionForm } from "@/page-components/session";

// Layouts
import { PageInnerLayout } from "@/layouts";
import type { ISessionListExtraProps } from "@/components/admin/sessions/list/session-list";
import type { TSessionListData } from "@shared/types";
import type { TSessionViewExtraProps } from "@/components/admin/sessions/view/session-view";
import { SessionListDto } from "@shared/dtos/session-dtos/session.dto";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Calendar as CalendarIcon } from "lucide-react";

export default function SessionsPage() {
    const queryClient = useQueryClient();
    const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');

    const SESSIONS_STORE_KEY = 'session';

    return (
        <PageInnerLayout Header={<Header />}>
            <SingleHandler<ISession, any>
                queryFn={fetchSession}
                initialParams={{ 
                    _relations: 'clientsUsers.profile, trainerUser.profile',
                    _select: 'trainerUser.email, trainerUser.profile.firstName, trainerUser.profile.lastName,  clientsUsers.email, clientsUsers.profile.firstName, clientsUsers.profile.lastName',
                   
                }}
                deleteFn={deleteSession}
                storeKey={SESSIONS_STORE_KEY}
                onDeleteSuccess={() => queryClient.invalidateQueries({ queryKey: [SESSIONS_STORE_KEY + "-list"] })}
                SingleComponent={SessionView}
                actionComponents={[
                    {
                        action: 'createOrUpdate',
                        comp: SessionForm
                    }
                ]}
            />

            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'list' | 'calendar')}>
                <TabsList className="mb-6">
                    <TabsTrigger value="list" className="flex items-center gap-2">
                        <List className="h-4 w-4" />
                        List View
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Calendar View
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                    <ListHandler<ISession, TSessionListData, ISessionListExtraProps, ISession, TSessionViewExtraProps>
                        queryFn={fetchSessions}
                        initialParams={{
                            _relations: 'clientsUsers, trainerUser.profile',
                            _select: 'trainerUser.email, trainerUser.profile.firstName, trainerUser.profile.lastName',
                            _countable: 'clientsUsers',
                        }}
                        ListComponent={SessionList} 
                        dto={SessionListDto}
                        storeKey={SESSIONS_STORE_KEY}
                        listProps={{}}
                    />
                </TabsContent>

                <TabsContent value="calendar">
                    <SessionsCalendar />
                </TabsContent>
            </Tabs>
        </PageInnerLayout>
    );
}

const Header = () => null;
