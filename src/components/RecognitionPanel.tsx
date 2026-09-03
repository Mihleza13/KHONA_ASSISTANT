import React from 'react';
import { Trash2, Copy, Check, Info, Sparkles, Clock } from 'lucide-react';
import type { RecognitionResult, TranscriptEntry } from '../types';

interface RecognitionPanelProps {
  currentResult: RecognitionResult | null;
  transcript: TranscriptEntry[];
  onClearTranscript: () => void;
}

export const RecognitionPanel: React.FC<RecognitionPanelProps> = ({
  currentResult,
  transcript,
  onClearTranscript,
}) => {
  const [copied, setCopied] = React.useState(false);

  const confidencePct = currentResult ? Math.round(currentResult.conf * 100) : 0;

  const handleCopyTranscript = () => {
    if (transcript.length === 0) return;
    const text = transcript
      .map((t) => `[${t.timestamp}] ${t.label} (${Math.round(t.confidence * 100)}%)`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-[#DCD7C9] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Top: Recognized Sign */}
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#6B7570] font-semibold mb-2">
            Recognized sign
          </p>

          <div
            id="word-display"
            className={`min-h-[46px] flex items-center transition-colors duration-150 ${
              currentResult
                ? 'font-display font-medium text-3xl sm:text-4xl text-[#063D37]'
                : 'font-sans text-base text-[#6B7570] italic'
            }`}
          >
            {currentResult ? currentResult.label : 'Waiting for a sign…'}
          </div>

          {/* Confidence Meter */}
          <div className="confidence-row flex items-center gap-3 my-3">
            <div className="flex-1 h-2 bg-[#DCD7C9]/60 rounded-full overflow-hidden">
              <div
                id="confidence-fill"
                className="h-full bg-[#D9A441] rounded-full transition-all duration-150 ease-out"
                style={{ width: `${confidencePct}%` }}
              />
            </div>
            <span
              id="confidence-label"
              className="font-mono text-xs text-[#6B7570] min-w-[36px] text-right font-medium"
            >
              {currentResult ? `${confidencePct}%` : '—'}
            </span>
          </div>
        </div>

        {/* Middle: Transcript */}
        <div className="mt-4 pt-3 border-t border-[#DCD7C9]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#6B7570] font-semibold">
              Transcript
            </p>
            {transcript.length > 0 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCopyTranscript}
                  className="p-1 text-[#6B7570] hover:text-[#0B5D52] rounded hover:bg-[#F7F5F0] transition-colors"
                  title="Copy transcript"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#0B5D52]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={onClearTranscript}
                  className="p-1 text-[#6B7570] hover:text-[#B5502F] rounded hover:bg-[#F7F5F0] transition-colors"
                  title="Clear transcript"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div
            id="transcript"
            className="border border-[#DCD7C9]/40 bg-[#F7F5F0]/60 rounded-xl p-3 max-h-[170px] overflow-y-auto flex flex-col gap-2 min-h-[90px]"
          >
            {transcript.length === 0 ? (
              <div className="transcript-empty text-xs text-[#6B7570] italic m-auto py-2 text-center">
                Recognized signs will appear here as they happen.
              </div>
            ) : (
              transcript.map((item) => (
                <div
                  key={item.id}
                  className="transcript-item flex items-center justify-between gap-3 text-xs py-1 border-b border-[#DCD7C9]/40 last:border-0"
                >
                  <span className="font-medium text-[#182420]">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#0B5D52] bg-[#0B5D52]/10 px-1.5 py-0.5 rounded">
                      {Math.round(item.confidence * 100)}%
                    </span>
                    <span className="font-mono text-[11px] text-[#6B7570] whitespace-nowrap">
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Vocabulary Matrix */}
        <div className="vocab mt-4 pt-3 border-t border-[#DCD7C9]">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#6B7570] font-semibold mb-2">
            Vocabulary
          </p>

          <div className="space-y-1.5 text-xs">
            <div className="vocab-row flex items-center justify-between py-1.5 border-b border-[#DCD7C9]/50">
              <span className="text-[#182420] font-medium">Monday – Thursday</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#0B5D52]/10 text-[#063D37] font-medium">
                live now
              </span>
            </div>

            <div className="vocab-row flex items-center justify-between py-1.5 border-b border-[#DCD7C9]/50">
              <span className="text-[#6B7570]">Friday, Saturday, Sunday</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#B5502F]/10 text-[#B5502F] font-medium">
                model pending
              </span>
            </div>

            <div className="vocab-row flex items-center justify-between py-1.5">
              <span className="text-[#6B7570]">6 clinic FAQ signs</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#B5502F]/10 text-[#B5502F] font-medium">
                model pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Note Callout */}
      <div className="note mt-5 text-xs text-[#6B7570] bg-[#D9A441]/10 border border-[#D9A441]/35 rounded-xl p-3.5">
        <strong className="text-[#182420] font-medium">What's running right now:</strong>{' '}
        the four static handshapes (Monday–Thursday) recognize directly in this browser tab, no server involved. The motion-based signs use a model trained separately in Python — bringing those into this web version needs one more conversion step before they'll respond here.
      </div>
    </div>
  );
};
