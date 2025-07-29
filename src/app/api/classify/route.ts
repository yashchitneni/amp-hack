import { NextRequest, NextResponse } from 'next/server';
import type { ClassifyRequest, ClassifyResponse, GeminiRequest, GeminiResponse } from '@/types/api';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-vision:generateContent';
const API_TIMEOUT = 10000; // 10 seconds

async function downsampleImage(base64Image: string): Promise<string> {
  // Basic server-side downsampling simulation
  // In production, consider using sharp or similar for actual image processing
  
  // For now, we'll return the image as-is
  // In a real implementation, you'd decode, resize, and re-encode
  return base64Image;
}

async function callGeminiAPI(downsampledImage: string, itemName: string): Promise<boolean> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const prompt = `Is the main object in this image a ${itemName}? Reply 'yes' or 'no' only.`;
  
  const requestBody: GeminiRequest = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: 'image/jpeg',
            data: downsampledImage
          }
        }
      ]
    }]
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    const responseText = data.candidates[0].content.parts[0].text.toLowerCase().trim();
    return responseText === 'yes';
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ClassifyRequest = await request.json();
    
    if (!body.image || !body.itemName) {
      return NextResponse.json(
        { error: 'Missing required fields: image and itemName' },
        { status: 400 }
      );
    }

    try {
      // Downsample the image
      const downsampledImage = await downsampleImage(body.image);
      
      // Call Gemini API
      const isMatch = await callGeminiAPI(downsampledImage, body.itemName);
      
      const response: ClassifyResponse = {
        success: isMatch
      };
      
      return NextResponse.json(response);
    } catch (apiError) {
      console.error('Gemini API error:', apiError);
      
      // Offline fallback - auto-pass
      const fallbackResponse: ClassifyResponse = {
        success: true,
        offline: true
      };
      
      return NextResponse.json(fallbackResponse);
    }
  } catch (error) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
