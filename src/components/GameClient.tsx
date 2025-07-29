// src/components/GameClient.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { TARGET_OBJECTS, TargetObject } from '@/config/gameConfig';
import Confetti from 'react-confetti';

type GameState = 'idle' | 'starting_camera' | 'playing' | 'validating' | 'success' | 'failed' | 'finished' | 'error';

export default function GameClient() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [foundItems, setFoundItems] = useState<TargetObject[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentItem = TARGET_OBJECTS[currentItemIndex];

  useEffect(() => {
    if (gameState === 'success' || gameState === 'failed') {
      const timer = setTimeout(() => {
        if (gameState === 'success') {
          if (currentItemIndex + 1 < TARGET_OBJECTS.length) {
            setCurrentItemIndex(currentItemIndex + 1);
            setGameState('playing');
          } else {
            setGameState('finished');
          }
        } else { // failed
          setGameState('playing');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState, currentItemIndex]);

  const startCamera = async () => {
    console.log('startCamera called');
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log('Camera not supported');
      setErrorMsg('Camera not supported by this browser.');
      setGameState('error');
      return;
    }

    try {
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      console.log('Camera access granted, setting up video...');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('Stream set, changing state to playing');
        setGameState('playing');
      } else {
        console.log('Video ref is null');
        setErrorMsg('Video element not found');
        setGameState('error');
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setErrorMsg(`Camera error: ${err.message || err.name || 'Unknown error'}`);
      setGameState('error');
    }
  };

  // Handle video playback when state changes to playing
  useEffect(() => {
    console.log('useEffect running, gameState:', gameState);
    console.log('videoRef.current exists:', !!videoRef.current);
    console.log('videoRef.current.srcObject exists:', !!(videoRef.current?.srcObject));
    
    if (gameState === 'playing' && videoRef.current && videoRef.current.srcObject) {
      console.log('State is playing, starting video playback');
      console.log('Video element dimensions:', videoRef.current.offsetWidth, 'x', videoRef.current.offsetHeight);
      console.log('Video element display:', window.getComputedStyle(videoRef.current).display);
      console.log('Video element visibility:', window.getComputedStyle(videoRef.current).visibility);
      
      videoRef.current.play().catch(err => {
        console.error('Video play error:', err);
      });
    }
  }, [gameState]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !currentItem) return;

    setGameState('validating');
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.5); // Use 0.5 quality for smaller size

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl, prompt: currentItem.prompt }),
      });

      if (!response.ok) throw new Error('Network response was not ok.');

      const data = await response.json();
      if (data.result === 'yes') {
        setFoundItems([...foundItems, currentItem]);
        setGameState('success');
      } else {
        setGameState('failed');
      }
    } catch (error) {
      console.error("Validation failed:", error);
      // Fallback: auto-pass on network error
      setFoundItems([...foundItems, { ...currentItem, id: `${currentItem.id}-fallback` }]);
      setGameState('success');
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black">
      {/* Persistent video and canvas elements */}
      <video 
        ref={videoRef} 
        style={{
          display: gameState === 'playing' ? 'block' : 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 1,
          backgroundColor: 'green' // Temporary - to see if video element is there
        }}
        autoPlay
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {gameState === 'success' && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      {/* Conditional UI based on game state */}
      {gameState === 'idle' && (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4 z-10 relative">
          <h1 className="text-4xl font-bold mb-4">Office Object Hunt</h1>
          <p className="mb-4">Find 5 items using your camera!</p>
          <p className="mb-8 text-sm">You'll be looking for: Water Bottle, Chair, Keyboard, Soda Can, Backpack</p>
          <button onClick={startCamera} className="px-8 py-4 bg-blue-600 rounded-lg text-xl font-bold hover:bg-blue-700">
            Start Hunt
          </button>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4 z-10 relative">
          <h1 className="text-4xl font-bold mb-8">Hunt Complete!</h1>
          <p className="mb-4">You found all the items:</p>
          <ul className="list-disc list-inside">
            {foundItems.map(item => <li key={item.id}>{item.name}</li>)}
          </ul>
          <button onClick={() => window.location.reload()} className="mt-8 px-8 py-4 bg-blue-600 rounded-lg text-xl font-bold hover:bg-blue-700">
            Play Again
          </button>
        </div>
      )}

      {gameState === 'error' && (
        <div className="flex items-center justify-center h-screen bg-red-900 text-white p-4 text-center z-10 relative">
          {errorMsg}
        </div>
      )}

      {/* Playing state UI - overlays on video */}
      {gameState === 'playing' && (
        <>
          {/* Dynamic instructions */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: 'red',
            color: 'white',
            padding: '20px',
            fontSize: '20px',
            textAlign: 'center',
            zIndex: 99999
          }}>
            FIND: {currentItem?.name?.toUpperCase() || 'LOADING...'} (ITEM {currentItemIndex + 1} OF {TARGET_OBJECTS.length})
          </div>

          {/* Center Target Image - Fixed positioning */}
          {currentItem && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
              <img 
                src={currentItem.overlayUrl} 
                alt={currentItem.name} 
                className="w-48 h-48 opacity-60" 
                style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }}
              />
            </div>
          )}

          {/* Feedback Message */}
          {(gameState === 'validating' || gameState === 'success' || gameState === 'failed') && (
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-4xl font-bold drop-shadow-lg z-20 text-center">
              {gameState === 'validating' && <p>Checking...</p>}
              {gameState === 'success' && <p className="text-green-400">Correct!</p>}
              {gameState === 'failed' && <p className="text-red-400">Try Again!</p>}
            </div>
          )}

          {/* Shutter Button - Always show in playing state */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <button
              onClick={handleCapture}
              disabled={gameState !== 'playing'}
              className="w-20 h-20 bg-white rounded-full border-4 border-gray-800 shadow-xl"
              style={{
                backgroundColor: 'white',
                borderColor: '#1f2937',
                borderWidth: '4px'
              }}
            />
          </div>
        </>
      )}

      {/* Test button - always visible, centered */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'red',
        color: 'white',
        padding: '10px',
        borderRadius: '50%',
        width: '80px',
        height: '80px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '24px'
      }} onClick={handleCapture}>
        📷
      </div>
    </div>
  );
}
