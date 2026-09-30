import { useEffect, useState } from 'react';

export function useServerCountdown(expiresAt?: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    setNow(Date.now());
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => {
      window.clearInterval(timer);
    };
  }, [expiresAt]);

  if (!expiresAt) {
    return 0;
  }

  return Math.max(0, Math.ceil((expiresAt - now) / 1000));
}
