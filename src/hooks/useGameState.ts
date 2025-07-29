import { useState, useEffect } from 'react';
import { GameState } from '@/types/game';

const STORAGE_KEY = 'hunt_state_v1';

const initialState: GameState = {
  completedItems: [],
  currentItemIndex: 0,
  capturedPhotos: {},
  isComplete: false,
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialState);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        setGameState(parsedState);
      } catch (error) {
        console.error('Failed to parse saved game state:', error);
      }
    }
  }, []);

  const saveState = (newState: GameState) => {
    setGameState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  const completeItem = (itemName: string, photoUrl: string) => {
    const newCompletedItems = [...gameState.completedItems, itemName];
    const newCapturedPhotos = { ...gameState.capturedPhotos, [itemName]: photoUrl };
    const newCurrentIndex = gameState.currentItemIndex + 1;
    const isComplete = newCompletedItems.length === 5;

    const newState: GameState = {
      completedItems: newCompletedItems,
      currentItemIndex: newCurrentIndex,
      capturedPhotos: newCapturedPhotos,
      isComplete,
    };

    saveState(newState);
  };

  const resetGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGameState(initialState);
  };

  const getProgress = () => ({
    completed: gameState.completedItems.length,
    total: 5,
    percentage: Math.round((gameState.completedItems.length / 5) * 100),
  });

  return {
    gameState,
    completeItem,
    resetGame,
    getProgress,
  };
}
