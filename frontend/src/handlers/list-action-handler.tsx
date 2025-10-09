import React from "react";

// Types
import { type TListHandlerComponentProps, type IListActionComponent } from "@/@types/handler-types";
import { type TListHandlerStore, type TSingleHandlerStore } from "@/stores";



interface ListActionComponentRendererProps<
  IData,
  TActionProps extends Record<string, any> = {},
  TSingleData = never,
  TSingleExtraProps extends Record<string, any> = {}
> {
  actionComponents?: IListActionComponent<TListHandlerStore<IData, TActionProps>, TSingleHandlerStore<TSingleData, TSingleExtraProps>>[];
  storeKey: string;
  store: TListHandlerStore<IData, TActionProps>;
  singleStore?: TSingleHandlerStore<TSingleData, TSingleExtraProps>;
}

const useActionComponentsMap = <IData, TActionProps extends Record<string, any> = {}, TSingleData = never, TSingleExtraProps extends Record<string, any> = {}>(
  components: IListActionComponent<TListHandlerStore<IData, TActionProps>, TSingleHandlerStore<TSingleData, TSingleExtraProps>>[] | undefined
) => {
  return React.useMemo(() => {
    if (!components) return null;

    return components.reduce((acc, extra) => {
      acc[extra.action] = extra.comp;
      return acc;
    }, {} as Record<string, React.ComponentType<TListHandlerComponentProps<TListHandlerStore<IData, TActionProps>, TSingleHandlerStore<TSingleData, TSingleExtraProps>>>>);
  }, [components]);
};

export const ListActionComponentHandler = <
  IData,
  TActionProps extends Record<string, any> = {},
  TSingleData = never,
  TSingleExtraProps extends Record<string, any> = {}
>({
  actionComponents,
  storeKey,
  store,
  singleStore,
}: ListActionComponentRendererProps<IData, TActionProps, TSingleData, TSingleExtraProps>) => {
  const actionComponentsMap = useActionComponentsMap<IData, TActionProps, TSingleData, TSingleExtraProps>(actionComponents);

  if (!store) {
    return <div>List store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  const action = store((state) => state.action);


  return React.useMemo(() => {
    if (!action || !actionComponentsMap) return null;

    const ActionComp = actionComponentsMap[action];
    if (!ActionComp) return null;

    return (
      <ActionComp
        key={`action-comp-${action}-${storeKey}`}
        storeKey={storeKey}
        store={store}
        singleStore={singleStore}
      />
    );
  }, [action, actionComponentsMap, storeKey]);
};