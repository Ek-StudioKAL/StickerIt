# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server on localhost:3000 (host 0.0.0.0)
npm run build    # production build
npm run lint     # TypeScript type-check only (tsc --noEmit); no ESLint configured
npm run preview  # preview production build
```

No test framework is configured.

## Architecture

Single-page React 19 + TypeScript app built with Vite 6 and Tailwind CSS v4. The app transforms photos into cartoon Telegram stickers using Google Gemini image generation models.

### Key files
- `src/App.tsx` — root component; wires state hook to layout and modals
- `src/hooks/useAppState.ts` — all state (`AppState`), AI calls, canvas rendering, file handling
- `src/components/` — extracted UI components (see below)
- `src/index.css` — Tailwind v4 import + Google Fonts; uses `@theme` block (no `tailwind.config.js`)
- `vite.config.ts` — injects `GEMINI_API_KEY` / `API_KEY` from `.env` into `process.env` at build time
- `index.html` — app shell

### AI integration
- Client: `@google/genai` (`GoogleGenAI`)
- Image generation: `gemini-2.5-flash-image` (characterize photo → sticker, apply mood)
- Text generation: `gemini-3-flash-preview` (magic caption ideas, JSON mode)
- API key read from `process.env.API_KEY` or `process.env.GEMINI_API_KEY`
- `window.aistudio` is injected when running inside Google AI Studio iframe for API key selection

### State management
All state lives in `useAppState` (custom hook). The `AppState` interface includes: image data, crop state, character base64, mood/tone/caption, text/sticker style, outline settings, AI settings, history, and `activeTab` (mobile navigation). No external state library.

Canvas rendering is done imperatively via `useCallback(renderCanvas, [...deps])` + `useEffect`.

### Layout pattern
- Desktop: `grid grid-cols-1 lg:grid-cols-12` — left 5 cols (canvas + controls), right 7 cols (panels)
- Mobile: bottom tab bar (`MobileNav`) with 4 tabs; each tab renders a dedicated component
- `Card` component wraps every panel section with a title + icon header

### Components
| File | Purpose |
|---|---|
| `src/components/MobileNav.tsx` | Sticky bottom tab bar (mobile only) |
| `src/components/MobilePreviewTab.tsx` | Mobile Preview tab: canvas + history + upload |
| `src/components/MobileGenerateTab.tsx` | Mobile Generate tab: characterize + mood |
| `src/components/MobileStyleTab.tsx` | Mobile Style tab: caption + styling controls |
| `src/components/MobileExportTab.tsx` | Mobile Export tab: export buttons + outline |
| `src/components/CanvasPanel.tsx` | Canvas, drag-drop, upload overlay, spinner |
| `src/components/HistoryStrip.tsx` | Horizontal history thumbnail strip |
| `src/components/CharacterizeCard.tsx` | Upload + Generate Character card |
| `src/components/MoodCard.tsx` | Mood chip grid + Apply Mood |
| `src/components/StyleCard.tsx` | All text + sticker styling controls |
| `src/components/ExportCard.tsx` | Export size buttons + outline options |
| `src/components/SettingsModal.tsx` | AI prompt editing modal |
| `src/components/CropModal.tsx` | Image crop modal |
| `src/components/StepIndicator.tsx` | Desktop workflow progress (1→5 steps) |

### Tailwind v4
Configuration is in `src/index.css` via `@theme { ... }` — there is no `tailwind.config.js`. Custom tokens go in that block.

### Path alias
`@/` maps to the repo root (configured in both `vite.config.ts` and `tsconfig.json`).
