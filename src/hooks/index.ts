import { Dependencies, register } from './manager';

export const useCallback = register(false, true);

export const useEffect = register(true);
export const useMemo = register(true, true);
export const useState = <T>(initialValue: T): [T, (value: T) => void] => {
  let value = useMemo(() => initialValue, []) as T;

  const setValue = (newValue: T): void => {
    value = newValue;
  };

  return [value, setValue];
};
export const useRef = <T>(
  ref: T | null = null,
  dependencies: Dependencies
): T => useMemo(() => ({ current: ref }), dependencies);
