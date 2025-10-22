// Utils
import { BaseService } from "./base.service";

// Types
import type{ IListQueryParams } from "@shared/interfaces/api/param.interface";
import type { ISession } from "@shared/interfaces/session.interface";
import type { TSessionData, TUpdateSessionData, TSessionListData } from "@shared/types/session.type";

// Constants
const SESSIONS_API_PATH = "/sessions";

// Create base service instance
const sessionService = new BaseService<ISession, TSessionData, Partial<TSessionData>>(SESSIONS_API_PATH);

// Re-export common CRUD operations
export const fetchSessions = (params: IListQueryParams) => sessionService.get(params);
export const fetchSession = (id: number, params: IListQueryParams) => sessionService.getSingle(id, params);
export const createSession = (data: TSessionData) => sessionService.post(data);
export const updateSession = (id: number) => sessionService.patch(id);
export const deleteSession = (id: number) => sessionService.delete(id);
