"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SetValueAction<T> = T | ((previousValue: T) => T);

export interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
}

export interface UseLocalStorageResult<T> {
  value: T;
  setValue: (value: SetValueAction<T>) => void;
  removeValue: () => void;
  isHydrated: boolean;
}

function defaultSerializer<T>(value: T): string {
  return JSON.stringify(value);
}

function defaultDeserializer<T>(value: string): T {
  return JSON.parse(value) as T;
}

function readStoredValue<T>(
  key: string,
  initialValue: T,
  deserializer: (value: string) => T
): T {
  if (typeof window === "undefined") {
    return initialValue;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return initialValue;
    }

    return deserializer(raw);
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return initialValue;
  }
}

function writeStoredValue<T>(
  key: string,
  value: T,
  serializer: (value: T) => string
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, serializer(value));
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
  }
}

function removeStoredValue(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageResult<T> {
  const serializer = options.serializer ?? defaultSerializer;
  const deserializer = options.deserializer ?? defaultDeserializer;

  const initialValueRef = useRef(initialValue);
  const serializerRef = useRef(serializer);
  const deserializerRef = useRef(deserializer);

  const [value, setValueState] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedValue = readStoredValue(
      key,
      initialValueRef.current,
      deserializerRef.current
    );
    setValueState(storedValue);
    setIsHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    writeStoredValue(key, value, serializerRef.current);
  }, [key, value, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key) {
        return;
      }

      if (event.newValue === null) {
        setValueState(initialValueRef.current);
        return;
      }

      try {
        setValueState(deserializerRef.current(event.newValue));
      } catch (error) {
        console.error(`Error syncing localStorage key "${key}":`, error);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key, isHydrated]);

  const setValue = useCallback((nextValue: SetValueAction<T>) => {
    setValueState((previousValue) =>
      typeof nextValue === "function"
        ? (nextValue as (value: T) => T)(previousValue)
        : nextValue
    );
  }, []);

  const removeValue = useCallback(() => {
    removeStoredValue(key);
    setValueState(initialValueRef.current);
  }, [key]);

  return {
    value,
    setValue,
    removeValue,
    isHydrated,
  };
}
