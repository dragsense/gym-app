import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
import type { IRole, IPermission, IResource } from '@shared/interfaces';

// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Components
import { RoleList } from "@/components/admin/roles/list/role-list";
import { PermissionList } from "@/components/admin/roles/list/permission-list";
import { ResourceList } from "@/components/admin/roles/list/resource-list";

// Services
import { fetchRoles, fetchRole, deleteRole, fetchPermissions, fetchPermission, deletePermission, fetchResources, fetchResource, updateResource } from '@/services/roles.api';

// Page Components
import { RoleForm, ViewRolePermissions } from "@/page-components/roles";
import { PermissionForm } from "@/page-components/permissions";
import { ResourceForm } from "@/page-components/resources";

// Layouts
import { PageInnerLayout } from "@/layouts";

export default function RolesPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("roles");

    const ROLES_STORE_KEY = 'role';
    const PERMISSIONS_STORE_KEY = 'permission';
    const RESOURCES_STORE_KEY = 'resource';

    return (
        <PageInnerLayout Header={<Header />}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>

                <TabsContent value="roles" className="mt-6">
                    <SingleHandler<IRole, any>
                        queryFn={fetchRole}
                        deleteFn={deleteRole}
                        storeKey={ROLES_STORE_KEY}
                        onDeleteSuccess={() => queryClient.invalidateQueries({ queryKey: [ROLES_STORE_KEY + "-list"] })}
                        SingleComponent={() => null}
                        actionComponents={[
                            {
                                action: 'createOrUpdate',
                                comp: RoleForm
                            },
                            {
                                action: 'viewPermissions',
                                comp: ViewRolePermissions
                            },
                        ]}
                    />

                    <ListHandler<IRole, any>
                        queryFn={fetchRoles}
                        initialParams={{
                            _relations: 'permissions',
                            _countable: 'permissions'
                        }}
                        ListComponent={RoleList}
                        storeKey={ROLES_STORE_KEY}

                    />
                </TabsContent>

                <TabsContent value="permissions" className="mt-6">
                    <SingleHandler<IPermission, any>
                        queryFn={fetchPermission}
                        deleteFn={deletePermission}
                        storeKey={PERMISSIONS_STORE_KEY}
                        onDeleteSuccess={() => queryClient.invalidateQueries({ queryKey: [PERMISSIONS_STORE_KEY + "-list"] })}
                        SingleComponent={() => null}
                        actionComponents={[
                            {
                                action: 'createOrUpdate',
                                comp: PermissionForm
                            }
                        ]}
                    />

                    <ListHandler<IPermission, any>
                        queryFn={fetchPermissions}
                        initialParams={{
                            _relations: 'resource',
                            _select: 'resource.displayName, resource.name'
                        }}
                        ListComponent={PermissionList}
                        storeKey={PERMISSIONS_STORE_KEY}

                    />
                </TabsContent>

                <TabsContent value="resources" className="mt-6">
                    <SingleHandler<IResource, any>
                        queryFn={fetchResource}
                        storeKey={RESOURCES_STORE_KEY}
                        SingleComponent={() => null}
                        actionComponents={[
                            {
                                action: 'udpate',
                                comp: ResourceForm
                            }
                        ]}
                    />

                    <ListHandler<IResource, any>
                        queryFn={fetchResources}
                        ListComponent={ResourceList}
                        storeKey={RESOURCES_STORE_KEY}
                    />
                </TabsContent>
            </Tabs>
        </PageInnerLayout >
    );
}

const Header = () => null;
