// Utils
import { BaseService } from "./base.service";

// Types
import type{ IListQueryParams } from "@shared/interfaces/api/param.interface";
import type { IClient } from "@shared/interfaces/client.interface";
import type { TClientData } from "@shared/types/client.type";

// Constants
const CLIENTS_API_PATH = "/clients";

// Create base service instance
const clientService = new BaseService<IClient, TClientData, Partial<TClientData>>(CLIENTS_API_PATH);

// Re-export common CRUD operations
export const fetchClients = (params: IListQueryParams) => clientService.get(params);
export const fetchClient = (id: number) => clientService.getSingle(id);
export const createClient = (data: TClientData) => clientService.post(data);
export const updateClient = (id: number) => clientService.patch(id);
export const deleteClient = (id: number) => clientService.delete(id);
