# 📱 Office Object Hunt

An interactive AR-style scavenger hunt game where players use their camera to find and identify office objects using AI-powered recognition.

![Office Object Hunt](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-green)

## 🎯 Overview

Office Object Hunt is a web-based scavenger hunt game that combines camera technology with AI object detection. Players navigate through a series of office items they need to find and photograph, with real-time AI validation using OpenAI's GPT-4o vision model.

## ✨ Features

- **🏠 Beautiful Home Page** - Welcoming interface with game instructions
- **📷 Camera Integration** - Real-time camera feed with target overlay
- **🤖 AI-Powered Detection** - OpenAI GPT-4o analyzes captured images
- **📊 Progress Tracking** - Visual progress indicator and game state management
- **🎉 Interactive Feedback** - Confetti animations and success messages
- **📱 Mobile Responsive** - Optimized for mobile devices and cameras
- **⚡ Real-time Processing** - Instant object recognition and feedback

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yashchitneni/amp-hack.git
   cd amp-hack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your OpenAI API key to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🎮 How to Play

1. **Start the Game** - Click "Start Hunt" on the home page
2. **Allow Camera Access** - Grant camera permissions when prompted
3. **Find Objects** - Point your camera at the target object shown
4. **Capture** - Tap the camera button to take a photo
5. **AI Validation** - Wait for AI to confirm if you found the correct item
6. **Progress** - Complete all 5 items to finish the hunt!

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **AI/ML**: OpenAI GPT-4o Vision API
- **Camera**: WebRTC Media API
- **State Management**: React Hooks + localStorage
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/classify/        # OpenAI API integration
│   │   ├── layout.tsx           # App layout
│   │   └── page.tsx             # Home page
│   ├── components/
│   │   ├── ArHunt.tsx           # Main camera interface
│   │   ├── GameManager.tsx      # Game state management
│   │   ├── Confetti.tsx         # Success animations
│   │   ├── FlashMessage.tsx     # User feedback
│   │   └── SummaryScreen.tsx    # Game completion
│   ├── hooks/
│   │   └── useGameState.ts      # Game state hook
│   └── types/
│       ├── game.ts              # Game type definitions
│       └── api.ts               # API type definitions
├── public/
│   └── items.json               # Game items configuration
└── ...config files
```

## 🔧 API Reference

### POST `/api/classify`

Analyzes an image to detect if it contains a specific object.

**Request Body:**
```json
{
  "image": "base64-encoded-image",
  "prompt": "Is the main object in this image a [object]? Reply 'yes' or 'no' only."
}
```

**Response:**
```json
{
  "result": "yes" | "no"
}
```

## 🎯 Game Items

The game includes 5 office objects to find:
- Water Bottle
- Chair  
- Keyboard
- Soda Can
- Backpack

Items are configured in `public/items.json` and can be customized.

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository to Vercel**
2. **Add environment variables:**
   - `OPENAI_API_KEY`: Your OpenAI API key
3. **Deploy automatically** - Vercel will build and deploy on every push

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o vision | ✅ Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **OpenAI** for the GPT-4o vision API
- **Next.js** team for the amazing framework
- **Vercel** for seamless deployment platform

## 📞 Support

For support, questions, or feature requests:
- Create an issue on GitHub
- Check the existing documentation
- Review the API reference above

---

**Made with ❤️ for the Amp Hack project**
