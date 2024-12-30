import { useState, useEffect } from 'react';

export const useRestTimer = (onComplete: () => void) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(seconds => {
          if (seconds <= 1) {
            setIsActive(false);
            onComplete();
            return 0;
          }
          return seconds - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, seconds, onComplete]);

  const start = (duration = 60) => {
    setSeconds(duration);
    setIsActive(true);
  };

  const stop = () => {
    setIsActive(false);
    setSeconds(0);
    onComplete();
  };

  return { seconds, start, stop };
};
