import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Check, 
  Play, 
  Building2,
  Plus
} from 'lucide-react';
import type { 
  SASLRegionalSign, 
  ProvinceType, 
  HandshapeType, 
  BodyLocationType, 
  MovementType 
} from '../../types';
import { 
  PROVINCES_LIST, 
  HANDSHAPES_LIST, 
  BODY_LOCATIONS_LIST, 
  MOVEMENT_TYPES_LIST,
  WESTERN_CAPE_PILOT_CLINICS
} from '../../data/communityData';
import { useTheme } from '../../theme/ThemeContext';

interface SubmitSignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newSign: SASLRegionalSign) => void;
}

export const SubmitSignModal: React.FC<SubmitSignModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { isDark } = useTheme();
  const [conceptName, setConceptName] = useState('');
  const [facility, setFacility] = useState(WESTERN_CAPE_PILOT_CLINICS[0].name);
  const [context, setContext] = useState<SASLRegionalSign['context']>('Everyday');
  const [description, setDescription] = useState('');
  const [handshape, setHandshape] = useState<HandshapeType>('Open Palm (5)');
  const [location, setLocation] = useState<BodyLocationType>('Chest / Torso');
  const [movement, setMovement] = useState<MovementType>('Up / Down');
  const [contributorName, setContributorName] = useState('');

  // Video recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [hasRecordedVideo, setHasRecordedVideo] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (!isOpen) return null;

  const handleStartRecord = () => {
    setIsRecording(true);
    setRecordSeconds(0);
    setHasRecordedVideo(false);

    let sec = 0;
    const interval = setInterval(() => {
      sec += 1;
      setRecordSeconds(sec);
      if (sec >= 8) {
        clearInterval(interval);
        setIsRecording(false);
        setHasRecordedVideo(true);
      }
    }, 1000);
    timerRef.current = interval;
  };

  const handleStopRecord = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setHasRecordedVideo(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conceptName.trim()) return;

    const newSign: SASLRegionalSign = {
      id: `sign-${Date.now()}`,
      conceptName: conceptName.trim().toUpperCase(),
      province: 'Western Cape',
      city: 'Cape Town',
      originFacility: facility,
      description: description.trim() || `Community SASL variation contributed for ${conceptName.trim()}.`,
      durationSeconds: recordSeconds || 6,
      handshape,
      location,
      movement,
      context,
      tags: [conceptName.trim(), 'Western Cape'],
      contributor: {
        name: contributorName.trim() || 'Anonymous Signer',
        province: 'Western Cape',
      },
      votes: {
        common: 1,
        olderGen: 0,
        slang: 0,
        total: 1,
        userVote: 'common',
      },
      createdAt: new Date().toISOString(),
    };

    onSubmit(newSign);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-lg rounded-2xl p-6 border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150 ${
          isDark ? 'bg-[#0e141f] border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-black uppercase">Add Regional Sign</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-black uppercase text-zinc-400 block mb-1">
              Concept Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. LOADSHEDDING, APPOINTMENT CARD"
              value={conceptName}
              onChange={(e) => setConceptName(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
              }`}
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase text-zinc-400 block mb-1">
              Healthcare Centre
            </label>
            <select
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
              }`}
            >
              {WESTERN_CAPE_PILOT_CLINICS.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Quick Camera Record */}
          <div>
            <label className="text-[11px] font-black uppercase text-zinc-400 block mb-1">
              Demonstration Video (5–10s)
            </label>
            <div className="aspect-video bg-black rounded-xl border border-zinc-800 flex flex-col items-center justify-center p-4 text-center space-y-2 relative">
              {isRecording ? (
                <div className="text-red-500 font-mono font-bold animate-pulse text-sm">
                  RECORDING: 00:0{recordSeconds}
                </div>
              ) : hasRecordedVideo ? (
                <div className="text-cyan-400 font-bold text-xs flex items-center gap-1">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Video Recorded</span>
                </div>
              ) : (
                <div className="text-zinc-500 text-xs font-bold uppercase">
                  Tap record to capture 5s sign
                </div>
              )}

              {isRecording ? (
                <button
                  type="button"
                  onClick={handleStopRecord}
                  className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold uppercase"
                >
                  Stop
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartRecord}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 text-black text-xs font-black uppercase"
                >
                  {hasRecordedVideo ? 'Retake Video' : 'Record'}
                </button>
              )}
            </div>
          </div>

          {/* Linguistic Selectors */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Handshape</label>
              <select
                value={handshape}
                onChange={(e) => setHandshape(e.target.value as HandshapeType)}
                className={`w-full p-2 rounded-lg border text-[11px] font-bold ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                }`}
              >
                {HANDSHAPES_LIST.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as BodyLocationType)}
                className={`w-full p-2 rounded-lg border text-[11px] font-bold ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                }`}
              >
                {BODY_LOCATIONS_LIST.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Movement</label>
              <select
                value={movement}
                onChange={(e) => setMovement(e.target.value as MovementType)}
                className={`w-full p-2 rounded-lg border text-[11px] font-bold ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                }`}
              >
                {MOVEMENT_TYPES_LIST.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Save Community Sign
          </button>
        </form>
      </div>
    </div>
  );
};
