// src/app/api/classify/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { image, prompt } = await req.json();

  if (!image || !prompt) {
    return NextResponse.json({ error: 'Image data and prompt are required' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: image,
                  detail: 'low' // Use 'low' for faster processing and lower cost
                }
              }
            ]
          }
        ],
        max_tokens: 10,
        temperature: 0
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch from OpenAI API' }, { status: response.status });
    }

    const data = await response.json();

    const textResponse = data.choices?.[0]?.message?.content?.trim().toLowerCase() ?? 'no';

    if (textResponse.includes('yes')) {
      return NextResponse.json({ result: 'yes' });
    } else {
      return NextResponse.json({ result: 'no' });
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
