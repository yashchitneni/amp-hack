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
    id: 'mug',
    name: 'Coffee Mug',
    overlayUrl: '/targets/mug.svg',
    prompt: "Is the main object in this image a coffee mug? Reply 'yes' or 'no' only.",
  },
  {
    id: 'stapler',
    name: 'Stapler',
    overlayUrl: '/targets/stapler.svg',
    prompt: "Is the main object in this image a stapler? Reply 'yes' or 'no' only.",
  },
];
