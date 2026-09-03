import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Upload, 
  Trash2, 
  Check, 
  RotateCcw, 
  Play, 
  Pause, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Send,
  Loader2,
  AlertCircle,
  FileVideo
} from 'lucide-react';
import { getHandLandmarker, drawHandSkeleton, classifySASLHandshape } from '../utils/recognition';
import type { StaffCommunication } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface VideoUploadScreenProps {
  onSendToStaff: (comm: StaffCommunication) => void;
  onClearStaffAlert?: () => void;
}

export const VideoUploadScreen: React.FC<VideoUploadScreenProps> = ({
  onSendToStaff,
}) => {
  const { t, formatHealthcarePhrase } = useTranslation();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [translatedSentence, setTranslatedSentence] = useState<string | null>(null);
  const [translatedWord, setTranslatedWord] = useState<string | null>(null);
  const [, setIsConfirmed] = useState(false);
  const [isSentToStaff, setIsSentToStaff] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  const showSkeletonRef = useRef(showSkeleton);
  showSkeletonRef.current = showSkeleton;

  // Cleanup video object URL
  const cleanupVideo = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setSelectedFile(null);
    setTranslatedSentence(null);
    setTranslatedWord(null);
    setIsConfirmed(false);
    setIsSentToStaff(false);
    setErrorMessage(null);
    isRunningRef.current = false;

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [videoUrl]);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [videoUrl]);

  // Update translated sentence if language changes
  useEffect(() => {
    if (translatedWord) {
      setTranslatedSentence(formatHealthcarePhrase(translatedWord));
    }
  }, [formatHealthcarePhrase, translatedWord]);

  // Video frame classification loop
  const analyzeVideoFrame = useCallback(async () => {
    if (!isRunningRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && !video.paused && !video.ended && video.readyState >= 2) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
      }

      const ctx = canvas.getContext('2d');
      try {
        const landmarker = await getHandLandmarker();
        const now = performance.now();
        const results = landmarker.detectForVideo(video, now);

        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];

          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (showSkeletonRef.current) {
              drawHandSkeleton(ctx, landmarks, canvas.width, canvas.height);
            }
          }

          const classification = classifySASLHandshape(landmarks);
          if (classification) {
            setTranslatedWord(classification.label);
            setTranslatedSentence(formatHealthcarePhrase(classification.label));
          }
        } else {
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      } catch (err) {
        console.error('Frame recognition error:', err);
      }
    }

    if (isRunningRef.current) {
      animationFrameRef.current = requestAnimationFrame(analyzeVideoFrame);
    }
  }, [formatHealthcarePhrase]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    cleanupVideo();
    setErrorMessage(null);
    setSelectedFile(file);
    setIsProcessing(true);

    try {
      await getHandLandmarker();
      const url = URL.createObjectURL(file);
      setVideoUrl(url);

      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.loop = true;
        videoRef.current.muted = true;
        await videoRef.current.play();
        setIsPlaying(true);
      }

      isRunningRef.current = true;
      setIsProcessing(false);
      animationFrameRef.current = requestAnimationFrame(analyzeVideoFrame);
    } catch {
      setIsProcessing(false);
      setErrorMessage(t.common.error);
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      isRunningRef.current = true;
      animationFrameRef.current = requestAnimationFrame(analyzeVideoFrame);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      isRunningRef.current = false;
    }
  };

  const handleAcceptTranslation = () => {
    if (!translatedSentence) return;
    setIsConfirmed(true);

    // Send to clinic staff desk
    const comm: StaffCommunication = {
      id: `comm-upload-${Date.now()}`,
      patientMessage: translatedSentence,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      urgent: false,
    };
    onSendToStaff(comm);
    setIsSentToStaff(true);
  };

  const handleTryAgain = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
    setIsConfirmed(false);
    setIsSentToStaff(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Title Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
            {t.videoUpload.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.videoUpload.subtitle}
          </p>
        </div>

        {/* Zero Retention Security Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t.videoUpload.localPrivacyBadge}</span>
        </div>
      </div>

      {/* Main Flow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Video Stage */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm flex flex-col justify-between">
          {!videoUrl ? (
            /* Upload Zone */
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 border-3 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50 hover:bg-teal-50/20 rounded-2xl transition-all text-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
                {t.videoUpload.dropzoneTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6">
                {t.videoUpload.dropzoneSubtitle}
              </p>

              <label
                htmlFor="video-file-input"
                className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-teal-600 text-white font-bold text-sm shadow-md transition-colors cursor-pointer active:scale-95 inline-flex items-center gap-2"
              >
                <FileVideo className="w-4 h-4" />
                <span>{t.videoUpload.browseFilesBtn}</span>
              </label>

              <input
                ref={fileInputRef}
                id="video-file-input"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            /* Video Preview + Skeleton Canvas */
            <div>
              <div className="relative aspect-16/9 bg-slate-950 rounded-2xl overflow-hidden shadow-inner border border-slate-800">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />

                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />

                {isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 text-white gap-2">
                    <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                    <p className="text-xs font-semibold">{t.videoUpload.processingModel}</p>
                  </div>
                )}
              </div>

              {/* Video Playback & Overlay Controls */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlayPause}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSkeleton((prev) => !prev)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {showSkeleton ? <Eye className="w-3.5 h-3.5 text-teal-600" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{showSkeleton ? t.liveSign.meshOn : t.liveSign.meshOff}</span>
                  </button>
                </div>

                {/* Section 8: Obvious DELETE VIDEO Button */}
                <button
                  type="button"
                  onClick={cleanupVideo}
                  className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Permanently remove uploaded video"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t.videoUpload.deleteVideoBtn}</span>
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Right / Translation Output & Actions */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
              {t.videoUpload.resultHeading}
            </span>

            {/* Translation Output Box */}
            <div className="mt-3 min-h-[100px] flex items-center">
              {translatedSentence ? (
                <div className="space-y-2">
                  <p className="text-2xl font-extrabold text-slate-900 font-sans leading-tight">
                    &ldquo;{translatedSentence}&rdquo;
                  </p>
                  {translatedWord && (
                    <span className="inline-block font-mono text-xs text-teal-800 bg-teal-100 px-2 py-0.5 rounded font-medium">
                      {t.videoUpload.recognizedLabel}: {translatedWord}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-base text-slate-400 italic">
                  {t.liveSign.placeholderIdle}
                </p>
              )}
            </div>

            {/* Flow Actions [ ACCEPT ] [ TRY AGAIN ] [ DELETE VIDEO ] */}
            {translatedSentence && (
              <div className="mt-6 pt-5 border-t border-slate-200 space-y-3">
                <p className="text-sm font-bold text-slate-900">
                  {t.liveSign.isCorrectQuestion}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleAcceptTranslation}
                    className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t.videoUpload.acceptAndSendBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTryAgain}
                    className="py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{t.videoUpload.tryAgainBtn}</span>
                  </button>
                </div>

                {isSentToStaff && (
                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2 font-medium">
                    <Send className="w-4 h-4 text-teal-600" />
                    <span>{t.liveSign.transmittedToStaff}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <p className="leading-relaxed">
              🔒 <strong>{t.videoUpload.localPrivacyBadge}:</strong> {t.videoUpload.localPrivacyDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
