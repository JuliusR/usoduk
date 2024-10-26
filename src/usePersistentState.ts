import React from "react";

export function usePersistentState<T>(key: string, init: T | (() => T)) {
  const [initialKey] = React.useState(key);

  if (key !== initialKey) {
    throw Error(`illegal key change: ${initialKey} to ${key}`);
  }

  const [state, setState] = React.useState<T>(() => {
    const value = localStorage.getItem(key);
    if (value !== null) return JSON.parse(value) as T;
    return init instanceof Function ? init() : init;
  });

  React.useEffect(
    () => localStorage.setItem(initialKey, JSON.stringify(state)),
    [initialKey, state],
  );

  return [state, setState] as const;
}
