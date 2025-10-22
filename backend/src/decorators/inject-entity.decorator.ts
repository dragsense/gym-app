export function InjectEntity(entity: any): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const original = target.constructor;

    const wrapped = function (...args: any[]) {
      const instance = new original(...args);
      const service = args[parameterIndex];
      if (service?.setEntity) service.setEntity(entity);
      return instance;
    };

    Object.defineProperty(wrapped, 'name', { value: original.name });
    target.constructor = wrapped;
  };
}