"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

const MAX_EVENTS = 50;

interface DiagEvent {
  ts: number;
  type: string;
  detail?: string;
}

interface DiagSnapshot {
  cid: string | null;
  callType: string | null;
  sdkVersion: string;
  callingState: string;
  participantCount: number;
  remoteAudioPublisherCount: number;
  ownCapabilities: string[];
  events: DiagEvent[];
  capturedAt: number;
}

const sdkPackage = (() => {
  try {
    // Only the version we know from build time
    return '1.40.2'; // updated by Phase 0
  } catch {
    return 'unknown';
  }
})();

export function MeetingDiagnostics() {
  const isEnabled = process.env.NEXT_PUBLIC_STREAM_QA_DIAGNOSTICS === 'true';
  if (!isEnabled) return null;

  return <DiagnosticsPanel />;
}

function DiagnosticsPanel() {
  const call = useCall();
  const { useCallCallingState, useParticipants, useOwnCapabilities } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const ownCapabilities = useOwnCapabilities() || [];

  const [isOpen, setIsOpen] = useState(false);
  const eventLogRef = useRef<DiagEvent[]>([]);
  const [snapshot, setSnapshot] = useState<DiagSnapshot | null>(null);

  const addEvent = useCallback((type: string, detail?: string) => {
    eventLogRef.current = [
      ...eventLogRef.current.slice(-(MAX_EVENTS - 1)),
      { ts: Date.now(), type, detail },
    ];
  }, []);

  // Track calling state changes
  useEffect(() => {
    addEvent('callingState', callingState);
  }, [callingState, addEvent]);

  // Track participant changes
  useEffect(() => {
    addEvent('participants', `count=${participants.length}`);
  }, [participants.length, addEvent]);

  const buildSnapshot = useCallback((): DiagSnapshot => {
    const remoteAudioPublishers = participants.filter(
      (p) => !p.isLocalParticipant && !!p.audioStream
    );

    return {
      cid: call ? `${call.type}:${call.id}` : null,
      callType: call?.type || null,
      sdkVersion: sdkPackage,
      callingState: callingState,
      participantCount: participants.length,
      remoteAudioPublisherCount: remoteAudioPublishers.length,
      ownCapabilities,
      events: [...eventLogRef.current],
      capturedAt: Date.now(),
    };
  }, [call, callingState, participants, ownCapabilities]);

  const handleCapture = () => {
    setSnapshot(buildSnapshot());
  };

  const handleExport = () => {
    const data = buildSnapshot();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stream-diag-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '12px',
        zIndex: 9999,
        fontFamily: 'monospace',
        fontSize: '11px',
      }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        style={{
          background: '#1a1a2e',
          border: '1px solid #444',
          color: '#00ff88',
          padding: '4px 10px',
          borderRadius: '6px',
          cursor: 'pointer',
          float: 'right',
        }}
      >
        {isOpen ? '▼ Diag' : '▲ Diag'}
      </button>

      {isOpen && (
        <div
          style={{
            clear: 'both',
            marginTop: '4px',
            background: '#0d0d1a',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '10px',
            width: '340px',
            maxHeight: '60vh',
            overflowY: 'auto',
            color: '#ccc',
          }}
        >
          <div style={{ color: '#00ff88', marginBottom: '6px', fontWeight: 'bold' }}>
            Stream QA Diagnostics
          </div>

          <div><span style={{ color: '#888' }}>CID: </span>{call ? `${call.type}:${call.id}` : 'none'}</div>
          <div><span style={{ color: '#888' }}>SDK: </span>{sdkPackage}</div>
          <div><span style={{ color: '#888' }}>State: </span>{callingState}</div>
          <div><span style={{ color: '#888' }}>Participants: </span>{participants.length}</div>
          <div>
            <span style={{ color: '#888' }}>Remote audio publishers: </span>
            {participants.filter((p) => !p.isLocalParticipant && !!p.audioStream).length}
          </div>
          <div>
            <span style={{ color: '#888' }}>Capabilities: </span>
            {ownCapabilities.length > 0 ? ownCapabilities.join(', ') : 'none'}
          </div>

          <div style={{ marginTop: '8px', color: '#888', borderTop: '1px solid #333', paddingTop: '6px' }}>
            Recent Events ({Math.min(eventLogRef.current.length, MAX_EVENTS)}):
          </div>
          <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
            {eventLogRef.current.slice(-10).map((e, i) => (
              <div key={i} style={{ color: '#aaa' }}>
                {new Date(e.ts).toISOString().slice(11, 23)} [{e.type}] {e.detail || ''}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
            <button
              onClick={handleCapture}
              style={{
                background: '#1a3a2e',
                border: '1px solid #2a8a5e',
                color: '#00ff88',
                padding: '3px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Capture
            </button>
            <button
              onClick={handleExport}
              style={{
                background: '#1a1a3a',
                border: '1px solid #3a3a8a',
                color: '#88aaff',
                padding: '3px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Export JSON
            </button>
          </div>

          {snapshot && (
            <pre
              style={{
                marginTop: '6px',
                background: '#111',
                border: '1px solid #333',
                padding: '6px',
                borderRadius: '4px',
                fontSize: '10px',
                color: '#aaa',
                maxHeight: '120px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              {JSON.stringify(snapshot, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
