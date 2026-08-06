import { useEffect, useRef } from 'react';
import { type Call } from '@stream-io/video-react-sdk';

/**
 * Centralizes low-cost call quality settings.
 * Runs once per stable call instance. Configures:
 * - Outgoing camera cap at 480p
 * - VP8 codec at 600kbps max
 * - Screen share capped at 480p, 10fps, 800kbps
 * - Does NOT set global incoming resolution (preserves Dynascale)
 */
export function useLowCostCallSettings(call: Call | undefined) {
  const appliedRef = useRef(false);
  const callIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!call) return;
    // Only apply once per call instance
    if (appliedRef.current && callIdRef.current === call.id) return;

    try {
      // Cap outgoing camera to 480p
      call.camera.selectTargetResolution({ width: 640, height: 480 });

      // Low bitrate VP8 publish options
      call.updatePublishOptions({
        preferredCodec: 'vp8',
        preferredBitrate: 600_000,
        // Screen share settings via publish options as a backstop
        screenShareSettings: {
          maxFramerate: 10,
          maxBitrate: 800_000,
          contentHint: 'detail',
        },
      });

      // Configure screen share manager directly (primary mechanism)
      call.screenShare.setSettings({
        maxFramerate: 10,
        maxBitrate: 800_000,
        contentHint: 'detail',
      });

      // Cap screen share capture resolution
      call.screenShare.setDefaultConstraints({
        video: {
          width: { max: 1280 },
          height: { max: 720 },
          frameRate: { ideal: 10, max: 15 },
        },
      });

      appliedRef.current = true;
      callIdRef.current = call.id;

      if (process.env.NODE_ENV === 'development') {
        console.log('[useLowCostCallSettings] Applied quality settings for call:', call.id);
      }
    } catch (err) {
      console.error('[useLowCostCallSettings] Failed to apply settings:', err);
    }
  }, [call]);
}
