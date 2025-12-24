import { useRef, useEffect, useState } from 'react';

export type Landmark = { x: number; y: number; z?: number };
export type HandLandmarks = Landmark[];

export function useHandTracking() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [landmarks, setLandmarks] = useState<HandLandmarks[]>([]);

  useEffect(() => {
    let hands: any = null;
    let animationId: number;

    const loadMediaPipe = async () => {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
        script.onload = resolve;
        document.head.appendChild(script);
      });

      if (!videoRef.current) return;

      // @ts-ignore
      hands = new window.Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 2,  // ← CHANGED: Detect 2 hands now!
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      hands.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          setLandmarks(results.multiHandLandmarks);
        } else {
          setLandmarks([]);
        }
      });

      const processFrame = async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          await hands.send({ image: videoRef.current });
        }
        animationId = requestAnimationFrame(processFrame);
      };

      processFrame();
    };

    loadMediaPipe();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (hands) hands.close();
    };
  }, []);

  return { videoRef, landmarks };
}
