'use client';

import { useState } from 'react';
import ArHunt from '@/src/components/ArHunt';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);

  if (gameStarted) {
    return <ArHunt />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Office Object Hunt
        </h1>
        
        <p className="text-gray-600 mb-8">
          Find 5 office items using your camera in this AR scavenger hunt!
        </p>
        
        <div className="space-y-3 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
            <p className="text-left text-gray-700">Point your camera at office items</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
            <p className="text-left text-gray-700">Align the overlay with the real object</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
            <p className="text-left text-gray-700">Tap the capture button to verify</p>
          </div>
        </div>
        
        <button
          onClick={() => setGameStarted(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Start Hunt
        </button>
        
        <p className="text-xs text-gray-500 mt-4">
          Camera permission required • Works best in well-lit areas
        </p>
      </div>
    </div>
  );
}