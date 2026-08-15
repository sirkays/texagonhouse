import { useEffect, useState, useRef, useCallback } from 'react';
import { CallingState, useCallStateHooks, useCall } from '@stream-io/video-react-sdk';
import { toast } from 'sonner';

interface MeetingVisibility {
  isReconnecting: boolean;
  isOffline: boolean;
  isMigrating: boolean;
  callingState: CallingState;
}

/**
 * Manages meeting visibility, network state, reconnection, and background/foreground handling.
 * - Tracks online/offline status
 * - Detects when the browser tab goes to background (phone screen lock, app switch)
 * - Auto-rejoins the call when returning to foreground if disconnected
 * - Uses Wake Lock API to try to prevent OS from killing the connection
 */
export function useMeetingVisibility(): MeetingVisibility {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const call = useCall();
  const [isOffline, setIsOffline] = useState(false);
  const wakeLockRef = useRef<any>(null);
  const wasJoinedRef = useRef(false);
  const rejoinAttemptRef = useRef(false);

  // Track if we were joined (so we know to rejoin on foreground)
  useEffect(() => {
    if (callingState === CallingState.JOINED) {
      wasJoinedRef.current = true;
      rejoinAttemptRef.current = false;
    } else if (callingState === CallingState.LEFT || callingState === CallingState.IDLE) {
      // Only clear wasJoined if user explicitly left (not background disconnect)
    }
  }, [callingState]);

  // Online/Offline tracking
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // When coming back online, attempt rejoin if we were previously joined
      if (wasJoinedRef.current && call && !rejoinAttemptRef.current) {
        const state = call.state?.callingState;
        if (state !== CallingState.JOINED && state !== CallingState.JOINING && state !== CallingState.RECONNECTING) {
          rejoinAttemptRef.current = true;
          toast.info('Reconnecting to meeting…', { duration: 3000 });
          call.join().then(() => {
            rejoinAttemptRef.current = false;
            toast.success('Reconnected to meeting', { duration: 2000 });
          }).catch((err) => {
            rejoinAttemptRef.current = false;
            console.error('[MeetingVisibility] Rejoin on online failed:', err);
          });
        }
      }
    };
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [call]);

  // Visibility change: detect background/foreground
  useEffect(() => {
    if (!call) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // Returned to foreground — check if we need to rejoin
        // Wait a brief moment for network to re-establish
        await new Promise((r) => setTimeout(r, 1000));

        const state = call.state?.callingState;
        if (
          wasJoinedRef.current &&
          !rejoinAttemptRef.current &&
          state !== CallingState.JOINED &&
          state !== CallingState.JOINING &&
          state !== CallingState.RECONNECTING
        ) {
          rejoinAttemptRef.current = true;
          toast.info('Reconnecting to meeting…', { duration: 3000 });
          try {
            await call.join();
            rejoinAttemptRef.current = false;
            toast.success('Reconnected to meeting', { duration: 2000 });
          } catch (err) {
            rejoinAttemptRef.current = false;
            console.error('[MeetingVisibility] Rejoin on foreground failed:', err);
            // Retry once more after 3 seconds
            setTimeout(async () => {
              try {
                const retryState = call.state?.callingState;
                if (retryState !== CallingState.JOINED && retryState !== CallingState.JOINING) {
                  await call.join();
                  toast.success('Reconnected to meeting', { duration: 2000 });
                }
              } catch (retryErr) {
                toast.error('Could not reconnect. Please rejoin the meeting.', { duration: 5000 });
              }
            }, 3000);
          }
        }

        // Re-acquire wake lock on foreground return
        requestWakeLock();
      } else {
        // Going to background — wake lock may be released by OS
        // Nothing to do here; reconnect will happen on return
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [call]);

  // Wake Lock API: prevent screen from sleeping
  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      // Release any existing lock first
      if (wakeLockRef.current) {
        await wakeLockRef.current.release().catch(() => {});
      }
      wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      if (process.env.NODE_ENV === 'development') {
        console.log('[MeetingVisibility] Wake Lock acquired');
      }
    } catch (err) {
      // Wake Lock request failed (e.g., tab is in background)
      if (process.env.NODE_ENV === 'development') {
        console.log('[MeetingVisibility] Wake Lock request failed:', err);
      }
    }
  }, []);

  // Request wake lock when joined
  useEffect(() => {
    if (callingState === CallingState.JOINED) {
      requestWakeLock();
    }
    return () => {
      // Release wake lock on unmount
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [callingState, requestWakeLock]);

  // Listen for wake lock release (happens when OS suspends tab)
  useEffect(() => {
    const handleWakeLockRelease = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[MeetingVisibility] Wake Lock was released');
      }
    };

    if (wakeLockRef.current) {
      wakeLockRef.current.addEventListener('release', handleWakeLockRelease);
    }
  }, [callingState]);

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
