'use client';

import { useEffect, useState } from 'react';

interface GameState {
  [key: string]: {
    found: boolean;
    offline?: boolean;
    thumbnail?: string;
  };
}

interface Item {
  name: string;
  overlayPath: string;
  promptFragment: string;
}

export default function Summary() {
  const [gameState, setGameState] = useState<GameState>({});
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const savedState = localStorage.getItem('hunt_state_v1');
    if (savedState) {
      setGameState(JSON.parse(savedState));
    }

    fetch('/items.json')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error('Failed to load items:', err));
  }, []);

  const handleRestart = () => {
    localStorage.removeItem('hunt_state_v1');
    window.location.href = '/';
  };

  const foundCount = Object.values(gameState).filter(item => item.found).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-blue-600 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mt-8">
          <h1 className="text-3xl font-bold text-center mb-6">
            Hunt Complete! 🎯
          </h1>
          
          <div className="text-center mb-6">
            <p className="text-xl text-gray-700">
              You found <span className="font-bold text-green-600">{foundCount}</span> out of <span className="font-bold">{items.length}</span> items!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {items.map((item) => {
              const state = gameState[item.name];
              const isFound = state?.found || false;
              
              return (
                <div
                  key={item.name}
                  className={`relative rounded-lg overflow-hidden ${
                    isFound ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-100 border-2 border-gray-300'
                  }`}
                >
                  <div className="aspect-square relative">
                    {state?.thumbnail ? (
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={state.thumbnail}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.overlayPath}
                          alt={item.name}
                          className="w-24 h-24 opacity-30"
                        />
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                      <p className="text-sm font-medium capitalize">{item.name}</p>
                      <p className="text-xs">
                        {isFound ? '✓ Found' : '✗ Not Found'}
                        {state?.offline && ' (Offline)'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRestart}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}