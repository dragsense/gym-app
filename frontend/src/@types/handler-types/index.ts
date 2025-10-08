import { type IMessageResponse } from "@shared/interfaces";

export type TItemActionProps = {
  itemName: string;
  action: string;
  type?: string;
  id: number;
};




export type THandlerComponentProps<T> = {
  storeKey: string;
  store: T
};


export interface IActionComponent<T> {
  action: string;
  comp: React.ComponentType<THandlerComponentProps<T>>;
}

export interface MutationFns<TFormData, TResponse> {
  deleteFn?: (id: number) => Promise<void>;
  updateFn?: (id: number) => (item: TFormData) => Promise<IMessageResponse>;
  createFn?: (
    item: Omit<TFormData, "id" | "createdAt" | "updatedAt">
  ) => Promise<TResponse>;
  onSuccess?: (
    action: string
  ) => (response: TResponse | IMessageResponse | void) => void;
}

export * from "./form.type";
export * from "./list.type";
export * from "./single.type";
