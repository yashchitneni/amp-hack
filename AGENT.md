# Office Object Hunt - AR Game

## Project Overview
This is an augmented reality scavenger hunt game built with Next.js 14 where players use their phone's camera to find office objects.

## Key Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production 
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API Routes with Edge Functions
- **AI Integration**: Google Gemini 1.5 Pro Vision for object recognition
- **State Management**: React useState with localStorage
- **Deployment**: Vercel

## Environment Variables
- `GEMINI_API_KEY` - Google AI Gemini API key (required)

## Key Files
- `src/config/gameConfig.ts` - Game objects configuration
- `src/components/GameClient.tsx` - Main game component with camera/AR
- `src/app/api/classify/route.ts` - AI validation API endpoint
- `src/app/page.tsx` - Main page
- `public/targets/` - Target object overlay images (SVG)

## Game Flow
1. Welcome screen → Start Hunt button
2. Camera permission → Live camera feed
3. For each target object:
   - Show overlay hint image
   - Capture photo → Send to AI validation
   - Show success/failure feedback
4. Final summary screen

## Testing
- Access on mobile browser for camera functionality
- Use https for camera permissions on mobile
- Test with actual Gemini API key for object recognition

## Deployment Notes
- Add Gemini API key in Vercel environment variables
- Ensure mobile-friendly camera access over HTTPS
