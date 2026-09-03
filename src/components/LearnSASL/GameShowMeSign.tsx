import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Play, 
  Square, 
  CheckCircle2, 
  ArrowRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getHandLandmarker, drawHandSkeleton, classifySASLHandshape, createAnonymizedTrainingSample } from '../../utils/recognition';
import type { POPIAConsentState } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

interface GameShowMeSignProps {
  onScoreUpdate: (points: number) => void;
  onBackToMenu: () => void;
  popiaConsent: POPIAConsentState;
}

const TARGET_SIGNS = [
  {
    word: 'Monday',
    instruction: 'Touch your thumb to your index fingertip (letter M pinch).',
    expectedLabel: 'Monday',
  },
  {
    word: 'Tuesday',
    instruction: 'Touch your thumb to your middle fingertip (letter T shape).',
    expectedLabel: 'Tuesday',
  },
  {
    word: 'Wednesday',
    instruction: 'Touch your thumb to your ring fingertip (letter W shape).',
    expectedLabel: 'Wednesday',
  },
  {
    word: 'Thursday',
    instruction: 'Place your thumb between your ring and pinky fingers.',
    expectedLabel: 'Thursday',
  },
];

export const GameShowMeSign: React.FC<GameShowMeSignProps> = ({
  onScoreUpdate,
  onBackToMenu,
  popiaConsent,
}) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [detectedSign, setDetectedSign] = useState<string | null>(null);
  const [evaluationStatus, setEvaluationStatus] = useState<'idle' | 'evaluating' | 'success' | 'retry'>('idle');
  const [score, setScore] = useState(0);
  const [, setCameraError] = useState<string | null>(null);

  const currentTarget = TARGET_SIGNS[currentIndex] || TARGET_SIGNS[0];
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const matchCountRef = useRef(0);

  isRunningRef.current = isRunning;

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
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setIsRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

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
          const landmarks = results.landmarks[0];
          if (ctx) {
            drawHandSkeleton(ctx, landmarks, canvas.width, canvas.height);
          }

          const classification = classifySASLHandshape(landmarks);
          if (classification) {
            setDetectedSign(classification.label);

            if (classification.label.toLowerCase() === currentTarget.expectedLabel.toLowerCase()) {
              matchCountRef.current += 1;

              // Sustained matching sign
              if (matchCountRef.current >= 4) {
                setEvaluationStatus('success');
                setScore((s) => s + 15);
                onScoreUpdate(15);

                try {
                  confetti({
                    particleCount: 60,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#0d9488', '#10b981', '#06b6d4', '#f59e0b'],
                  });
                } catch {
                  // ignore
                }

                // Controlled model improvement pipeline
                if (popiaConsent.allowModelImprovement) {
                  createAnonymizedTrainingSample(
                    currentTarget.word,
                    classification.label,
                    true,
                    landmarks.length,
                    true
                  );
                }
              }
            } else {
              matchCountRef.current = 0;
              setEvaluationStatus('evaluating');
            }
          }
        } else {
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      } catch (err) {
        console.error('Show me sign frame error:', err);
      }
    }

    if (isRunningRef.current) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [currentTarget, onScoreUpdate, popiaConsent.allowModelImprovement]);

  const startCamera = async () => {
    setCameraError(null);
    setIsLoadingModel(true);
    matchCountRef.current = 0;
    setEvaluationStatus('evaluating');

    try {
      await getHandLandmarker();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsRunning(true);
      setIsLoadingModel(false);
      animationFrameRef.current = requestAnimationFrame(processFrame);
    } catch {
      setIsLoadingModel(false);
      setIsRunning(false);
      setCameraError('Camera access denied or unavailable.');
    }
  };

  const handleNextTarget = () => {
    matchCountRef.current = 0;
    setDetectedSign(null);
    setEvaluationStatus(isRunning ? 'evaluating' : 'idle');
    if (currentIndex < TARGET_SIGNS.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-lg shadow-xs">
            2
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 font-sans">
              {t.learnSasl.game2Title}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Sign #{currentIndex + 1} of {TARGET_SIGNS.length} &bull; {t.common.score}: <span className="text-teal-600 font-bold">{score} pts</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToMenu}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          {t.learnSasl.backToHubBtn}
        </button>
      </div>

      {/* Target Word Display */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono uppercase tracking-wider text-teal-700 font-extrabold bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200">
          {t.learnSasl.showMeTargetPrompt}
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-sans tracking-tight">
          {currentTarget.word.toUpperCase()}
        </h2>
        <p className="text-sm text-slate-600 font-medium max-w-md mx-auto">
          💡 {currentTarget.instruction}
        </p>
      </div>

      {/* Camera Stage & Evaluation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7">
          <div className="relative aspect-4/3 bg-slate-950 rounded-3xl overflow-hidden shadow-inner border border-slate-800">
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

            {!isRunning && !isLoadingModel && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 text-white gap-3">
                <Camera className="w-12 h-12 text-teal-400" />
                <p className="text-sm font-bold">{t.learnSasl.cameraInstruction}</p>
              </div>
            )}

            {isLoadingModel && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-white gap-2">
                <Loader2 className="w-9 h-9 text-teal-400 animate-spin" />
                <p className="text-xs font-bold">{t.liveSign.loadingModel}</p>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            {!isRunning ? (
              <button
                type="button"
                onClick={startCamera}
                className="w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{t.liveSign.startCameraBtn}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="w-full py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-base flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Square className="w-5 h-5" />
                <span>{t.liveSign.stopCameraBtn}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right / Real-Time Evaluation Box */}
        <div className="md:col-span-5 bg-slate-50 p-6 sm:p-7 rounded-3xl border-2 border-slate-200 flex flex-col justify-between min-h-[280px]">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
              Real-Time Feedback
            </span>

            <div className="mt-4">
              {evaluationStatus === 'success' ? (
                <div className="space-y-3 text-emerald-700 animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h4 className="text-2xl font-extrabold">✓ {t.learnSasl.signMatchedSuccess}</h4>
                  <p className="text-xs sm:text-sm text-emerald-800 font-medium leading-relaxed">
                    Perfect SASL handshape detected for {currentTarget.word}!
                  </p>
                </div>
              ) : evaluationStatus === 'evaluating' ? (
                <div className="space-y-3">
                  <div className="w-3 h-3 rounded-full bg-sky-500 animate-ping mb-2" />
                  <h4 className="text-lg font-extrabold text-slate-900">{t.learnSasl.evaluatingSign}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {detectedSign ? `Current sign detected: ${detectedSign}` : 'Hold your hand steadily in front of the lens.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 text-slate-400 italic text-sm">
                  <p>Start camera and sign &ldquo;{currentTarget.word}&rdquo; clearly.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={handleNextTarget}
              className="w-full py-4 px-5 rounded-2xl bg-slate-900 hover:bg-teal-600 text-white font-extrabold text-sm inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <span>{currentIndex < TARGET_SIGNS.length - 1 ? t.learnSasl.nextQuestionBtn : t.learnSasl.playAgainBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
