# Office Object Hunt - Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Google Gemini API Key**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Deployment Steps

### 1. Connect GitHub Repository

1. Log into your Vercel dashboard
2. Click "New Project"
3. Import your GitHub repository: `https://github.com/yashchitneni/amp-hack`
4. Select the `office-object-hunt` directory as the root directory

### 2. Configure Environment Variables

In your Vercel project settings:

1. Go to "Settings" → "Environment Variables"
2. Add the following variable:
   - **Variable Name**: `GEMINI_API_KEY`
   - **Value**: Your Google Gemini API key
   - **Environment**: Production, Preview, Development (all)

### 3. Deploy

1. Click "Deploy" - Vercel will automatically:
   - Install dependencies with `npm install`
   - Build the project with `npm run build`
   - Deploy the application

## Project Configuration

### Next.js Configuration
- **Build Output**: Standalone (optimized for serverless)
- **Security Headers**: Added for production security
- **Package Optimization**: React packages optimized for faster builds

### API Routes
- **Classify API**: `/api/classify` - Handles image classification with Gemini AI
- **Function Timeout**: 30 seconds (configured in vercel.json)
- **Fallback Mode**: Auto-passes when API is offline

### Camera & AR Features
- **WebRTC Support**: Built-in browser camera access
- **AR Library**: Mind AR for augmented reality functionality
- **Responsive Design**: Works on desktop and mobile devices

## Environment Variables

Create a `.env.local` file for local development:

```bash
GEMINI_API_KEY=your_api_key_here
```

## Build Verification

The project successfully builds with:
- ✅ Next.js 14.2.30 compilation
- ✅ TypeScript type checking
- ✅ ESLint validation (1 minor warning)
- ✅ Static page generation
- ✅ API route bundling

## Domain Configuration

After deployment:
1. Your app will be available at `https://your-project-name.vercel.app`
2. Optionally configure a custom domain in Vercel settings

## Troubleshooting

### Common Issues:

1. **API Key Not Found**
   - Verify `GEMINI_API_KEY` is set in Vercel environment variables
   - Redeploy after adding environment variables

2. **Camera Access Issues**
   - Ensure HTTPS is enabled (automatic on Vercel)
   - Check browser permissions for camera access

3. **Build Failures**
   - Check build logs in Vercel dashboard
   - Verify all dependencies are in package.json

## Performance Optimization

- Static pages are pre-rendered for faster loading
- API route is optimized for serverless execution
- Security headers added for production safety
- Package imports optimized for smaller bundle size

## Support

For deployment issues:
- Check Vercel build logs
- Review Next.js documentation
- Verify API key permissions in Google AI Studio
