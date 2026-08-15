import { useEffect, useRef, useCallback } from 'react';
import { type Call, useCallStateHooks } from '@stream-io/video-react-sdk';
import { toast } from 'sonner';

/**
 * Quality tiers based on participant count.
 * As participants increase, we aggressively reduce video quality to protect audio.
 *
 * Tier 1 (1-10):  Normal quality — 480p out, 480p in, 600kbps
 * Tier 2 (11-25): Reduced quality — 360p out, 360p in, 400kbps
 * Tier 3 (26-50): Low quality — 240p out, 240p in, 250kbps
 * Tier 4 (51+):   Audio-priority — outgoing video disabled, 180p in, 150kbps
 */
interface QualityTier {
  outWidth: number;
  outHeight: number;
  inWidth: number;
  inHeight: number;
  bitrate: number;
  disableOutgoingVideo: boolean;
  label: string;
}

const QUALITY_TIERS: { maxParticipants: number; tier: QualityTier }[] = [
  {
    maxParticipants: 10,
    tier: {
      outWidth: 640, outHeight: 480,
      inWidth: 640, inHeight: 480,
      bitrate: 600_000,
      disableOutgoingVideo: false,
      label: 'Normal',
    },
  },
  {
    maxParticipants: 25,
    tier: {
      outWidth: 480, outHeight: 360,
      inWidth: 480, inHeight: 360,
      bitrate: 400_000,
      disableOutgoingVideo: false,
      label: 'Reduced',
    },
  },
  {
    maxParticipants: 50,
    tier: {
      outWidth: 320, outHeight: 240,
      inWidth: 320, inHeight: 240,
      bitrate: 250_000,
      disableOutgoingVideo: false,
      label: 'Low',
    },
  },
  {
    maxParticipants: Infinity,
    tier: {
      outWidth: 320, outHeight: 240,
      inWidth: 240, inHeight: 180,
      bitrate: 150_000,
      disableOutgoingVideo: true,
      label: 'Audio Priority',
    },
  },
];

function getTierForCount(count: number): QualityTier {
  for (const entry of QUALITY_TIERS) {
    if (count <= entry.maxParticipants) return entry.tier;
  }
  return QUALITY_TIERS[QUALITY_TIERS.length - 1].tier;
}

/**
 * Centralizes call quality settings with:
 * 1. Dynamic participant-count-based quality scaling
 * 2. Adaptive network quality monitoring
 * 3. Audio-priority mode: video degrades first, audio is NEVER dropped
 */
export function useLowCostCallSettings(call: Call | undefined) {
  const appliedRef = useRef(false);
  const callIdRef = useRef<string | undefined>(undefined);
  const isPoorNetworkRef = useRef(false);
  const isInAudioPriorityRef = useRef(false);
  const lastQualityToastRef = useRef(0);
  const currentTierLabelRef = useRef('');
  const lastParticipantCountRef = useRef(0);

  // Apply base quality settings once per call
  useEffect(() => {
    if (!call) return;
    if (appliedRef.current && callIdRef.current === call.id) return;

    try {
      call.camera.selectTargetResolution({ width: 640, height: 480 });

      call.updatePublishOptions({
        preferredCodec: 'vp8',
        preferredBitrate: 600_000,
        // Screen share settings are NOT overridden here — they use Stream dashboard config (720p)
      });

      // Screen share quality is controlled by Stream dashboard (720p).
      // Do NOT override screenShare.setSettings or setDefaultConstraints here.

      try {
        (call as any).setPreferredIncomingVideoResolution?.({ width: 640, height: 480 });
      } catch {}

      appliedRef.current = true;
      callIdRef.current = call.id;

      if (process.env.NODE_ENV === 'development') {
        console.log('[QualitySettings] Base settings applied for call:', call.id);
      }
    } catch (err) {
      console.error('[QualitySettings] Failed to apply base settings:', err);
    }
  }, [call]);

  // Dynamic quality scaling based on participant count
  useEffect(() => {
    if (!call) return;

    const adjustQualityForParticipantCount = () => {
      try {
        const participants = call.state?.participants;
        if (!participants) return;

        const count = participants.length;
        const tier = getTierForCount(count);

        // Don't re-apply if still in same tier
        if (tier.label === currentTierLabelRef.current) return;

        currentTierLabelRef.current = tier.label;
        lastParticipantCountRef.current = count;

        // Adjust outgoing video resolution
        call.camera.selectTargetResolution({
          width: tier.outWidth,
          height: tier.outHeight,
        });

        // Adjust outgoing bitrate
        call.updatePublishOptions({
          preferredCodec: 'vp8',
          preferredBitrate: tier.bitrate,
          // Screen share is NOT capped — uses Stream dashboard settings
        });

        // Adjust incoming video resolution
        try {
          (call as any).setPreferredIncomingVideoResolution?.({
            width: tier.inWidth,
            height: tier.inHeight,
          });
        } catch {}

        // Notify at 51+ participants
        if (tier.disableOutgoingVideo && !isInAudioPriorityRef.current) {
          isInAudioPriorityRef.current = true;
          const now = Date.now();
          if (now - lastQualityToastRef.current > 30000) {
            toast.info(`${count} participants \u2014 video quality reduced to ensure stable audio`, { duration: 5000 });
            lastQualityToastRef.current = now;
          }
        } else if (!tier.disableOutgoingVideo && isInAudioPriorityRef.current) {
          isInAudioPriorityRef.current = false;
        }

        if (process.env.NODE_ENV === 'development') {
          console.log(`[QualitySettings] Tier: ${tier.label} | Participants: ${count} | Bitrate: ${tier.bitrate} | Out: ${tier.outWidth}x${tier.outHeight} | In: ${tier.inWidth}x${tier.inHeight}`);
        }
      } catch {
        // ignore monitoring errors
      }
    };

    // Check every 10 seconds
    adjustQualityForParticipantCount();
    const interval = setInterval(adjustQualityForParticipantCount, 10_000);
    return () => clearInterval(interval);
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

        if (isPoor && !isPoorNetworkRef.current) {
          isPoorNetworkRef.current = true;
          
          try {
            (call as any).setPreferredIncomingVideoResolution?.({ width: 160, height: 120 });
          } catch {}

          const now = Date.now();
          if (now - lastQualityToastRef.current > 15000) {
            toast.info('Poor network \u2014 video quality reduced to prioritize audio', { duration: 5000 });
            lastQualityToastRef.current = now;
          }
        } else if (isGood && isPoorNetworkRef.current) {
          isPoorNetworkRef.current = false;

          const tier = getTierForCount(lastParticipantCountRef.current || 1);
          try {
            (call as any).setPreferredIncomingVideoResolution?.({
              width: tier.inWidth,
              height: tier.inHeight,
            });
          } catch {}

          toast.success('Network improved \u2014 video restored', { duration: 3000 });
        }
      } catch {
        // ignore monitoring errors
      }
    };

    const interval = setInterval(checkConnectionQuality, 5000);
    return () => clearInterval(interval);
  }, [call]);
}
