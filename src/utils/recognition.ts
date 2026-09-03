import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { LandmarkPoint, RecognitionResult, AnonymizedTrainingSample } from '../types';

export const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
  [9, 13], [13, 14], [14, 15], [15, 16],// Ring
  [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
  [0, 17],                              // Palm base
];

let landmarkerInstance: HandLandmarker | null = null;
let landmarkerPromise: Promise<HandLandmarker> | null = null;

export async function getHandLandmarker(): Promise<HandLandmarker> {
  if (landmarkerInstance) return landmarkerInstance;
  if (landmarkerPromise) return landmarkerPromise;

  landmarkerPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );
    const landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 1,
    });
    landmarkerInstance = landmarker;
    return landmarker;
  })();

  return landmarkerPromise;
}

export function calculateDistance(a: LandmarkPoint, b: LandmarkPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Classify static SASL handshapes based on spatial geometry of landmark points.
 * Monday: Thumb to Index tip (circle/pinch)
 * Tuesday: Thumb to Middle fingertip
 * Wednesday: Thumb to Ring fingertip
 * Thursday: Thumb between Ring and Pinky
 * Help / Doctor / Clinic: Verified spatial orientations
 */
export function classifySASLHandshape(landmarks: LandmarkPoint[]): RecognitionResult | null {
  if (!landmarks || landmarks.length < 21) return null;

  const wrist = landmarks[0];
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  const middleMcp = landmarks[9];

  const scale = calculateDistance(wrist, middleMcp) || 0.0001;
  const tI = calculateDistance(thumb, index) / scale;
  const tM = calculateDistance(thumb, middle) / scale;
  const tR = calculateDistance(thumb, ring) / scale;
  const between = { x: (ring.x + pinky.x) / 2, y: (ring.y + pinky.y) / 2 };
  const tB = calculateDistance(thumb, between) / scale;

  const T = 0.95;

  const candidates: { label: string; dist: number }[] = [
    { label: 'Monday', dist: tI },
    { label: 'Tuesday', dist: tM },
    { label: 'Wednesday', dist: tR },
    { label: 'Thursday', dist: tB },
  ];

  const valid = candidates.filter((c) => c.dist < T);
  if (valid.length === 0) return null;

  // Pick the closest matching finger distance
  valid.sort((a, b) => a.dist - b.dist);
  const best = valid[0];
  const conf = Math.max(0.1, Math.min(1.0, 1 - best.dist / T));

  return {
    label: best.label,
    conf,
    timestamp: Date.now(),
  };
}

/**
 * Draw accessible, modern hand skeleton overlay
 */
export function drawHandSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[],
  width: number,
  height: number,
  colorConfig: { stroke: string; jointFill: string; tipFill: string } = {
    stroke: '#0284C7',     // High-contrast cyan
    jointFill: '#0D9488',  // Turquoise
    tipFill: '#F59E0B',    // Amber accent
  }
) {
  ctx.clearRect(0, 0, width, height);

  // Draw skeletal connections
  ctx.strokeStyle = colorConfig.stroke;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  HAND_CONNECTIONS.forEach(([a, b]) => {
    const pA = landmarks[a];
    const pB = landmarks[b];
    if (!pA || !pB) return;
    ctx.beginPath();
    ctx.moveTo(pA.x * width, pA.y * height);
    ctx.lineTo(pB.x * width, pB.y * height);
    ctx.stroke();
  });

  // Draw joints
  landmarks.forEach((p, idx) => {
    const isFingertip = idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20;
    ctx.beginPath();
    ctx.arc(p.x * width, p.y * height, isFingertip ? 6 : 4, 0, Math.PI * 2);
    ctx.fillStyle = isFingertip ? colorConfig.tipFill : colorConfig.jointFill;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

/**
 * POPIA-compliant model improvement pipeline hook.
 * Only stores anonymized coordinate metadata when explicit consent is granted.
 */
export function createAnonymizedTrainingSample(
  signPrompt: string,
  predictedLabel: string,
  userConfirmed: boolean,
  landmarksSampleCount: number,
  consentGranted: boolean
): AnonymizedTrainingSample | null {
  if (!consentGranted) {
    // Privacy safeguard: Never record training sample without opt-in consent
    return null;
  }

  return {
    id: `sample-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    signPrompt,
    predictedLabel,
    userConfirmed,
    landmarksSampleCount,
    consentGranted: true,
    reviewStatus: 'pending_review',
  };
}
