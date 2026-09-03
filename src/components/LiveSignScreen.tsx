import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Play, 
  Square, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  RotateCcw, 
  Send, 
  AlertCircle,
  Loader2,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import type { 
  TranscriptEntry, 
  TranslationState,
  StaffCommunication,
  POPIAConsentState
} from '../types';
import { 
  getHandLandmarker, 
  drawHandSkeleton, 
  classifySASLHandshape,
  createAnonymizedTrainingSample 
} from '../utils/recognition';
import { useTranslation } from '../i18n/LanguageContext';

interface LiveSignScreenProps {
  onSendToStaff: (comm: StaffCommunication) => void;
  popiaConsent: POPIAConsentState;
  onOpenPrivacy: () => void;
}

export const LiveSignScreen: React.FC<LiveSignScreenProps> = ({
  onSendToStaff,
  popiaConsent,
  onOpenPrivacy,
}) => {
  const { t, formatHealthcarePhrase } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Translation State
  const [translationState, setTranslationState] = useState<TranslationState>('ready');
  const [currentSign, setCurrentSign] = useState<string | null>(null);
  const [candidateSign, setCandidateSign] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [activeSentence, setActiveSentence] = useState<string>('');
  const [confirmedMessage, setConfirmedMessage] = useState<string | null>(null);
  const [isSentToStaff, setIsSentToStaff] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [copied, setCopied] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const consecutiveRef = useRef<{ label: string; count: number }>({ label: '', count: 0 });
  const lastDetectedRef = useRef<string | null>(null);
  const noHandFramesRef = useRef<number>(0);

  isRunningRef.current = isRunning;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Update activeSentence whenever language changes and currentSign exists
  useEffect(() => {
    if (currentSign) {
      setActiveSentence(formatHealthcarePhrase(currentSign));
    }
  }, [formatHealthcarePhrase, currentSign]);

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    setIsRunning(false);
    setTranslationState('ready');
    setCurrentSign(null);
    setCandidateSign(null);
  }, []);

  const processFrame = useCallback(async () => {
    if (!isRunningRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState >= 2) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }

      const ctx = canvas.getContext('2d');
      try {
        const landmarker = await getHandLandmarker();
        const now = performance.now();
        const results = landmarker.detectForVideo(video, now);

        if (results.landmarks && results.landmarks.length > 0) {
          noHandFramesRef.current = 0;
          const landmarks = results.landmarks[0];

          if (ctx && showSkeleton) {
            drawHandSkeleton(ctx, landmarks, canvas.width, canvas.height);
          } else if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }

          const classification = classifySASLHandshape(landmarks);

          if (classification) {
            setConfidence(classification.conf);
            setCandidateSign(classification.label);

            if (consecutiveRef.current.label === classification.label) {
              consecutiveRef.current.count += 1;
            } else {
              consecutiveRef.current = { label: classification.label, count: 1 };
            }

            // Stabilize detection after 4 consecutive frames
            if (consecutiveRef.current.count >= 4) {
              setTranslationState('found');
              setCurrentSign(classification.label);
              setActiveSentence(formatHealthcarePhrase(classification.label));

              if (lastDetectedRef.current !== classification.label) {
                lastDetectedRef.current = classification.label;

                const timeString = new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                const newEntry: TranscriptEntry = {
                  id: `${Date.now()}-${Math.random()}`,
                  label: classification.label,
                  timestamp: timeString,
                  confidence: classification.conf,
                };

                setTranscript((prev) => [newEntry, ...prev.slice(0, 29)]);

                // POPIA-compliant model improvement hook
                if (popiaConsent.allowModelImprovement) {
                  createAnonymizedTrainingSample(
                    classification.label,
                    classification.label,
                    true,
                    landmarks.length,
                    true
                  );
                }
              }
            } else {
              setTranslationState('detecting');
            }
          } else {
            // Hand in frame but unclassified
            setTranslationState('detecting');
            setCandidateSign(null);
          }
        } else {
          // No hand in view
          noHandFramesRef.current += 1;
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (noHandFramesRef.current > 30 && translationState !== 'confirmed' && translationState !== 'found') {
            setTranslationState('ready');
            setCurrentSign(null);
            setCandidateSign(null);
          }
        }
      } catch (err) {
        console.error('Landmark tracking error:', err);
      }
    }

    if (isRunningRef.current) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [showSkeleton, translationState, popiaConsent.allowModelImprovement, formatHealthcarePhrase]);

  const startCamera = async () => {
    setCameraError(null);
    setIsLoadingModel(true);

    try {
      await getHandLandmarker();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsRunning(true);
      setIsLoadingModel(false);
      setTranslationState('ready');
      animationFrameRef.current = requestAnimationFrame(processFrame);
    } catch (err: unknown) {
      setIsLoadingModel(false);
      setIsRunning(false);
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setCameraError('Camera access was blocked. Please grant camera permission on your device.');
      } else {
        setCameraError('Unable to start camera. Please verify device video input.');
      }
    }
  };

  const toggleCameraFacing = async () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    if (isRunning) {
      stopCamera();
      setTimeout(() => {
        startCamera();
      }, 200);
    }
  };

  const handleConfirmTranslation = () => {
    if (!activeSentence) return;
    setTranslationState('confirmed');
    setConfirmedMessage(activeSentence);

    // Dispatch to staff communication desk
    const comm: StaffCommunication = {
      id: `comm-${Date.now()}`,
      patientMessage: activeSentence,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      urgent: activeSentence.toLowerCase().includes('emergency') || activeSentence.toLowerCase().includes('pain') || activeSentence.toLowerCase().includes('intlungu') || activeSentence.toLowerCase().includes('izinhlungu') || activeSentence.toLowerCase().includes('noodgeval'),
    };
    onSendToStaff(comm);
    setIsSentToStaff(true);
  };

  const handleSignAgain = () => {
    setTranslationState('ready');
    setCurrentSign(null);
    setCandidateSign(null);
    setActiveSentence('');
    setConfirmedMessage(null);
    setIsSentToStaff(false);
    consecutiveRef.current = { label: '', count: 0 };
    lastDetectedRef.current = null;
  };

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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner / State Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
            {t.liveSign.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.liveSign.subtitle}
          </p>
        </div>

        {/* Visual State Pill */}
        <div className="flex items-center gap-2">
          {translationState === 'ready' && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>{t.liveSign.stateReady}</span>
            </div>
          )}

          {translationState === 'detecting' && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 border border-sky-300 text-sky-800 font-semibold text-xs sm:text-sm animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
              <span>{t.liveSign.stateDetecting}</span>
            </div>
          )}

          {translationState === 'found' && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50 border border-teal-300 text-teal-800 font-semibold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>{t.liveSign.stateFound}</span>
            </div>
          )}

          {translationState === 'unclear' && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 font-semibold text-xs sm:text-sm">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>{t.liveSign.stateUnclear}</span>
            </div>
          )}

          {translationState === 'confirmed' && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t.liveSign.stateConfirmed}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Kiosk Signing Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: Large Unobstructed Camera View */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-4 sm:p-6 border-2 border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="relative aspect-16/9 bg-slate-950 rounded-2xl overflow-hidden shadow-inner border border-slate-800">
            {/* Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
            />

            {/* Skeleton Canvas Overlay */}
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full object-contain pointer-events-none ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
            />

            {/* Inactive State Screen */}
            {!isRunning && !isLoadingModel && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 text-white gap-4">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/40">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{t.liveSign.cameraReady}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-sm mt-1">
                    {t.liveSign.cameraReadyDesc}
                  </p>
                </div>
              </div>
            )}

            {/* Loading MediaPipe Vision */}
            {isLoadingModel && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-white gap-3 z-10">
                <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
                <p className="text-sm font-semibold">{t.liveSign.loadingModel}</p>
                <p className="text-xs text-slate-400 font-mono">{t.liveSign.localInferenceNote}</p>
              </div>
            )}

            {/* Active Status Badge (top corner, away from hands) */}
            {isRunning && (
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white font-mono text-[11px] px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-700 z-10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t.liveSign.liveFeedBadge}</span>
              </div>
            )}
          </div>

          {/* Camera Error Message */}
          {cameraError && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Primary Camera Action Controls (Large Touch Targets) */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              {!isRunning ? (
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={isLoadingModel}
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>{t.liveSign.startCameraBtn}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-base shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Square className="w-5 h-5" />
                  <span>{t.liveSign.stopCameraBtn}</span>
                </button>
              )}
            </div>

            {/* Utility Toggles */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSkeleton((prev) => !prev)}
                className={`px-4 py-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  showSkeleton
                    ? 'bg-sky-50 border-sky-300 text-sky-800'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
                title={showSkeleton ? t.liveSign.meshOff : t.liveSign.meshOn}
              >
                {showSkeleton ? <Eye className="w-4 h-4 text-sky-600" /> : <EyeOff className="w-4 h-4" />}
                <span>{showSkeleton ? t.liveSign.meshOn : t.liveSign.meshOff}</span>
              </button>

              <button
                type="button"
                onClick={toggleCameraFacing}
                className="p-3.5 rounded-2xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title={t.liveSign.switchCamera}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Large Translated Sentence & Visual Confirmation */}
        <div className="lg:col-span-4 space-y-6">
          {/* Section 6: Large Translated Sentence & Visual Confirmation */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
                {t.liveSign.translationHeading}
              </span>

              {/* Large Translated Sentence */}
              <div className="mt-2 min-h-[90px] flex items-center">
                {activeSentence ? (
                  <div className="space-y-1">
                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans leading-tight">
                      &ldquo;{activeSentence}&rdquo;
                    </p>
                    {currentSign && (
                      <span className="inline-block font-mono text-xs text-sky-700 bg-sky-100 px-2 py-0.5 rounded font-medium">
                        {t.liveSign.recognizedBadge}: {currentSign}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-lg text-slate-400 italic">
                    {isRunning
                      ? t.liveSign.placeholderActive
                      : t.liveSign.placeholderIdle}
                  </p>
                )}
              </div>

              {/* Visual Confirmation Card */}
              {activeSentence && (
                <div className="mt-6 pt-5 border-t border-slate-200">
                  <p className="text-sm font-bold text-slate-900 mb-3">
                    {t.liveSign.isCorrectQuestion}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleConfirmTranslation}
                      className={`py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                        translationState === 'confirmed'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                      <span>{t.common.yes}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSignAgain}
                      className="py-3.5 px-4 rounded-2xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{t.liveSign.signAgainBtn}</span>
                    </button>
                  </div>

                  {isSentToStaff && (
                    <div className="mt-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2 font-medium">
                      <Send className="w-4 h-4 text-teal-600" />
                      <span>{t.liveSign.transmittedToStaff}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Helper for Signer */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <p className="leading-relaxed">
                💡 <strong>{t.liveSign.signingTipTitle}:</strong> {t.liveSign.signingTipBody}
              </p>
            </div>
          </div>

          {/* Session Transcript Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
                {t.liveSign.transcriptHeading}
              </span>

              {transcript.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyTranscript}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    title={t.liveSign.copyTranscript}
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTranscript([])}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title={t.liveSign.clearTranscript}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 max-h-[160px] overflow-y-auto space-y-2 border border-slate-200 min-h-[90px]">
              {transcript.length === 0 ? (
                <div className="text-xs text-slate-400 italic text-center py-5">
                  {t.liveSign.transcriptEmpty}
                </div>
              ) : (
                transcript.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-0"
                  >
                    <span className="font-semibold text-slate-800">{item.label}</span>
                    <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

