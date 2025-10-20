// Utils
import { BaseService } from "./base.service";

// Types
import type {
  IRole,
  IPermission,
  IResource,
  IListQueryParams,
  IMessageResponse,
} from "@shared/interfaces";

// Constants
const ROLES_API_PATH = "/roles";
const PERMISSIONS_API_PATH = "/roles/permissions";
const RESOURCES_API_PATH = "/roles/resources";

// Create base service instances
const roleService = new BaseService<IRole, Partial<IRole>, Partial<IRole>>(ROLES_API_PATH);
const permissionService = new BaseService<IPermission, Partial<IPermission>, Partial<IPermission>>(PERMISSIONS_API_PATH);
const resourceService = new BaseService<IResource, Partial<IResource>, Partial<IResource>>(RESOURCES_API_PATH);

// =========================
// Role CRUD Operations
// =========================
export const fetchRoles = (params: IListQueryParams) => roleService.get(params);
export const fetchRole = (id: number, params?: IListQueryParams) => roleService.getSingle(id, params);
export const createRole = (data: IRole) => roleService.post(data);
export const updateRole = (id: number, data: Partial<IRole>) => roleService.patch(id, data);
export const deleteRole = (id: number) => roleService.delete(id);

// =========================
// Permission CRUD Operations
// =========================
export const fetchPermissions = (params: IListQueryParams) => permissionService.get(params);
export const fetchPermission = (id: number, params?: IListQueryParams) => permissionService.getSingle(id, params);
export const createPermission = (data: IPermission) => permissionService.post(data);
export const updatePermission = (id: number, data: Partial<IPermission>) => permissionService.patch(id, data);
export const deletePermission = (id: number) => permissionService.delete(id);

// (Optional) Permissions by Role
export const fetchPermissionsByRole = (roleId: number, params: IListQueryParams) =>
  roleService.get(params, `${roleId}/permissions`);

// =========================
// Resource CRUD Operations
// =========================
export const fetchResources = (params: IListQueryParams) => resourceService.get(params);
export const fetchResource = (id: number, params?: IListQueryParams) => resourceService.getSingle(id, params);
export const createResource = (data: IResource) => resourceService.post(data);
export const updateResource = (id: number, data: Partial<IResource>) => resourceService.patch(id, data);
export const deleteResource = (id: number) => resourceService.delete(id);
