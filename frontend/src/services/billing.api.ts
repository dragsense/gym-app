// Utils
import { BaseService } from "./base.service";

// Types
import type{ IListQueryParams } from "@shared/interfaces/api/param.interface";
import type { IBilling } from "@shared/interfaces/billing.interface";
import type { TBillingData, TUpdateBillingData } from "@shared/types/billing.type";

// Constants
const BILLINGS_API_PATH = "/billings";

// Create base service instance
const billingService = new BaseService<IBilling, TBillingData, Partial<TBillingData>>(BILLINGS_API_PATH);

// Re-export common CRUD operations
export const fetchBillings = (params: IListQueryParams) => billingService.get(params);
export const fetchBilling = (id: number, params: IListQueryParams) => billingService.getSingle(id, params);
export const createBilling = (data: TBillingData) => billingService.post(data);
export const updateBilling = (id: number) => billingService.patch(id);
export const deleteBilling = (id: number) => billingService.delete(id);
