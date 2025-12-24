import { useCallback, useRef, useState } from 'react';

type Point = { x: number; y: number };

export function useCanvasEngine(canvasRef?: React.RefObject<HTMLCanvasElement | null>) {
  const lastPointRef = useRef<Point | null>(null);
  const [drawingColor, setDrawingColor] = useState('#00ffff');
  const [brushWidth, setBrushWidth] = useState(6);

  // Smoothing buffer to reduce jitter
  const smoothingBufferRef = useRef<Point[]>([]);
  const SMOOTHING_FACTOR = 3; // Average last 3 points

  const smoothPoint = useCallback((point: Point): Point => {
    smoothingBufferRef.current.push(point);
    
    if (smoothingBufferRef.current.length > SMOOTHING_FACTOR) {
      smoothingBufferRef.current.shift();
    }

    const avgX = smoothingBufferRef.current.reduce((sum, p) => sum + p.x, 0) / smoothingBufferRef.current.length;
    const avgY = smoothingBufferRef.current.reduce((sum, p) => sum + p.y, 0) / smoothingBufferRef.current.length;

    return { x: avgX, y: avgY };
  }, []);

  const draw = useCallback((points: Point[]) => {
    if (!canvasRef?.current || points.length === 0) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const currentPoint = smoothPoint(points[0]); // Apply smoothing

    if (lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.strokeStyle = drawingColor;
      ctx.lineWidth = brushWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    lastPointRef.current = currentPoint;
  }, [canvasRef, drawingColor, brushWidth, smoothPoint]);

  const stopDrawing = useCallback(() => {
    lastPointRef.current = null;
    smoothingBufferRef.current = []; // Clear smoothing buffer
  }, []);

  const clear = useCallback(() => {
    if (!canvasRef?.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    lastPointRef.current = null;
    smoothingBufferRef.current = [];
  }, [canvasRef]);

  return { draw, clear, stopDrawing, setDrawingColor, setBrushWidth };
}
