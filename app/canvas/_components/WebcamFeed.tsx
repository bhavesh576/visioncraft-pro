// app/canvas/_components/WebcamFeed.tsx
'use client';

import { MutableRefObject, useEffect } from 'react';

export default function WebcamFeed({ videoRef }: { videoRef: MutableRefObject<HTMLVideoElement | null> }) {
  useEffect(() => {
    async function setupCamera() {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    }
    setupCamera();
  }, [videoRef]);

  return (
    <video
      ref={videoRef as any}
      style={{
        position: 'fixed',
        right: 10,
        bottom: 10,
        width: 200,
        borderRadius: 10,
        border: '1px solid white',
        zIndex: 1000,
      }}
      muted
      playsInline
      autoPlay
    />
  );
}
