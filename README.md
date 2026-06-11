<div align="center">

# 🎨 WhiteBoard

**A modern, offline-first whiteboard for the web.**

Sketch ideas, draw diagrams, and jot notes on an infinite canvas — then manage,
share, and export your boards. No account, no backend, no friction.

[![React](https://img.shields.io/badge/React-18-149eca?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## ✨ Overview

FluidBoard started life as a small canvas drawing demo and has been rebuilt from
the ground up into a production-grade single-page application. Instead of
painting raw pixels, the canvas is driven by an **immutable element model** (an
Excalidraw-style scene graph). Every stroke, shape, and label is a serializable
object, which is what makes undo/redo, selection, infinite zoom, and
high-resolution export possible.

Everything is **local-first**: boards are persisted to the browser's
`localStorage` and auto-saved as you work. Sharing is achieved by encoding a
board directly into a URL — there is no server to run or pay for.

## 🚀 Features

### Drawing & tools
- ✏️ **Freehand pen** with smooth quadratic-curve rendering
- ⬛ **Shapes** — rectangle, ellipse, line, and arrow (with fill options)
- 🔤 **Text tool** with in-place editing
- 🖱️ **Selection tool** — click, shift-click, and marquee select; drag to move
- 🧽 **Eraser** — drag across elements to remove them
- 🎚️ Configurable **stroke color, fill, width, opacity, and font size**

### Canvas experience
- ♾️ **Infinite canvas** with pan (space-drag / middle-mouse) and zoom (⌘/Ctrl + scroll)
- 🔲 Toggleable **dot/line grid**
- ↩️ **Undo / redo** with a 100-step history
- ⌨️ **Keyboard shortcuts** for every tool and action
- 🔍 High-DPI rendering that stays crisp on retina displays

### Boards & sharing
- 🗂️ **Dashboard** to create, rename, duplicate, search, and delete boards
- 💾 **Auto-save** to local storage with a live "saved" indicator
- 🔗 **Shareable links** — board data is encoded in the URL; recipients fork their own copy
- 🖼️ **Export to PNG** at 2× resolution
- 📄 **Export to PDF** (jsPDF, lazy-loaded only when needed)

### Polish
- 🌗 **Dark & light themes** with no flash-of-wrong-theme on load
- 📱 **Responsive** layout for desktop, tablet, and mobile
- ♿ Accessible: focus rings, ARIA roles/labels, keyboard navigation, `aria-live` status
- 🧯 **Error boundary** so a single bad board can't blank the whole app

## 🖼️ Screenshots

> _Replace these placeholders with real captures before publishing._

| Dashboard | Editor (light) | Editor (dark) |
| --- | --- | --- |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Editor light](docs/screenshots/editor-light.png) | ![Editor dark](docs/screenshots/editor-dark.png) |

## 🧱 Tech stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | **React 18 + TypeScript** | Type-safe, component-driven UI |
| Build tool | **Vite 6** | Instant dev server, fast optimized builds |
| Styling | **Tailwind CSS 3** | Consistent, themeable, responsive design system |
| State | **Zustand** | Minimal, ergonomic global state with persistence middleware |
| Routing | **React Router 6** | Dashboard / editor / share routes |
| Icons | **lucide-react** | Clean, consistent icon set |
| PDF export | **jsPDF** | Client-side PDF generation |

## 🏗️ Architecture

```
src/
├── main.tsx                 # App entry, router + theme bootstrap
├── App.tsx                  # Route definitions (lazy-loaded pages)
├── types/                   # Domain types (elements, boards)
├── lib/                     # Framework-agnostic logic
│   ├── drawing.ts           #   canvas rendering (scene → pixels)
│   ├── geometry.ts          #   bounds, hit-testing, transforms
│   ├── export.ts            #   PNG / PDF export
│   ├── share.ts             #   URL encode/decode of boards
│   ├── storage.ts           #   safe localStorage helpers
│   └── constants.ts         #   tools, palette, storage keys
├── store/                   # Zustand stores
│   ├── useBoardStore.ts     #   persisted board CRUD
│   ├── useEditorStore.ts    #   tools, viewport, selection, undo/redo
│   └── useThemeStore.ts     #   light/dark theme
├── hooks/                   # useAutoSave, useKeyboardShortcuts, useElementSize
├── components/              # UI (editor/, dashboard/, ui/)
└── pages/                   # Dashboard, Editor, SharedImport, NotFound
```

**Key design decisions**

- **Element model over raster pixels.** The canvas re-renders from an ordered
  array of elements every frame. This is the foundation for undo/redo,
  selection, zoom, and lossless export.
- **Separation of concerns.** All canvas math (`lib/`) is pure and
  framework-agnostic, so it's easy to reason about and test. React components
  stay thin.
- **Local-first.** No backend means zero hosting cost and instant load. State
  lives in Zustand and is mirrored to `localStorage`.
- **Performance.** Pointer interactions are tracked in refs to avoid re-renders;
  pages and the heavy PDF library are code-split and lazy-loaded.

## 🛠️ Getting started

**Prerequisites:** Node.js 18+ and npm.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (http://localhost:5173)
npm run dev

# 3. Create an optimized production build
npm run build

# 4. Preview the production build locally
npm run preview
```

### Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check without emitting |
| `npm run format` | Format the codebase with Prettier |

## 🔧 Configuration

Environment variables are optional. Copy the example file to customize:

```bash
cp .env.example .env
```

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_APP_NAME` | `FluidBoard` | App name shown in the UI and `<title>` |
| `VITE_PUBLIC_BASE_URL` | _(current origin)_ | Base URL for generating share links |

## ⌨️ Keyboard shortcuts

| Key | Action | | Key | Action |
| --- | --- | --- | --- | --- |
| `V` | Select | | `T` | Text |
| `P` | Pen | | `E` | Eraser |
| `R` | Rectangle | | `⌘/Ctrl + Z` | Undo |
| `O` | Ellipse | | `⌘/Ctrl + Shift + Z` | Redo |
| `L` | Line | | `⌘/Ctrl + A` | Select all |
| `A` | Arrow | | `Delete` | Delete selection |
| `Space + drag` | Pan | | `⌘/Ctrl + scroll` | Zoom |

## ☁️ Deployment (Vercel)

This repo ships with a `vercel.json` preconfigured for a Vite SPA (build command,
output directory, and SPA rewrites for client-side routing).

**Option A — Dashboard**
1. Push the repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects Vite. Click **Deploy**. Done.

**Option B — CLI**
```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production deployment
```

The app is fully static, so it also deploys cleanly to Netlify, GitHub Pages,
Cloudflare Pages, or any static host (remember to add an SPA fallback rewrite to
`index.html`).

## 🧭 Roadmap

- [ ] Real-time multiplayer collaboration (WebRTC / CRDT)
- [ ] Element resizing and rotation handles
- [ ] Layers and grouping
- [ ] Sticky notes and image import
- [ ] Cloud sync as an optional backend

## 📄 License

[MIT](LICENSE) © FluidBoard
