'use client';

import { GameManager } from '@/components/GameManager';
import ArHunt from '@/components/ArHunt';

export default function Home() {
  return (
    <GameManager>
      {({ currentItem, onValidationResult, gameProgress }) => (
        <ArHunt
          currentItem={currentItem}
          onValidationResult={onValidationResult}
          gameProgress={gameProgress}
        />
      )}
    </GameManager>
  );
}
