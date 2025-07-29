// src/app/api/classify/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { image, prompt } = await req.json();

  if (!image || !prompt) {
    return NextResponse.json({ error: 'Image data and prompt are required' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
  }

  // The image is a data URL (e.g., "data:image/jpeg;base64,..."). We need to extract the base64 part.
  const base64ImageData = image.split(',')[1];

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-vision:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64ImageData,
              },
            },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch from Gemini API' }, { status: response.status });
    }

    const data = await response.json();

    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() ?? 'no';

    if (textResponse.includes('yes')) {
      return NextResponse.json({ result: 'yes' });
    } else {
      return NextResponse.json({ result: 'no' });
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
