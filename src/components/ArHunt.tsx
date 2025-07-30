'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Item, ValidationResult } from '@/types/game';

interface ArHuntProps {
  currentItem: Item | null;
  onValidationResult: (result: ValidationResult, photoUrl?: string) => void;
  gameProgress: { completed: number; total: number; percentage: number };
}

export default function ArHunt({ currentItem, onValidationResult, gameProgress }: ArHuntProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const initializeCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera not supported by this browser.');
      return;
    }

    try {
      console.log('Requesting camera access...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Camera access timeout')), 10000)
      );
      
      const streamPromise = navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      const stream = await Promise.race([streamPromise, timeoutPromise]) as MediaStream;
      console.log('Camera stream received:', stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to load
        await new Promise((resolve, reject) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log('Video metadata loaded, playing...');
              videoRef.current?.play().then(() => {
                console.log('Video playing successfully');
                setCameraReady(true);
                resolve(true);
              }).catch(reject);
            };
            videoRef.current.onerror = reject;
          }
        });
      } else {
        throw new Error('Video element not found');
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError(`Failed to access camera: ${(err as Error).message}`);
    }
  };

  useEffect(() => {
    initializeCamera();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!currentItem || isCapturing || !cameraReady) return;
    
    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) {
      setIsCapturing(false);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsCapturing(false);
      return;
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.5);
    
    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: imageDataUrl,
          prompt: `Is the main object in this image a ${currentItem.name.toLowerCase()}? Reply 'yes' or 'no' only.`
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Create photo URL for display
      const photoUrl = URL.createObjectURL(await fetch(imageDataUrl).then(r => r.blob()));
      
      // Call validation with result
      onValidationResult({
        success: result.result === 'yes',
        confidence: result.result === 'yes' ? 0.9 : 0.1,
        message: result.result === 'yes' ? 'Item found!' : 'Try again'
      }, photoUrl);
      
    } catch (e) {
      console.error('Capture error:', e);
      onValidationResult({ 
        success: false, 
        confidence: 0,
        message: `Error: ${(e as Error).message}` 
      });
    }
    
    setIsCapturing(false);
  }, [currentItem, onValidationResult, isCapturing, cameraReady]);

  if (!currentItem) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <p className="text-xl mb-4">Game Complete!</p>
          <p>All items found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Video feed - always render so ref exists */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{ opacity: cameraReady ? 1 : 0 }}
      />
      
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Loading/Error overlay */}
      {!cameraReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
          <div className="text-center p-4">
            {error ? (
              <>
                <p className="text-xl mb-4 text-red-400">Camera Error</p>
                <p className="mb-6 text-red-300">{error}</p>
              </>
            ) : (
              <>
                <p className="text-xl mb-4">Starting Camera...</p>
                <p className="mb-6">Please allow camera access when prompted</p>
              </>
            )}
            <button 
              onClick={initializeCamera}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              {error ? 'Try Again' : 'Retry Camera Access'}
            </button>
            <p className="text-sm text-gray-400 mt-4">
              Make sure camera permissions are enabled for this site
            </p>
          </div>
        </div>
      )}
      
      {/* Game UI - only show when camera is ready */}
      {cameraReady && currentItem && (
        <>
          {/* Target overlay - center guide */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-4 border-white border-dashed rounded-lg flex items-center justify-center bg-black/20">
              <span className="text-white text-sm font-bold">Target: {currentItem.name}</span>
            </div>
          </div>
          
          {/* Top instruction bar */}
          <div className="absolute top-0 left-0 right-0 bg-red-600 text-white p-4 text-center">
            <p className="text-lg font-bold">
              FIND: {currentItem.name.toUpperCase()} (ITEM {gameProgress.completed + 1} OF {gameProgress.total})
            </p>
          </div>
          
          {/* Capture button */}
          <button
            onClick={capturePhoto}
            disabled={!currentItem || isCapturing || !cameraReady}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white text-black px-8 py-4 rounded-full font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95 transition-transform"
          >
            {isCapturing ? 'Capturing...' : '📷 Capture'}
          </button>
          
          {/* Progress indicator */}
          <div className="absolute top-20 left-4 bg-black/50 text-white px-3 py-2 rounded">
            Progress: {gameProgress.completed}/{gameProgress.total}
          </div>
        </>
      )}
    </div>
  );
}
