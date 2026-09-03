import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Upload, Play, Square, RefreshCw, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import type { AppMode, RecognitionResult } from '../types';
import { getHandLandmarker, drawHandSkeleton, classifySASLHandshape } from '../utils/recognition';

interface VideoStageProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onSignRecognized: (result: RecognitionResult | null) => void;
}

export const VideoStage: React.FC<VideoStageProps> = ({
  mode,
  onModeChange,
  onSignRecognized,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  isRunningRef.current = isRunning;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const stopSession = useCallback(() => {
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
    onSignRecognized(null);
  }, [onSignRecognized]);

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
          if (ctx && showSkeleton) {
            drawHandSkeleton(ctx, landmarks, canvas.width, canvas.height);
          } else if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }

          const classification = classifySASLHandshape(landmarks);
          onSignRecognized(classification);
        } else {
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
          onSignRecognized(null);
        }
      } catch (err) {
        console.error('Inference error:', err);
      }
    }

    if (isRunningRef.current) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [onSignRecognized, showSkeleton]);

  const startCamera = async () => {
    setErrorMsg(null);
    setIsLoadingModel(true);

    try {
      // Warm up model
      await getHandLandmarker();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
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
      animationFrameRef.current = requestAnimationFrame(processFrame);
    } catch (err: unknown) {
      setIsLoadingModel(false);
      setIsRunning(false);
      console.error('Camera startup error:', err);
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setErrorMsg('Camera access was denied. Please grant camera permission in your browser.');
      } else if (err instanceof Error && err.name === 'NotFoundError') {
        setErrorMsg('No camera device was detected on your system.');
      } else {
        setErrorMsg('Could not access camera. Please check device permissions and try again.');
      }
    }
  };

  const handleStopCamera = () => {
    stopSession();
  };

  const toggleCameraFacing = async () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    if (isRunning) {
      stopSession();
      setTimeout(() => {
        startCamera();
      }, 150);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setUploadedFileName(file.name);
    stopSession();
    setIsLoadingModel(true);

    try {
      await getHandLandmarker();

      if (videoRef.current) {
        const fileUrl = URL.createObjectURL(file);
        videoRef.current.srcObject = null;
        videoRef.current.src = fileUrl;
        videoRef.current.loop = true;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }

      setIsRunning(true);
      setIsLoadingModel(false);
      animationFrameRef.current = requestAnimationFrame(processFrame);
    } catch (err) {
      setIsLoadingModel(false);
      setIsRunning(false);
      console.error('File load error:', err);
      setErrorMsg('Failed to play or analyze the uploaded video clip.');
    }
  };

  const handleModeSwitch = (newMode: AppMode) => {
    stopSession();
    setErrorMsg(null);
    onModeChange(newMode);
  };

  return (
    <div className="bg-white border border-[#DCD7C9] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Mode Toggle */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex gap-2">
            <button
              type="button"
              id="btn-live"
              onClick={() => handleModeSwitch('live')}
              className={`text-xs font-medium px-3.5 py-2 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'live'
                  ? 'bg-[#0B5D52] border-[#0B5D52] text-white shadow-xs'
                  : 'bg-transparent border-[#DCD7C9] text-[#6B7570] hover:text-[#182420] hover:bg-[#F7F5F0]'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live camera</span>
            </button>

            <button
              type="button"
              id="btn-upload"
              onClick={() => handleModeSwitch('upload')}
              className={`text-xs font-medium px-3.5 py-2 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'upload'
                  ? 'bg-[#0B5D52] border-[#0B5D52] text-white shadow-xs'
                  : 'bg-transparent border-[#DCD7C9] text-[#6B7570] hover:text-[#182420] hover:bg-[#F7F5F0]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload video</span>
            </button>
          </div>

          {/* Skeleton Overlay Toggle */}
          <button
            type="button"
            onClick={() => setShowSkeleton((prev) => !prev)}
            className="text-xs text-[#6B7570] hover:text-[#182420] p-1.5 rounded-md hover:bg-[#F7F5F0] transition-colors flex items-center gap-1"
            title={showSkeleton ? 'Hide Skeleton Overlay' : 'Show Skeleton Overlay'}
          >
            {showSkeleton ? <Eye className="w-3.5 h-3.5 text-[#0B5D52]" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px] font-mono">
              {showSkeleton ? 'Mesh on' : 'Mesh off'}
            </span>
          </button>
        </div>

        {/* Video & Canvas Stage */}
        <div
          id="stage"
          className="relative aspect-4/3 bg-[#063D37] rounded-xl overflow-hidden shadow-inner border border-[#063D37]"
        >
          <video
            ref={videoRef}
            id="video"
            autoPlay
            playsInline
            muted
            className={`absolute top-0 left-0 w-full h-full object-cover ${
              mode === 'live' && facingMode === 'user' ? 'scale-x-[-1]' : ''
            }`}
          />

          <canvas
            ref={canvasRef}
            id="overlay"
            className={`absolute top-0 left-0 w-full h-full object-contain pointer-events-none ${
              mode === 'live' && facingMode === 'user' ? 'scale-x-[-1]' : ''
            }`}
          />

          {/* Empty / Inactive Stage Overlay */}
          {!isRunning && !isLoadingModel && (
            <div
              id="stage-empty"
              className="absolute inset-0 flex flex-col items-center justify-center text-white/70 text-xs gap-3 text-center p-6 bg-[#063D37]/95"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-[#D9A441] mb-1">
                {mode === 'live' ? <Camera className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
              </div>
              <span className="font-medium text-white/90">
                {mode === 'live' ? 'Camera is currently off' : 'No video clip loaded'}
              </span>
              <p className="max-w-xs text-white/60 text-[11px] leading-relaxed">
                {mode === 'live'
                  ? 'Click "Start camera" below to initiate real-time SASL landmark tracking directly in your browser.'
                  : 'Select an .mp4 or .mov video of a signer performing SASL day gestures.'}
              </p>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoadingModel && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#063D37]/90 text-white gap-3 z-10">
              <Loader2 className="w-8 h-8 text-[#D9A441] animate-spin" />
              <div className="text-center">
                <p className="text-xs font-medium">Initializing MediaPipe Vision…</p>
                <p className="text-[10px] text-white/60 font-mono mt-0.5">Loading hand landmark weights</p>
              </div>
            </div>
          )}

          {/* Active Live Indicator */}
          {isRunning && (
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white font-mono text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10 z-10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{mode === 'live' ? 'STREAM ACTIVE' : 'PLAYBACK ACTIVE'}</span>
            </div>
          )}
        </div>

        {/* Error notice if camera fails */}
        {errorMsg && (
          <div className="mt-3 p-3 bg-[#B5502F]/10 border border-[#B5502F]/30 rounded-xl text-xs text-[#B5502F] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="mt-4 pt-3 border-t border-[#DCD7C9]/60">
        {mode === 'live' ? (
          <div id="live-controls" className="flex items-center gap-2.5">
            <button
              type="button"
              id="btn-start"
              disabled={isRunning || isLoadingModel}
              onClick={startCamera}
              className="flex-1 inline-flex items-center justify-center gap-2 font-medium text-sm px-4 py-2.5 rounded-xl bg-[#0B5D52] hover:bg-[#063D37] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start camera</span>
            </button>

            <button
              type="button"
              id="btn-stop"
              disabled={!isRunning}
              onClick={handleStopCamera}
              className="inline-flex items-center justify-center gap-2 font-medium text-sm px-4 py-2.5 rounded-xl border border-[#DCD7C9] bg-transparent text-[#182420] hover:bg-[#F7F5F0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Square className="w-4 h-4" />
              <span>Stop</span>
            </button>

            <button
              type="button"
              onClick={toggleCameraFacing}
              disabled={isLoadingModel}
              title="Switch camera (front/back)"
              className="p-2.5 rounded-xl border border-[#DCD7C9] bg-white text-[#6B7570] hover:text-[#182420] hover:bg-[#F7F5F0] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div id="upload-controls" className="flex flex-col gap-2">
            <label
              htmlFor="file-input"
              className="upload-drop flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#0B5D52]/30 hover:border-[#0B5D52] bg-[#0B5D52]/5 hover:bg-[#0B5D52]/10 rounded-xl cursor-pointer transition-all text-center"
            >
              <Upload className="w-5 h-5 text-[#0B5D52] mb-1.5" />
              <span className="text-xs font-medium text-[#182420]">
                {uploadedFileName ? `Loaded: ${uploadedFileName}` : 'Click to choose a video file (.mp4, .mov, .webm)'}
              </span>
              <span className="text-[11px] text-[#6B7570] mt-0.5">
                Processed locally on-device via WebAssembly
              </span>
            </label>
            <input
              type="file"
              id="file-input"
              ref={fileInputRef}
              accept="video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
};
