import { useCallback, useRef } from 'react';
import { type Call } from '@stream-io/video-react-sdk';

interface MediaPreferences {
  micEnabled: boolean;
  camEnabled: boolean;
}

const STORAGE_PREFIX = 'techxagon_media_';

function getStorageKey(meetingId: string): string {
  return `${STORAGE_PREFIX}${meetingId}`;
}

/**
 * Privacy-safe media preference persistence.
 * Layers on top of Stream's built-in device persistence.
 * Missing or corrupt state defaults to { micEnabled: false, camEnabled: false }.
 */
export function useMediaPreferences(meetingId: string) {
  const hasApplied = useRef(false);

  const getPreferences = useCallback((): MediaPreferences => {
    try {
      const stored = sessionStorage.getItem(getStorageKey(meetingId));
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          typeof parsed.micEnabled === 'boolean' &&
          typeof parsed.camEnabled === 'boolean'
        ) {
          return parsed as MediaPreferences;
        }
      }
    } catch {
      // Corrupt or unavailable — fall through to default
    }
    return { micEnabled: false, camEnabled: false };
  }, [meetingId]);

  const setPreferences = useCallback(
    (prefs: MediaPreferences) => {
      try {
        sessionStorage.setItem(getStorageKey(meetingId), JSON.stringify(prefs));
      } catch {
        // non-fatal: sessionStorage may be unavailable
      }
    },
    [meetingId],
  );

  const persistCurrentState = useCallback(
    (micEnabled: boolean, camEnabled: boolean) => {
      setPreferences({ micEnabled, camEnabled });
    },
    [setPreferences],
  );

  /**
   * Apply stored preferences to a call ONCE.
   * Must be called after call.join() has completed.
   * Does not create feedback loops.
   */
  const applyToCall = useCallback(
    async (call: Call) => {
      if (hasApplied.current) return;
      hasApplied.current = true;

      const prefs = getPreferences();

      try {
        if (prefs.micEnabled) {
          await call.microphone.enable();
        } else {
          await call.microphone.disable();
        }

        if (prefs.camEnabled) {
          await call.camera.enable();
        } else {
          await call.camera.disable();
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[useMediaPreferences] Failed to apply preferences:', err);
        }
      }
    },
    [getPreferences],
  );

  /** Reset the applied flag (e.g., when meeting changes) */
  const resetApplied = useCallback(() => {
    hasApplied.current = false;
  }, []);

  return {
    getPreferences,
    setPreferences,
    persistCurrentState,
    applyToCall,
    resetApplied,
    hasApplied,
  };
}
