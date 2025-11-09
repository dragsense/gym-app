// Utils
import { BaseService } from "./base.service";

// Types
import type { IListQueryParams } from "@shared/interfaces/api/param.interface";
import type { IBilling } from "@shared/interfaces/billing.interface";
import type {
  TBillingData,
  TUpdateBillingData,
} from "@shared/types/billing.type";

// Constants
const BILLINGS_API_PATH = "/billings";

// Create base service instance
const billingService = new BaseService<
  IBilling,
  TBillingData,
  Partial<TBillingData>
>(BILLINGS_API_PATH);

// Re-export common CRUD operations
export const fetchBillings = (params: IListQueryParams) =>
  billingService.get(params);
export const fetchBilling = (id: string, params: IListQueryParams) =>
  billingService.getSingle(id, params);
export const createBilling = (data: TBillingData) => billingService.post(data);
export const updateBilling = (id: string) => billingService.patch(id);
export const deleteBilling = (id: string) => billingService.delete(id);

// Custom endpoints
export const createCheckoutSession = (id: string, data: { paymentSuccessUrl: string; paymentCancelUrl: string }) =>
  billingService.post(data, undefined, `/${id}/checkout-url`);

export const handleCheckoutSuccess = (token: string, sessionId: string) =>
  billingService.getSingle(undefined, { token, session_id: sessionId }, '/checkout/success');

export const handleCheckoutCancel = () =>
  billingService.getSingle(undefined, undefined, '/checkout/cancel');

export const sendBillingEmail = (id: string) =>
  billingService.post({}, undefined, `/${id}/send-email`);