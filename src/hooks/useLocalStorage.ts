import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_EVENT = 'appdata:storage-change';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const keyRef = useRef(key);
  keyRef.current = key;

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const nextValue = value instanceof Function ? value(prev) : value;
      try {
        window.localStorage.setItem(keyRef.current, JSON.stringify(nextValue));
        window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key: keyRef.current } }));
      } catch {
        // ignore quota errors
      }
      return nextValue;
    });
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.key === keyRef.current) return; // skip own changes
      try {
        const item = window.localStorage.getItem(keyRef.current);
        if (item) {
          setStoredValue(JSON.parse(item) as T);
        }
      } catch {
        // ignore parse errors
      }
    };
    const storageHandler = (e: StorageEvent) => {
      if (e.key !== keyRef.current) return;
      try {
        if (e.newValue) {
          setStoredValue(JSON.parse(e.newValue) as T);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener(STORAGE_EVENT, handler);
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener(STORAGE_EVENT, handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  return [storedValue, setValue];
}
