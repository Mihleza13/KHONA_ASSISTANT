import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Mic, 
  MicOff, 
  RotateCcw, 
  Check, 
  Send, 
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Minus,
  CheckCircle2,
  User,
  MessageSquare,
  Stethoscope,
  X,
  Sparkles,
  Volume2,
  VolumeX,
  Languages
} from 'lucide-react';
import type { 
  ConsultationMessage, 
  SpeechLanguage, 
  TranslationState,
  POPIAConsentState
} from '../types';
import { 
  getHandLandmarker, 
  drawHandSkeleton, 
  classifySASLHandshape,
  createAnonymizedTrainingSample 
} from '../utils/recognition';
import { useTranslation } from '../i18n/LanguageContext';

interface ConsultationScreenProps {
  popiaConsent: POPIAConsentState;
  ttsEnabled: boolean;
  onToggleTTS: () => void;
  onEndSessionComplete: () => void;
}

interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

const QUICK_NURSE_PHRASES = [
  "Hello, how can I help you today?",
  "Where does it hurt?",
  "Please take a seat.",
  "The doctor will examine you now.",
  "Take this medicine twice a day.",
  "Are you feeling any better?",
];

export const ConsultationScreen: React.FC<ConsultationScreenProps> = ({
  popiaConsent,
  ttsEnabled,
  onToggleTTS,
  onEndSessionComplete,
}) => {
  const { t, language, formatHealthcarePhrase } = useTranslation();

  // Consultation state
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [patientTextSize, setPatientTextSize] = useState<number>(32); // px

  // Patient Camera & SASL Recognition
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showMesh, setShowMesh] = useState(true);

  const [patientTranslationState, setPatientTranslationState] = useState<TranslationState>('ready');
  const [patientCurrentSign, setPatientCurrentSign] = useState<string | null>(null);
  const [patientActiveSentence, setPatientActiveSentence] = useState<string>('');
  const [patientConfidence, setPatientConfidence] = useState<number>(0);

  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isCameraActiveRef = useRef(false);
  const consecutiveRef = useRef<{ label: string; count: number }>({ label: '', count: 0 });
  const lastDetectedRef = useRef<string | null>(null);
  const noHandFramesRef = useRef<number>(0);

  isCameraActiveRef.current = isCameraActive;

  // Healthcare Worker Speech State
  const [speechLanguage, setSpeechLanguage] = useState<SpeechLanguage>('auto');
  const [isListening, setIsListening] = useState(false);
  const [speechInterim, setSpeechInterim] = useState<string>('');
  const [speechFinal, setSpeechFinal] = useState<string>('');
  const [manualInputText, setManualInputText] = useState<string>('');
  const [speechError, setSpeechError] = useState<string | null>(null);

  const speechRecognitionRef = useRef<any>(null);

  const getRecognitionLangCode = useCallback((lang: SpeechLanguage): string => {
    switch (lang) {
      case 'en-ZA':
        return 'en-ZA';
      case 'xh-ZA':
        return 'xh-ZA';
      case 'zu-ZA':
        return 'zu-ZA';
      case 'af-ZA':
        return 'af-ZA';
      case 'auto':
      default:
        if (language === 'xh') return 'xh-ZA';
        if (language === 'zu') return 'zu-ZA';
        if (language === 'af') return 'af-ZA';
        return 'en-ZA';
    }
  }, [language]);

  // Sync formatted phrase when detected sign updates
  useEffect(() => {
    if (patientCurrentSign) {
      setPatientActiveSentence(formatHealthcarePhrase(patientCurrentSign));
    }
  }, [formatHealthcarePhrase, patientCurrentSign]);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setIsCameraActive(false);
    setPatientTranslationState('ready');
    setPatientCurrentSign(null);
    setPatientActiveSentence('');
  }, []);

  // Frame processing loop
  const processVideoFrame = useCallback(async () => {
    if (!isCameraActiveRef.current) return;

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

          if (ctx && showMesh) {
            drawHandSkeleton(ctx, landmarks, canvas.width, canvas.height);
          } else if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }

          const classification = classifySASLHandshape(landmarks);

          if (classification) {
            setPatientConfidence(classification.conf);

            if (consecutiveRef.current.label === classification.label) {
              consecutiveRef.current.count += 1;
            } else {
              consecutiveRef.current = { label: classification.label, count: 1 };
            }

            if (consecutiveRef.current.count >= 4) {
              setPatientTranslationState('found');
              setPatientCurrentSign(classification.label);
              setPatientActiveSentence(formatHealthcarePhrase(classification.label));

              if (lastDetectedRef.current !== classification.label) {
                lastDetectedRef.current = classification.label;

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
              setPatientTranslationState('detecting');
            }
          } else {
            setPatientTranslationState('detecting');
          }
        } else {
          noHandFramesRef.current += 1;
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (noHandFramesRef.current > 35 && patientTranslationState !== 'confirmed' && patientTranslationState !== 'found') {
            setPatientTranslationState('ready');
            setPatientCurrentSign(null);
          }
        }
      } catch (err) {
        console.error('Hand tracking error:', err);
      }
    }

    if (isCameraActiveRef.current) {
      animFrameRef.current = requestAnimationFrame(processVideoFrame);
    }
  }, [showMesh, patientTranslationState, popiaConsent.allowModelImprovement, formatHealthcarePhrase]);

  const startCamera = async () => {
    setCameraError(null);
    setIsLoadingCamera(true);

    try {
      await getHandLandmarker();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
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

      setIsCameraActive(true);
      setIsLoadingCamera(false);
      setPatientTranslationState('ready');
      animFrameRef.current = requestAnimationFrame(processVideoFrame);
    } catch (err: unknown) {
      setIsLoadingCamera(false);
      setIsCameraActive(false);
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setCameraError('Camera access was blocked. Please enable camera permissions in your settings.');
      } else {
        setCameraError('Unable to start camera.');
      }
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      stopListening();
    };
  }, []);

  // Confirm and record patient sign
  const handleConfirmPatientMessage = () => {
    if (!patientActiveSentence) return;

    const newMsg: ConsultationMessage = {
      id: `msg-p-${Date.now()}`,
      sender: 'patient',
      text: patientActiveSentence,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'sasl',
      confidence: patientConfidence,
      signLabel: patientCurrentSign || undefined,
      urgent: patientActiveSentence.toLowerCase().includes('pain') || 
              patientActiveSentence.toLowerCase().includes('emergency') ||
              patientActiveSentence.toLowerCase().includes('intlungu') ||
              patientActiveSentence.toLowerCase().includes('izinhlungu'),
    };

    setMessages((prev) => [...prev, newMsg]);
    setPatientTranslationState('confirmed');

    if (ttsEnabled && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(patientActiveSentence);
      window.speechSynthesis.speak(utter);
    }

    setTimeout(() => {
      setPatientTranslationState('ready');
      setPatientCurrentSign(null);
      setPatientActiveSentence('');
      consecutiveRef.current = { label: '', count: 0 };
      lastDetectedRef.current = null;
    }, 1200);
  };

  const handlePatientSignAgain = () => {
    setPatientTranslationState('ready');
    setPatientCurrentSign(null);
    setPatientActiveSentence('');
    consecutiveRef.current = { label: '', count: 0 };
    lastDetectedRef.current = null;
  };

  // Speech Recognition
  const startListening = () => {
    setSpeechError(null);
    const win = window as unknown as IWindow;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setSpeechError('Speech recognition is not supported in this browser. Please type below.');
      return;
    }

    try {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.abort();
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = getRecognitionLangCode(speechLanguage);

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechInterim('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setSpeechFinal((prev) => (prev ? `${prev} ${final}` : final).trim());
        }
        setSpeechInterim(interim);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission blocked.');
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Speech error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      setSpeechError('Could not start microphone.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
      speechRecognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSendNurseSpeech = () => {
    const textToSend = (speechFinal || speechInterim).trim();
    if (!textToSend) return;

    const newMsg: ConsultationMessage = {
      id: `msg-n-${Date.now()}`,
      sender: 'healthcare',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'speech',
    };

    setMessages((prev) => [...prev, newMsg]);
    setSpeechFinal('');
    setSpeechInterim('');
  };

  const handleSendQuickPhrase = (phrase: string) => {
    const newMsg: ConsultationMessage = {
      id: `msg-n-${Date.now()}`,
      sender: 'healthcare',
      text: phrase,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'manual',
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleSendManualMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = manualInputText.trim();
    if (!textToSend) return;

    const newMsg: ConsultationMessage = {
      id: `msg-n-${Date.now()}`,
      sender: 'healthcare',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'manual',
    };

    setMessages((prev) => [...prev, newMsg]);
    setManualInputText('');
  };

  // Complete end of consultation session
  const handleConfirmEndSession = () => {
    stopCamera();
    stopListening();
    setMessages([]);
    setSpeechFinal('');
    setSpeechInterim('');
    setManualInputText('');
    setPatientCurrentSign(null);
    setPatientActiveSentence('');
    setShowEndSessionModal(false);
    onEndSessionComplete();
  };

  // Latest healthcare message displayed to patient
  const latestHealthcareMessage = [...messages]
    .reverse()
    .find((m) => m.sender === 'healthcare')?.text || speechFinal || speechInterim || '';

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 flex flex-col space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Toolbar (Minimal Chrome) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 text-cyan-600 flex items-center justify-center font-bold shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight">
              Two-Way Communication
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${isCameraActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                <Camera className="w-3.5 h-3.5" />
                <span>{isCameraActive ? 'Camera Active' : 'Camera Off'}</span>
              </span>
              <span className="text-slate-300">&bull;</span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${isListening ? 'text-emerald-600' : 'text-slate-400'}`}>
                <Mic className="w-3.5 h-3.5" />
                <span>{isListening ? 'Microphone Active' : 'Microphone Idle'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Text Size Scale Controls (A- / A+) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              id="btn-font-smaller"
              type="button"
              onClick={() => setPatientTextSize((s) => Math.max(22, s - 4))}
              className="px-2.5 py-1 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-white font-extrabold text-sm transition-colors cursor-pointer"
              title="Smaller Text"
            >
              A−
            </button>
            <button
              id="btn-font-larger"
              type="button"
              onClick={() => setPatientTextSize((s) => Math.min(48, s + 4))}
              className="px-2.5 py-1 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-white font-extrabold text-sm transition-colors cursor-pointer"
              title="Larger Text"
            >
              A+
            </button>
          </div>

          {/* Simple END Button */}
          <button
            id="btn-end-consultation"
            type="button"
            onClick={() => setShowEndSessionModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-extrabold shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>END</span>
          </button>
        </div>
      </div>

      {/* 2. Main Two-Way Communication Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT: PATIENT SIGNING HERO CAMERA (7 cols) ================= */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Patient Signing
              </span>
            </div>

            {/* Skeleton mesh toggle */}
            {isCameraActive && (
              <button
                type="button"
                onClick={() => setShowMesh((p) => !p)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {showMesh ? <Eye className="w-3.5 h-3.5 text-sky-600" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showMesh ? 'Mesh on' : 'Mesh off'}</span>
              </button>
            )}
          </div>

          {/* Video / Skeleton Canvas with clear framing */}
          <div className="relative aspect-4/3 sm:aspect-16/10 bg-slate-950 rounded-3xl overflow-hidden shadow-lg border-2 border-slate-800">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none scale-x-[-1]"
            />

            {/* Subtle framing guide */}
            <div className="absolute inset-4 rounded-2xl border border-white/10 pointer-events-none" />

            {/* Friendly Signing Indicator */}
            {isCameraActive && (
              <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md text-white text-xs font-extrabold px-4 py-2 rounded-full border border-slate-700 flex items-center gap-2 shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
                <span>SIGN NOW</span>
              </div>
            )}

            {/* Idle Overlay */}
            {!isCameraActive && !isLoadingCamera && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 text-white gap-3">
                <Camera className="w-12 h-12 text-sky-400" />
                <p className="text-sm font-semibold">Camera is stopped</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-bold text-sm shadow-md cursor-pointer active:scale-95"
                >
                  Start Camera
                </button>
              </div>
            )}

            {/* Loading Vision Model */}
            {isLoadingCamera && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-white gap-2 z-10">
                <Loader2 className="w-9 h-9 text-sky-400 animate-spin" />
                <p className="text-xs font-semibold">Loading SASL Vision...</p>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* IMMEDIATE TRANSLATION OUTPUT BOX */}
          <div className="bg-slate-50/90 rounded-3xl p-5 border-2 border-slate-200/90 space-y-3 shadow-xs">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold block">
              I UNDERSTOOD:
            </span>

            <div className="min-h-[56px] flex items-center">
              {patientActiveSentence ? (
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight font-sans">
                    &ldquo;{patientActiveSentence}&rdquo;
                  </p>
                  {patientCurrentSign && (
                    <span className="inline-block font-mono text-xs text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full font-semibold">
                      Sign: {patientCurrentSign}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">
                  {isCameraActive ? 'Sign naturally in front of the lens...' : 'Start camera to sign'}
                </p>
              )}
            </div>

            {/* ONLY TWO LARGE TOUCH BUTTONS: [ YES ] [ AGAIN ] */}
            {patientActiveSentence && (
              <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-3">
                <button
                  id="btn-confirm-yes"
                  type="button"
                  onClick={handleConfirmPatientMessage}
                  className="py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>YES</span>
                </button>

                <button
                  id="btn-confirm-again"
                  type="button"
                  onClick={handlePatientSignAgain}
                  className="py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>AGAIN</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT: HEALTHCARE WORKER READING & SPEECH CANVAS (5 cols) ================= */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 text-cyan-600 flex items-center justify-center font-bold shadow-xs">
                <Stethoscope className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Healthcare Worker
              </h3>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
              <Languages className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={speechLanguage}
                onChange={(e) => setSpeechLanguage(e.target.value as SpeechLanguage)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="auto">Auto Detect</option>
                <option value="en-ZA">English</option>
                <option value="xh-ZA">isiXhosa</option>
                <option value="zu-ZA">isiZulu</option>
                <option value="af-ZA">Afrikaans</option>
              </select>
            </div>
          </div>

          {/* LARGE PATIENT READING DISPLAY (High contrast) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 min-h-[160px] flex flex-col justify-center shadow-sm border border-slate-200">
            <span className="text-xs font-medium text-cyan-600 mb-2 block">
              Patient reads here
            </span>

            {latestHealthcareMessage ? (
              <p 
                style={{ fontSize: `${patientTextSize}px`, lineHeight: 1.3 }}
                className="font-semibold text-slate-900 font-sans tracking-tight"
              >
                &ldquo;{latestHealthcareMessage}&rdquo;
              </p>
            ) : (
              <p className="text-base text-slate-400">
                {isListening ? 'Listening to speech...' : 'Press microphone or tap a phrase below.'}
              </p>
            )}
          </div>

          {/* SPEECH MICROPHONE CONTROL */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleListening}
                className={`flex-1 py-4 px-5 rounded-full font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-md'
                    : 'khona-btn-primary !w-auto flex-1'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    <span>Stop Speaking</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    <span>Tap to Speak</span>
                  </>
                )}
              </button>

              {(speechFinal || speechInterim) && (
                <button
                  type="button"
                  onClick={handleSendNurseSpeech}
                  className="py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              )}
            </div>

            {speechError && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                {speechError}
              </div>
            )}
          </div>

          {/* Quick Tap Phrases */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold block">
              Quick Clinic Phrases
            </span>

            <div className="flex flex-wrap gap-1.5 max-h-[130px] overflow-y-auto pr-1">
              {QUICK_NURSE_PHRASES.map((phrase) => (
                <button
                  key={phrase}
                  type="button"
                  onClick={() => handleSendQuickPhrase(phrase)}
                  className="khona-chip-in px-3 py-2 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-300 border border-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer text-left"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Keyboard Typing */}
          <form onSubmit={handleSendManualMessage} className="pt-1 flex items-center gap-2">
            <input
              type="text"
              value={manualInputText}
              onChange={(e) => setManualInputText(e.target.value)}
              placeholder="Or type a message here..."
              className="khona-input-pill flex-1 !bg-slate-50 !border-slate-300 focus:!bg-white"
            />
            <button
              type="submit"
              disabled={!manualInputText.trim()}
              className="px-4 py-3 rounded-full bg-white hover:bg-zinc-50 disabled:opacity-40 border-2 border-cyan-500 text-zinc-900 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* 3. Fluid Conversation Flow (Natural Storytelling, No Bubble Clutter) */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">
            Conversation Flow ({messages.length})
          </span>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => setMessages([])}
              className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Flow</span>
            </button>
          )}
        </div>

        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <div className="text-center py-4 text-slate-400 text-xs sm:text-sm italic">
              Conversation flow will appear here as you talk.
            </div>
          ) : (
            messages.map((msg, index) => {
              const isPatient = msg.sender === 'patient';
              const isLatest = index === messages.length - 1;
              return (
                <div
                  key={msg.id}
                  className={`p-4 rounded-3xl transition-all ${
                    isLatest 
                      ? isPatient 
                        ? 'bg-sky-50 border-2 border-sky-300 text-slate-900 mr-4' 
                        : 'bg-teal-50 border-2 border-teal-300 text-slate-900 ml-4'
                      : isPatient
                        ? 'bg-slate-50/80 border border-slate-200/80 text-slate-700 mr-8 opacity-85'
                        : 'bg-slate-50/80 border border-slate-200/80 text-slate-700 ml-8 opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-mono uppercase font-extrabold ${
                      isPatient ? 'text-sky-800' : 'text-teal-800'
                    }`}>
                      {isPatient ? 'Patient (Sign)' : 'Healthcare Worker (Speech)'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {msg.timestamp}
                    </span>
                  </div>

                  <p className={`font-bold leading-snug ${isLatest ? 'text-lg sm:text-xl text-slate-900' : 'text-base text-slate-700'}`}>
                    &ldquo;{msg.text}&rdquo;
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. End Session Confirmation Modal */}
      {showEndSessionModal && (
        <div className="khona-backdrop-in fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4">
          <div className="khona-pop-in bg-white rounded-t-[28px] sm:rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-slate-200 space-y-5">
            <div className="khona-sheet-handle sm:hidden -mt-2 mb-1" />
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">
                End Conversation?
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                All messages and video camera feeds will be securely stopped and cleared from device memory.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleConfirmEndSession}
                className="flex-1 py-4 px-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                End & Clear
              </button>

              <button
                type="button"
                onClick={() => setShowEndSessionModal(false)}
                className="flex-1 py-4 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
