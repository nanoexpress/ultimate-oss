import { Dependencies } from './manager';
export declare const useCallback: (callback: (...args: any[]) => any, dependencies: Dependencies) => any;
export declare const useEffect: (callback: (...args: any[]) => any, dependencies: Dependencies) => any;
export declare const useMemo: (callback: (...args: any[]) => any, dependencies: Dependencies) => any;
export declare const useState: <T>(initialValue: T) => [T, (value: T) => void];
export declare const useRef: <T>(ref: T | null | undefined, dependencies: Dependencies) => T;
//# sourceMappingURL=index.d.ts.map