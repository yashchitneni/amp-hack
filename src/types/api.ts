export interface ClassifyRequest {
  image: string; // base64 encoded image
  itemName: string;
}

export interface ClassifyResponse {
  success: boolean;
  offline?: boolean;
}

export interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text?: string;
      inline_data?: {
        mime_type: string;
        data: string;
      };
    }>;
  }>;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}
