import { InventoryDto } from "../../dtos";
import { IMessageResponse } from "../api/response.interface";

export interface IInventory extends InventoryDto {}
export interface IInventoryResponse extends IMessageResponse {}
