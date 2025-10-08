import React from "react";

// Types
import type { THandlerComponentProps, IActionComponent } from "@/@types/handler-types";
import type { TSingleHandlerStore } from "@/stores";


interface ActionComponentRendererProps<
  TData,
  TListActionProps extends Record<string, any> = {}
> {
  actionComponents?: IActionComponent<TSingleHandlerStore<TData, TListActionProps>>[];
  storeKey: string;
  store: TSingleHandlerStore<TData, TListActionProps>;
}

const useActionComponentsMap = <TData, TListActionProps extends Record<string, any> = {}>(
  components: IActionComponent<TSingleHandlerStore<TData, TListActionProps>>[] | undefined
) => {
  return React.useMemo(() => {
    if (!components) return null;

    return components.reduce((acc, extra) => {
      acc[extra.action] = extra.comp;
      return acc;
    }, {} as Record<string, React.ComponentType<THandlerComponentProps<TSingleHandlerStore<TData, TListActionProps>>>>);
  }, [components]);
};

export const ActionComponentHandler = <
  IData,
  TListActionProps extends Record<string, any> = {}
>({
  actionComponents,
  storeKey,
  store,
}: ActionComponentRendererProps<IData, TListActionProps>) => {
  const actionComponentsMap = useActionComponentsMap<IData, TListActionProps>(actionComponents);

  if (!store) {
    return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
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
      />
    );
  }, [action, actionComponentsMap, storeKey]);
};
