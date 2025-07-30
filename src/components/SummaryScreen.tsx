'use client';

import { Item } from '@/types/game';
import { useGameState } from '@/hooks/useGameState';
import Image from 'next/image';

interface SummaryScreenProps {
  items: Item[];
  onRestart: () => void;
}

export function SummaryScreen({ items, onRestart }: SummaryScreenProps) {
  const { gameState } = useGameState();

  const getItemStatus = (itemName: string) => {
    return gameState.completedItems.includes(itemName);
  };

  const getItemPhoto = (itemName: string) => {
    return gameState.capturedPhotos[itemName];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {gameState.isComplete ? '🎉 Hunt Complete!' : 'Progress Summary'}
          </h1>
          <p className="text-lg text-gray-600">
            {gameState.completedItems.length} of {items.length} items found
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {items.map((item) => {
            const isCompleted = getItemStatus(item.name);
            const photoUrl = getItemPhoto(item.name);

            return (
              <div
                key={item.name}
                className={`rounded-lg p-6 shadow-lg transition-all ${
                  isCompleted 
                    ? 'bg-green-50 border-2 border-green-200' 
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold capitalize text-gray-800">
                    {item.name}
                  </h3>
                  <div className={`text-2xl ${isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                    {isCompleted ? '✓' : '✗'}
                  </div>
                </div>

                {photoUrl ? (
                  <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                    <Image
                      src={photoUrl}
                      alt={`Captured ${item.name}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-gray-400 text-center">
                      <div className="text-4xl mb-2">📸</div>
                      <div>No photo captured</div>
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-600">
                  Target: {item.promptFragment}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={onRestart}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors"
          >
            🔄 Start New Hunt
          </button>
        </div>
      </div>
    </div>
  );
}
