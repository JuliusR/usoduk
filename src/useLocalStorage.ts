import React from "react";

export function useLocalStorage(
  key: string,
): [null | string, React.Dispatch<React.SetStateAction<null | string>>] {
  const [value, setValue] = React.useState(() => localStorage.getItem(key));

  React.useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.storageArea !== localStorage) return;
      if (e.key !== key) return;
      setValue(e.newValue);
    };
    window.addEventListener("storage", handleStorageEvent);
    setValue(localStorage.getItem(key));
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, [key, setValue]);

  const setLocalStorage = React.useCallback(
    (action: React.SetStateAction<null | string>) => {
      const prev = localStorage.getItem(key);
      const next = action instanceof Function ? action(prev) : action;
      if (next === prev) return;
      setValue(next);
      if (next === null) localStorage.removeItem(key);
      else localStorage.setItem(key, next);
    },
    [key, setValue],
  );

  return [value, setLocalStorage];
}
