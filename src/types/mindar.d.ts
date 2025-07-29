declare module 'mind-ar/dist/mindar-image.prod.js' {
  export class Compiler {
    compileImageTargets(images: Blob[], progressCallback?: (progress: number) => void): Promise<unknown>;
  }

  export class Controller {
    constructor(options: {
      container: HTMLElement;
      uiLoading: string;
      uiScanning: string;
      uiError: string;
    });
    
    addImageTargets(targetData: unknown): void;
    startAR(): Promise<void>;
    stopAR(): void;
    onUpdate(callback: (data: unknown) => void): void;
  }
}

declare module 'mind-ar' {
  export * from 'mind-ar/dist/mindar-image.prod.js';
}
