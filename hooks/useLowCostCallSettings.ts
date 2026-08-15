import { useEffect, useRef, useCallback } from 'react';
import { type Call, useCallStateHooks } from '@stream-io/video-react-sdk';
import { toast } from 'sonner';

/**
 * Centralizes low-cost call quality settings AND adaptive network quality.
 * - Outgoing camera cap at 480p, VP8 at 600kbps
 * - Screen share capped at 720p, 10fps, 800kbps
 * - Monitors connection quality and auto-disables video on POOR network
 * - Prioritizes audio: video degrades first, audio is preserved
 */
export function useLowCostCallSettings(call: Call | undefined) {
  const appliedRef = useRef(false);
  const callIdRef = useRef<string | undefined>(undefined);
  const videoDisabledByNetworkRef = useRef(false);
  const lastQualityToastRef = useRef(0);

  // Apply base quality settings once per call
  useEffect(() => {
    if (!call) return;
    if (appliedRef.current && callIdRef.current === call.id) return;

    try {
      // Cap outgoing camera to 480p
      call.camera.selectTargetResolution({ width: 640, height: 480 });

      // Low bitrate VP8 publish options
      call.updatePublishOptions({
        preferredCodec: 'vp8',
        preferredBitrate: 600_000,
        screenShareSettings: {
          maxFramerate: 10,
          maxBitrate: 800_000,
          contentHint: 'detail',
        },
      });

      // Configure screen share manager
      call.screenShare.setSettings({
        maxFramerate: 10,
        maxBitrate: 800_000,
        contentHint: 'detail',
      });

      call.screenShare.setDefaultConstraints({
        video: {
          width: { max: 1280 },
          height: { max: 720 },
          frameRate: { ideal: 10, max: 15 },
        },
      });

      // Set preferred incoming video resolution to reduce bandwidth
      try {
        (call as any).setPreferredIncomingVideoResolution?.({ width: 640, height: 480 });
      } catch {
        // Not available in all SDK versions
      }

      appliedRef.current = true;
      callIdRef.current = call.id;

      if (process.env.NODE_ENV === 'development') {
        console.log('[useLowCostCallSettings] Applied quality settings for call:', call.id);
      }
    } catch (err) {
      console.error('[useLowCostCallSettings] Failed to apply settings:', err);
    }
  }, [call]);

  // Adaptive quality: monitor connection quality and degrade video on poor network
  useEffect(() => {
    if (!call) return;

    const checkConnectionQuality = () => {
      try {
        const stats = (call as any).state?.localParticipant?.connectionQuality;
        if (!stats) return;

        const isPoor = stats === 'poor' || stats === 1 || stats === 'POOR';
        const isGood = stats === 'good' || stats === 'excellent' || stats >= 3 || stats === 'GOOD' || stats === 'EXCELLENT';

        if (isPoor && !videoDisabledByNetworkRef.current) {
          // Poor network: disable outgoing video to prioritize audio
          videoDisabledByNetworkRef.current = true;
          call.camera.disable().catch(() => {});

          // Reduce incoming video resolution
          try {
            (call as any).setPreferredIncomingVideoResolution?.({ width: 320, height: 240 });
          } catch {}

          const now = Date.now();
          if (now - lastQualityToastRef.current > 15000) {
            toast.info('Poor network — video paused to prioritize audio', { duration: 5000 });
            lastQualityToastRef.current = now;
          }
        } else if (isGood && videoDisabledByNetworkRef.current) {
          // Network recovered: re-enable video
          videoDisabledByNetworkRef.current = false;
          call.camera.enable().catch(() => {});

          try {
            (call as any).setPreferredIncomingVideoResolution?.({ width: 640, height: 480 });
          } catch {}

          toast.success('Network improved — video restored', { duration: 3000 });
        }
      } catch {
        // ignore monitoring errors
      }
    };

    // Check every 5 seconds
    const interval = setInterval(checkConnectionQuality, 5000);
    return () => clearInterval(interval);
  }, [call]);
}
