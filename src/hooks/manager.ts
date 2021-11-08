export type Dependencies = Array<string | number | boolean>;

interface ICallbackState {
  handler: () => never;
  dependencies: Dependencies;
  isEffect: boolean;
  mounted: boolean;
}

const lastDeps: Dependencies[] = [];
const callbacks: ICallbackState[] = [];
let hookIndex = 0;

const register =
  (runValue = false, returnValue = false) =>
  (
    callback: (...args: any[]) => any,
    dependencies: Dependencies
  ): (() => any) | any => {
    if (
      !dependencies ||
      !lastDeps[hookIndex] ||
      !lastDeps[hookIndex].every(
        (dep, depIndex) => dep === dependencies[depIndex]
      )
    ) {
      callbacks[hookIndex] = {
        handler: runValue ? callback() : callback,
        dependencies,
        isEffect: runValue && !returnValue,
        mounted: runValue
      };
      lastDeps[hookIndex] = dependencies;
    }

    const _callback = callbacks[hookIndex].handler;
    hookIndex += 1;

    if (returnValue) {
      return _callback;
    }
  };
const unregister = (): void => {
  callbacks.forEach((callback) => {
    if (
      callback.isEffect &&
      callback.mounted &&
      typeof callback.handler === 'function'
    ) {
      callback.handler();
      callback.mounted = false;
    }
  });
  hookIndex = 0;
};

export { register, unregister };
