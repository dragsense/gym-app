// Utils
import { BaseService } from "../base.service";

// Types
import type { IListQueryParams } from "@shared/interfaces/api/param.interface";
import type { IInventory } from "@shared/interfaces/products/inventory.interface";
import type {
  TInventoryData,
  TUpdateInventoryData,
} from "@shared/types/products/inventory.type";

// Constants
const INVENTORY_API_PATH = "/inventory";

// Create base service instance
const inventoryService = new BaseService<
  IInventory,
  TInventoryData,
  TUpdateInventoryData
>(INVENTORY_API_PATH);

// Re-export common CRUD operations
export const fetchInventories = (params: IListQueryParams) =>
  inventoryService.get(params);
export const fetchInventory = (id: string, params: IListQueryParams) =>
  inventoryService.getSingle(id, params);
export const createInventory = (data: TInventoryData) =>
  inventoryService.post(data);
export const updateInventory = (id: string) => inventoryService.patch(id);
export const deleteInventory = (id: string) => inventoryService.delete(id);
