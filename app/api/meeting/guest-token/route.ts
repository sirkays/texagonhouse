import { NextRequest, NextResponse } from 'next/server';
import { StreamClient } from '@stream-io/node-sdk';

const streamApiKey =
  process.env.STREAM_API_KEY ||
  process.env.NEXT_PUBLIC_STREAM_API_KEY ||
  "r8t2kf97vxcy";
const streamSecretKey =
  process.env.STREAM_SECRET_KEY ||
  process.env.STREAM_API_SECRET ||
  "jykcrvb4huxh3ydazsg3dvznv9tsm8nanmcazk556fy2tkzs9agdk9gchann57mk";

// Simple in-memory rate limit (per guest ID, max 10 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(guestId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(guestId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(guestId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count++;
  return true;
}

// Clean up stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 5 * 60_000); // Every 5 minutes

/**
 * POST /api/meeting/guest-token
 * Issues a fresh Stream token for a guest user.
 * Validates that the meeting exists and is public.
 */
export async function POST(request: NextRequest) {
  try {
    if (!streamApiKey || !streamSecretKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const body = await request.json();
    const { guestId, meetingId } = body;

    // Validate required fields
    if (!guestId || typeof guestId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid guestId' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (!meetingId || typeof meetingId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid meetingId' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Validate guestId format
    if (!guestId.startsWith('guest-') || guestId.length < 7 || guestId.length > 50) {
      return NextResponse.json(
        { error: 'Invalid guest identity' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Rate limit check
    if (!checkRateLimit(guestId)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const client = new StreamClient(streamApiKey, streamSecretKey);

    // Verify meeting exists, is public, room is open, and NOT ended
    let isPublicMeeting = false;
    let isRoomOpen = true;
    let isCallEnded = false;
    for (const callType of ['default', 'livestream'] as const) {
      try {
        const call = client.video.call(callType, meetingId);
        const response = await call.get();

        // Check if the call has been ended by the host
        if (response.call?.ended_at) {
          isCallEnded = true;
          break;
        }

        const custom = response.call?.custom || {};
        if (custom.is_public === true || custom.is_public === 'true') {
          isPublicMeeting = true;
          if (custom.is_room_open === false || custom.is_room_open === 'false') {
            isRoomOpen = false;
          }
          break;
        }
      } catch {
        continue;
      }
    }

    if (isCallEnded) {
      return NextResponse.json(
        { error: 'This meeting has been ended by the host.' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (!isPublicMeeting) {
      return NextResponse.json(
        { error: 'Meeting not found or not public' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (!isRoomOpen) {
      return NextResponse.json(
        { error: 'Room access has been closed by the host.' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Generate 1-hour token
    const token = client.generateUserToken({
      user_id: guestId,
      validity_in_seconds: 60 * 60,
    });

    return NextResponse.json(
      { token },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[guest-token] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
