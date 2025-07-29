declare module 'mind-ar/dist/mindar-image.prod.js' {
  export class MindARImage {
    constructor(options: {
      container: HTMLElement;
      imageTargetSrc?: string;
      maxTrack?: number;
      filterMinCF?: number;
      filterBeta?: number;
      warmupTolerance?: number;
      missTolerance?: number;
    });
    
    start(): Promise<void>;
    stop(): void;
    addAnchor(targetIndex: number): unknown;
  }
}