import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  console.log('🔍 API classify called at:', new Date().toISOString());
  
  try {
    const { image, itemName } = await request.json();
    console.log('📥 Request data:', { imageLength: image?.length, itemName });
    
    if (!image || !itemName) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('🔑 API Key status:', apiKey ? `SET (${apiKey.substring(0, 10)}...)` : 'NOT SET');
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not configured - using offline mode');
      return NextResponse.json(
        { match: true, offline: true, reason: 'No API key' },
        { status: 200 }
      );
    }
    
    const prompt = `Is the main object in this image ${itemName}? Reply "yes" or "no" only.`;
    console.log('🤖 Sending to Gemini:', { prompt, imageSize: image.length });
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: image
                }
              },
              {
                text: prompt
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 10,
            response_mime_type: "text/plain"
          }
        })
      }
    );
    
    console.log('📡 Gemini response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Gemini API error:', response.status);
      const errorText = await response.text();
      console.error('❌ Error details:', errorText);
      return NextResponse.json(
        { match: true, offline: true, reason: `API error ${response.status}` },
        { status: 200 }
      );
    }
    
    const data = await response.json();
    console.log('📦 Full Gemini response:', JSON.stringify(data, null, 2));
    
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();
    console.log('🎯 Gemini raw answer:', `"${answer}"`);
    console.log('🔍 Answer comparison:', { 
      answer, 
      isYes: answer === 'yes',
      includes_yes: answer?.includes('yes'),
      includes_no: answer?.includes('no')
    });
    
    const match = answer === 'yes';
    console.log('✅ Final result:', { match, offline: false });
    
    return NextResponse.json({
      match: answer === 'yes',
      offline: false
    });
    
  } catch (error) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { match: true, offline: true },
      { status: 200 }
    );
  }
}