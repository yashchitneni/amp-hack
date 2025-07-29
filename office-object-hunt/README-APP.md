# Office Object Hunt - AR Scavenger Game

A browser-based AR scavenger hunt game that demonstrates capture/validate loops using computer vision. Find 5 office items using your camera!

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Gemini API Key:**
   - Copy `.env.example` to `.env.local`
   - Add your Gemini API key to `.env.local`:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Visit http://localhost:3000 (or the port shown in terminal)
   - Works best on mobile devices with camera

## Deployment to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add `GEMINI_API_KEY` in Vercel project settings (Environment Variables)
4. Deploy!

## Features

- ✅ Browser-only AR experience (no app install required)
- ✅ Works on iOS Safari 15+ and Android Chrome 12+
- ✅ 5 office items to find: bottle, mug, stapler, keyboard, chair
- ✅ Draggable overlay for precise alignment
- ✅ AI-powered object recognition using Gemini Vision
- ✅ Offline fallback mode
- ✅ Progress tracking with localStorage
- ✅ Summary screen with captured thumbnails

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- MindAR (camera access)
- Gemini 1.5 Pro Vision API
- Vercel Edge Functions

## Game Flow

1. Start Hunt → Camera permission request
2. Live camera view with semi-transparent overlay
3. Align overlay with real object and tap capture
4. AI validates the object match
5. Success → Confetti animation → Next item
6. Complete all 5 items → Summary screen

## Acceptance Criteria Met

- ✅ Opens on iPhone Safari & Android Chrome without errors
- ✅ Object recognition with ≤2 attempts
- ✅ Summary screen shows all items with status
- ✅ Edge function response ≤ 3s (256px image optimization)
- ✅ Offline fallback prevents demo failures