'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Item, ValidationResult } from '@/types/game';

interface ArHuntProps {
  currentItem: Item | null;
  onValidationResult: (result: ValidationResult, photoUrl?: string) => void;
  gameProgress: { completed: number; total: number; percentage: number };
}

interface OverlayPosition {
  x: number;
  y: number;
}

export default function ArHunt({ currentItem, onValidationResult, gameProgress }: ArHuntProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overlayPosition, setOverlayPosition] = useState<OverlayPosition>({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  // Initialize camera
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          setHasPermission(true);
        }
      } catch (err) {
        console.error('Failed to initialize camera:', err);
        setError('Camera permission denied or initialization failed');
      }
    };

    initializeCamera();

    return () => {
      // Cleanup camera stream
      const video = videoRef.current;
      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
  }, []);

  // Handle drag move
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !dragStart || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    
    const newX = Math.max(0, Math.min(100, overlayPosition.x + (deltaX / rect.width) * 100));
    const newY = Math.max(0, Math.min(100, overlayPosition.y + (deltaY / rect.height) * 100));
    
    setOverlayPosition({ x: newX, y: newY });
    setDragStart({ x: clientX, y: clientY });
  }, [isDragging, dragStart, overlayPosition]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  };

  // Capture photo function
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas size to 256px (downsampled)
    canvas.width = 256;
    canvas.height = 256;

    // Calculate aspect ratio to maintain proper scaling
    const aspectRatio = video.videoWidth / video.videoHeight;
    let sourceWidth = video.videoWidth;
    let sourceHeight = video.videoHeight;
    let sourceX = 0;
    let sourceY = 0;

    // Crop to square from center
    if (aspectRatio > 1) {
      sourceWidth = video.videoHeight;
      sourceX = (video.videoWidth - video.videoHeight) / 2;
    } else {
      sourceHeight = video.videoWidth;
      sourceY = (video.videoHeight - video.videoWidth) / 2;
    }

    // Draw the video frame to canvas
    ctx.drawImage(
      video,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, 256, 256
    );

    // Convert canvas to blob with JPEG 80% quality and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        const photoUrl = URL.createObjectURL(blob);
        
        // Call the validation result callback with mock validation
        // In a real app, you'd send the blob to a server for actual validation
        onValidationResult({
          success: Math.random() > 0.3, // Mock 70% success rate
          confidence: Math.random(),
          message: Math.random() > 0.3 ? 'Item found!' : 'Try again'
        }, photoUrl);
      }
    }, 'image/jpeg', 0.8);
  }, [onValidationResult]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <p className="text-xl mb-4">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <p className="text-xl mb-4">Requesting Camera Permission</p>
          <p>Please allow camera access to continue</p>
        </div>
      </div>
    );
  }

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
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Video element for camera feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
      />

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Draggable overlay */}
      <div
        className={`absolute w-20 h-20 bg-blue-500/70 border-2 border-white rounded-lg flex items-center justify-center cursor-move ${
          isDragging ? 'scale-110' : ''
        } transition-transform`}
        style={{
          left: `${overlayPosition.x}%`,
          top: `${overlayPosition.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="text-white text-xs text-center font-bold">
          Target
        </div>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top bar with current item and progress */}
        <div className="absolute top-0 left-0 right-0 bg-black/50 p-4 pointer-events-auto">
          <div className="text-white text-center">
            <p className="text-sm">Find:</p>
            <p className="text-lg font-bold">{currentItem.name}</p>
            <div className="mt-2">
              <p className="text-xs">
                Progress: {gameProgress.completed}/{gameProgress.total} ({gameProgress.percentage}%)
              </p>
            </div>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
          <div className="flex justify-center items-center">
            {/* Shutter button */}
            <button
              onClick={capturePhoto}
              className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </button>
          </div>
          
          {/* Instructions */}
          <div className="text-white text-center mt-4">
            <p className="text-sm">
              Drag the blue target over the {currentItem.name} and tap the shutter
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
