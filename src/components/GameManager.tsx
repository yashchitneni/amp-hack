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
