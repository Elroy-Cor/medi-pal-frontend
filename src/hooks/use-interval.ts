  // hooks/useInterval.ts
import { useEffect, useRef } from 'react';

type Callback = () => void;
type Delay = number | null;

export function useInterval(callback: Callback, delay: Delay) {
  const savedCallback = useRef<Callback>(null);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => {
        clearInterval(id);
      };
    }
  }, [delay]);
}