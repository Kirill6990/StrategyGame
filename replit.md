# Global Politics RP

A real-time multiplayer nation-simulation and strategy game played on a world map. Players can create nations, join alliances or unions, declare wars, and participate in global diplomacy including UN sessions.

## Architecture

- **Frontend:** React 19 + Vite 6 + Tailwind CSS 4 + Konva (canvas map)
- **Backend:** Express + Socket.IO (real-time game state)
- **Language:** TypeScript (frontend and backend)
- **State Management:** Zustand (client-side)
- **AI Integration:** Google Gemini API (@google/genai)

## Project Structure

```
├── server.ts          # Express + Socket.IO backend (game logic)
├── src/
│   ├── App.tsx        # Main game UI
│   ├── store.ts       # Zustand state + Socket.IO client
│   ├── main.tsx       # React entry point
│   └── index.css      # Global styles
├── public/
│   └── world-map.png  # The game map image
├── index.html         # Frontend entry point
├── vite.config.ts     # Vite configuration
└── package.json
```

## How It Works

`server.ts` runs both the Express/Socket.IO backend AND serves the Vite frontend in development (via Vite middleware mode). It's a single unified server.

## Running the App

```bash
npm run dev
```

This starts the combined server on port 5000. In development, Vite serves the frontend with HMR through the Express middleware.

## Key Configuration

- Server port: 5000 (configurable via `PORT` env var)
- Vite: `allowedHosts: true` for Replit proxy compatibility
- Socket.IO: CORS set to `origin: '*'`
- Deployment: VM target (required for in-memory Socket.IO game state)

## Environment Variables

- `GEMINI_API_KEY` — Google Gemini API key (optional, for AI features)
- `APP_URL` — Public URL of the hosted app
- `PORT` — Server port (defaults to 5000)
