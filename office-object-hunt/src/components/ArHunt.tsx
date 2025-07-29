'use client';

import { useEffect, useRef, useState } from 'react';

interface Item {
  name: string;
  overlayPath: string;
  promptFragment: string;
}

interface TouchPosition {
  x: number;
  y: number;
}

export default function ArHunt() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const [items, setItems] = useState<Item[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashMessage, setFlashMessage] = useState<string>('');
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<TouchPosition>({ x: 0, y: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    fetch('/items.json')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error('Failed to load items:', err));
  }, []);
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Wait for video to load
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
          };
        }
        setStream(mediaStream);
      } catch (err) {
        console.error('Failed to access camera:', err);
        // Try with basic constraints as fallback
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
            };
          }
          setStream(basicStream);
        } catch (fallbackErr) {
          console.error('Fallback camera failed:', fallbackErr);
          setFlashMessage('Camera access denied');
        }
      }
    };
    
    initCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Remove stream dependency to prevent loop
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!overlayRef.current) return;
    
    const touch = e.touches[0];
    const rect = overlayRef.current.getBoundingClientRect();
    
    if (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    ) {
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - overlayPosition.x,
        y: touch.clientY - overlayPosition.y
      });
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    setOverlayPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  
  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current || !items[currentItemIndex]) return;
    
    const video = videoRef.current;
    
    // Check if video is ready
    if (video.readyState !== video.HAVE_ENOUGH_DATA || 
        video.videoWidth === 0 || video.videoHeight === 0) {
      setFlashMessage('Camera not ready, please wait...');
      setTimeout(() => setFlashMessage(''), 2000);
      return;
    }
    
    setIsCapturing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
    } catch (err) {
      console.error('Failed to draw video frame:', err);
      setFlashMessage('Capture failed, try again');
      setIsCapturing(false);
      setTimeout(() => setFlashMessage(''), 2000);
      return;
    }
    
    const resizedCanvas = document.createElement('canvas');
    const resizedCtx = resizedCanvas.getContext('2d');
    
    if (!resizedCtx) return;
    
    resizedCanvas.width = 256;
    resizedCanvas.height = 256;
    resizedCtx.drawImage(canvas, 0, 0, 256, 256);
    
    resizedCanvas.toBlob(async (blob) => {
      if (!blob) return;
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        try {
          const response = await fetch('/api/classify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: base64.split(',')[1],
              itemName: items[currentItemIndex].promptFragment
            })
          });
          
          const result = await response.json();
          
          if (result.match || result.offline) {
            const gameState = JSON.parse(localStorage.getItem('hunt_state_v1') || '{}');
            gameState[items[currentItemIndex].name] = {
              found: true,
              offline: result.offline || false,
              thumbnail: base64
            };
            localStorage.setItem('hunt_state_v1', JSON.stringify(gameState));
            
            setFlashMessage('Success! 🎉');
            setShowConfetti(true);
            
            setTimeout(() => {
              setShowConfetti(false);
              if (currentItemIndex < items.length - 1) {
                setCurrentItemIndex(currentItemIndex + 1);
                setOverlayPosition({ x: 0, y: 0 });
              } else {
                window.location.href = '/summary';
              }
            }, 2000);
          } else {
            setFlashMessage('Try again!');
          }
        } catch (err) {
          console.error('Classification failed:', err);
          const gameState = JSON.parse(localStorage.getItem('hunt_state_v1') || '{}');
          gameState[items[currentItemIndex].name] = {
            found: true,
            offline: true,
            thumbnail: base64
          };
          localStorage.setItem('hunt_state_v1', JSON.stringify(gameState));
          
          setFlashMessage('Offline mode - Success! 🎉');
          setShowConfetti(true);
          
          setTimeout(() => {
            setShowConfetti(false);
            if (currentItemIndex < items.length - 1) {
              setCurrentItemIndex(currentItemIndex + 1);
              setOverlayPosition({ x: 0, y: 0 });
            } else {
              window.location.href = '/summary';
            }
          }, 2000);
        }
      };
      
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.8);
    
    setIsCapturing(false);
    
    setTimeout(() => {
      setFlashMessage('');
    }, 2000);
  };
  
  if (!items.length) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  const currentItem = items[currentItemIndex];
  
  return (
    <div 
      className="relative w-full h-screen overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <canvas ref={canvasRef} className="hidden" />
      
      <div
        ref={overlayRef}
        className="absolute w-64 h-64 opacity-50 pointer-events-none"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${overlayPosition.x}px), calc(-50% + ${overlayPosition.y}px))`,
          touchAction: 'none'
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={currentItem.overlayPath} 
          alt={currentItem.name}
          className="w-full h-full"
          draggable={false}
        />
      </div>
      
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
        <h2 className="text-white text-xl font-bold text-center">
          Find: {currentItem.name.charAt(0).toUpperCase() + currentItem.name.slice(1)}
        </h2>
        <p className="text-white/80 text-sm text-center mt-1">
          {currentItemIndex + 1} of {items.length}
        </p>
      </div>
      
      <button
        onClick={captureImage}
        disabled={isCapturing}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white rounded-full shadow-lg border-4 border-gray-300 active:scale-95 transition-transform disabled:opacity-50"
        aria-label="Capture"
      >
        <div className="w-16 h-16 bg-red-500 rounded-full mx-auto" />
      </button>
      
      {flashMessage && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-8 py-4 rounded-lg text-xl font-bold">
          {flashMessage}
        </div>
      )}
      
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#F8B500'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}