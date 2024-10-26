import React from "react";
import { useLocalStorage } from "./useLocalStorage";

export function usePersistentReducer<T, A>(
  key: string,
  reducer: (prev: T, action: A) => T,
  init: T | (() => T),
) {
  const [originalInit] = React.useState(
    init instanceof Function ? init() : init,
  );

  const [json, setJson] = useLocalStorage(key);

  const state = React.useMemo(() => {
    return json !== null ? (JSON.parse(json) as T) : originalInit;
  }, [json, originalInit]);

  React.useEffect(() => {
    if (json === null) setJson(JSON.stringify(state));
  });

  const dispatch = React.useCallback(
    (action: A) => {
      setJson((prevJson) => {
        const prev = prevJson !== null ? JSON.parse(prevJson) : originalInit;
        const next = reducer(prev, action);
        return JSON.stringify(next);
      });
    },
    [setJson, originalInit, reducer],
  );

  return [state, dispatch] as const;
}
