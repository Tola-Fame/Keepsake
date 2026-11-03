"use client";

import { useCallback, useRef, useState } from "react";

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

/**
 * Undo/redo state. Changes made with the same `key` within 800 ms are merged
 * into one undo step (e.g. dragging a slider).
 */
export function useHistory<T>(initial: T) {
  const [state, setState] = useState<HistoryState<T>>({ past: [], present: initial, future: [] });
  const last = useRef<{ key: string; t: number } | null>(null);

  const set = useCallback((updater: (prev: T) => T, key?: string) => {
    const now = Date.now();
    const coalesce = !!key && last.current?.key === key && now - last.current.t < 800;
    last.current = key ? { key, t: now } : null;
    setState((s) => {
      const next = updater(s.present);
      if (next === s.present) return s;
      return { past: coalesce ? s.past : [...s.past.slice(-100), s.present], present: next, future: [] };
    });
  }, []);

  const undo = useCallback(() => {
    last.current = null;
    setState((s) => (s.past.length ? { past: s.past.slice(0, -1), present: s.past[s.past.length - 1], future: [s.present, ...s.future] } : s));
  }, []);

  const redo = useCallback(() => {
    last.current = null;
    setState((s) => (s.future.length ? { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) } : s));
  }, []);

  return { value: state.present, set, undo, redo, canUndo: state.past.length > 0, canRedo: state.future.length > 0 };
}
