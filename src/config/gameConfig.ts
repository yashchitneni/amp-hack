// src/config/gameConfig.ts
export interface TargetObject {
  id: string;
  name: string;
  overlayUrl: string;
  prompt: string;
}

export const TARGET_OBJECTS: TargetObject[] = [
  {
    id: 'bottle',
    name: 'Water Bottle',
    overlayUrl: '/targets/bottle.svg',
    prompt: "Is the main object in this image a water bottle? Reply 'yes' or 'no' only.",
  },
  {
    id: 'chair',
    name: 'Chair',
    overlayUrl: '/targets/chair.svg',
    prompt: "Is the main object in this image a chair? Reply 'yes' or 'no' only.",
  },
  {
    id: 'keyboard',
    name: 'Keyboard',
    overlayUrl: '/targets/keyboard.svg',
    prompt: "Is the main object in this image a keyboard? Reply 'yes' or 'no' only.",
  },
  {
    id: 'soda',
    name: 'Soda Can',
    overlayUrl: '/targets/soda.svg',
    prompt: "Is the main object in this image a soda can? Reply 'yes' or 'no' only.",
  },
  {
    id: 'backpack',
    name: 'Backpack',
    overlayUrl: '/targets/backpack.svg',
    prompt: "Is the main object in this image a backpack? Reply 'yes' or 'no' only.",
  },
];
