'use client';

import { useMemo, useState } from 'react';
import { TerminalCursor } from '@/components/shared/TerminalCursor';
import { ClassRecording } from '@/lib/types';
import { formatSessionDate } from '@/lib/utils';

interface ClassRecordingsPanelProps {
  recordings: ClassRecording[];
}

export function ClassRecordingsPanel({ recordings }: ClassRecordingsPanelProps) {
  const [selectedRecordingId, setSelectedRecordingId] = useState(recordings[0]?.id ?? '');

  const selectedRecording = useMemo(() => {
    return recordings.find((recording) => recording.id === selectedRecordingId) ?? recordings[0];
  }, [recordings, selectedRecordingId]);

  if (!selectedRecording) {
    return (
      <div className="rounded border border-border-dim bg-bg-surface p-6">
        <p className="font-display text-[11px] uppercase tracking-[0.14em] text-alert-orange">
          {'// NO RECORDINGS AVAILABLE YET'}
        </p>
        <p className="mt-2 text-sm text-text-secondary">Recordings will appear here after live classes are completed.</p>
      </div>
    );
  }

  return (
    <div className="rounded border border-border-dim bg-bg-surface p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
        <div className="rounded border border-border-dim bg-bg-surface-2 p-3">
          <p className="font-display text-[11px] uppercase tracking-[0.14em] text-neon-cyan">
            {'// CLASS LIBRARY'}
          </p>

          <div className="mt-3 space-y-2">
            {recordings.map((recording) => {
              const isSelected = recording.id === selectedRecording.id;

              return (
                <button
                  key={recording.id}
                  type="button"
                  onClick={() => setSelectedRecordingId(recording.id)}
                  className={`w-full rounded border px-3 py-2 text-left transition-colors ${
                    isSelected
                      ? 'border-neon-cyan bg-[rgba(0,229,255,0.08)]'
                      : 'border-border-dim bg-bg-surface hover:border-border-bright'
                  }`}
                >
                  <p className="font-display text-[10px] uppercase tracking-[0.12em] text-text-secondary">
                    {formatSessionDate(recording.recordedAt)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">{recording.title}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded border border-border-dim bg-bg-surface-2 p-3 sm:p-4">
          <p className="font-display text-[10px] uppercase tracking-[0.13em] text-neon-green">
            Recording
          </p>
          <h3 className="mt-2 text-[18px] font-semibold text-text-primary">{selectedRecording.title}</h3>
          <p className="mt-1 font-display text-[11px] uppercase tracking-[0.1em] text-text-secondary">
            {formatSessionDate(selectedRecording.recordedAt)} · {selectedRecording.durationLabel}
          </p>

          <div className="mt-4 overflow-hidden rounded border border-border-dim bg-black">
            <video
              key={selectedRecording.id}
              controls
              preload="metadata"
              playsInline
              className="aspect-video h-auto w-full"
            >
              <source src={selectedRecording.videoUrl} type="video/mp4" />
              Your browser does not support HTML5 video playback.
            </video>
          </div>

          <p className="mt-3 flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.12em] text-neon-cyan">
            stream mode active <TerminalCursor className="h-[11px] w-[5px] bg-neon-cyan" />
          </p>
          <p className="mt-2 text-sm text-text-secondary">{selectedRecording.description}</p>
        </div>
      </div>
    </div>
  );
}
