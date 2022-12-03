export type Dependencies = Array<string | number | boolean>;
declare const register: (runValue?: boolean, returnValue?: boolean) => (callback: (...args: any[]) => any, dependencies: Dependencies) => (() => any) | any;
declare const unregister: () => void;
export { register, unregister };
//# sourceMappingURL=manager.d.ts.map