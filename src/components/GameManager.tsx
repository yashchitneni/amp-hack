'use client';

import { useState, useEffect } from 'react';
import { Item, ValidationResult } from '@/types/game';
import { useGameState } from '@/hooks/useGameState';
import { Confetti } from './Confetti';
import { FlashMessage } from './FlashMessage';
import { SummaryScreen } from './SummaryScreen';

interface GameManagerProps {
  children: (props: {
    currentItem: Item | null;
    onValidationResult: (result: ValidationResult, photoUrl?: string) => void;
    gameProgress: { completed: number; total: number; percentage: number };
  }) => React.ReactNode;
}

export function GameManager({ children }: GameManagerProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [flashMessage, setFlashMessage] = useState<{
    message: string;
    type: 'success' | 'error';
    show: boolean;
  }>({ message: '', type: 'success', show: false });
  const [showSummary, setShowSummary] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const { gameState, completeItem, resetGame, getProgress } = useGameState();

  useEffect(() => {
    fetch('/items.json')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error('Failed to load items:', err));
  }, []);

  const currentItem = items.length > 0 && gameState.currentItemIndex < items.length
    ? items[gameState.currentItemIndex]
    : null;

  const handleValidationResult = (result: ValidationResult, photoUrl?: string) => {
    if (result.success && currentItem && photoUrl) {
      completeItem(currentItem.name, photoUrl);
      
      setFlashMessage({
        message: `Great! You found the ${currentItem.name}!`,
        type: 'success',
        show: true,
      });
      
      setShowConfetti(true);
      
      setTimeout(() => {
        if (gameState.completedItems.length + 1 === items.length) {
          setTimeout(() => setShowSummary(true), 1000);
        }
      }, 1000);
    } else {
      setFlashMessage({
        message: 'Not quite right, try again!',
        type: 'error',
        show: true,
      });
    }
  };

  const handleRestart = () => {
    resetGame();
    setShowSummary(false);
    setShowConfetti(false);
    setFlashMessage({ message: '', type: 'success', show: false });
    setGameStarted(false);
  };

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleFlashComplete = () => {
    setFlashMessage(prev => ({ ...prev, show: false }));
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
  };

  if (showSummary || gameState.isComplete) {
    return (
      <SummaryScreen
        items={items}
        onRestart={handleRestart}
      />
    );
  }

  // Show home page before game starts
  if (!gameStarted) {
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
              <p className="text-left text-gray-700">Tap the camera button when you see the item</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <p className="text-left text-gray-700">Find all 5 items to complete the hunt</p>
            </div>
          </div>
          
          <button 
            onClick={handleStartGame}
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

  return (
    <>
      {children({
        currentItem,
        onValidationResult: handleValidationResult,
        gameProgress: getProgress(),
      })}
      
      <Confetti 
        show={showConfetti} 
        onComplete={handleConfettiComplete} 
      />
      
      <FlashMessage
        message={flashMessage.message}
        type={flashMessage.type}
        show={flashMessage.show}
        onComplete={handleFlashComplete}
      />
    </>
  );
}
