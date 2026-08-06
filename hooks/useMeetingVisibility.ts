import { useEffect, useState, useCallback } from 'react';
import { CallingState, useCallStateHooks } from '@stream-io/video-react-sdk';

interface MeetingVisibility {
  isReconnecting: boolean;
  isOffline: boolean;
  isMigrating: boolean;
  callingState: CallingState;
}

/**
 * Manages meeting visibility, network state, and reconnection status.
 * Does NOT: reload, recreate client, rejoin, or toggle devices.
 * Does: track visibility, network, and connection state for UI display.
 */
export function useMeetingVisibility(): MeetingVisibility {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Set initial state
    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isReconnecting = callingState === CallingState.RECONNECTING ||
    callingState === CallingState.RECONNECTING_FAILED;
  const isMigrating = callingState === CallingState.MIGRATING;

  return {
    isReconnecting,
    isOffline,
    isMigrating,
    callingState,
  };
}
