'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import WebcamFeed from './WebcamFeed';
import { useCanvasEngine } from '../../../lib/hooks/useCanvasEngine';
import { useHandTracking } from '../../../lib/hooks/useHandTracking';

export default function CanvasStage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState('#000000');  // Changed default to black
  const [brushSize, setBrushSize] = useState(4);   // Thinner default for writing
  const [isDrawing, setIsDrawing] = useState(false);
  const [sensitivity, setSensitivity] = useState(0.06); // Pinch sensitivity
  const { draw, clear, stopDrawing, setDrawingColor, setBrushWidth } = useCanvasEngine(canvasRef);
  const { videoRef, landmarks } = useHandTracking();

  // Set canvas size
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // IMPROVED Pinch Detection with adjustable sensitivity
  const detectPinch = useCallback((hand: any) => {
    const thumbTip = hand[4];
    const indexTip = hand[8];
    
    // Calculate 3D distance
    const distance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) + 
      Math.pow(thumbTip.y - indexTip.y, 2) + 
      Math.pow((thumbTip.z || 0) - (indexTip.z || 0), 2)
    );
    
    // Use adjustable sensitivity
    return distance < sensitivity;
  }, [sensitivity]);

  // Main drawing loop
  useEffect(() => {
    if (!landmarks.length) {
      setIsDrawing(false);
      stopDrawing();
      return;
    }

    const hand = landmarks[0];
    const isPinching = detectPinch(hand);
    setIsDrawing(isPinching);

    if (isPinching) {
      // Use INDEX FINGER TIP for more precise writing
      const indexTip = hand[8];
      
      const point = {
        x: (1 - indexTip.x) * window.innerWidth,
        y: indexTip.y * window.innerHeight,
      };
      
      draw([point]);
    } else {
      stopDrawing();
    }
  }, [landmarks, draw, stopDrawing, detectPinch]);

  // Update color
  useEffect(() => {
    setDrawingColor(color);
  }, [color, setDrawingColor]);

  // Update brush size
  useEffect(() => {
    setBrushWidth(brushSize);
  }, [brushSize, setBrushWidth]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'white',
        }}
      />

      {/* Drawing Controls */}
      <div
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 1000,
          background: 'rgba(0,0,0,0.9)',
          padding: '18px',
          borderRadius: '12px',
          color: 'white',
          maxWidth: '240px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 'bold' }}>
          ✋ Hand Drawing
        </h3>

        {/* Status */}
        <div
          style={{
            marginBottom: '14px',
            padding: '12px',
            background: isDrawing 
              ? 'linear-gradient(135deg, #00ff00, #00cc00)' 
              : 'linear-gradient(135deg, #ff4444, #cc0000)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#000',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {isDrawing ? '✍️ DRAWING' : '⏸️ PAUSED'}
        </div>

        {/* Instructions */}
        <div
          style={{
            marginBottom: '14px',
            fontSize: '11px',
            background: 'rgba(255,255,255,0.12)',
            padding: '10px',
            borderRadius: '8px',
            lineHeight: '1.6',
          }}
        >
          <strong style={{ color: '#00ffff' }}>How to Use:</strong>
          <br />
          • 👌 <strong>Pinch</strong> thumb + index close = Draw
          <br />
          • ✋ <strong>Open</strong> fingers apart = Stop
          <br />
          <em style={{ fontSize: '10px', opacity: 0.7 }}>
            Adjust sensitivity below if needed
          </em>
        </div>

        {/* Sensitivity Control */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
            🎯 Sensitivity: {(sensitivity * 100).toFixed(0)}
          </label>
          <input
            type="range"
            min="0.03"
            max="0.12"
            step="0.01"
            value={sensitivity}
            onChange={(e) => setSensitivity(Number(e.target.value))}
            style={{
              width: '100%',
              cursor: 'pointer',
            }}
          />
          <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '4px' }}>
            Lower = harder pinch needed
          </div>
        </div>

        {/* Color Picker */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
            🎨 Color:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {[
              '#000000', '#ff0000', '#00ff00', '#0000ff',
              '#ffff00', '#ff00ff', '#00ffff', '#ffffff'
            ].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: '100%',
                  height: '36px',
                  background: c,
                  border: color === c ? '3px solid #ffcc00' : '2px solid #555',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: color === c ? '0 0 10px rgba(255,204,0,0.8)' : 'none',
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Brush Size */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
            ✏️ Brush Size: <span style={{ color: '#00ffff' }}>{brushSize}px</span>
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            style={{
              width: '100%',
              cursor: 'pointer',
            }}
          />
        </div>

        {/* Clear Button */}
        <button
          onClick={clear}
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #ff4444, #cc0000)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            transition: 'transform 0.1s',
          }}
        >
          🗑️ Clear Canvas
        </button>
      </div>

      <WebcamFeed videoRef={videoRef} />
    </>
  );
}
