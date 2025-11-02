# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack event search application that scrapes and displays events from Peatix (a Japanese event platform). The project follows a monorepo structure with separate backend (Python/FastAPI) and frontend (Next.js/React) directories.

## Architecture

### Monorepo Structure

```
peatix/
├── backend/          # Python backend with FastAPI
│   ├── api.py                 # FastAPI REST API server
│   ├── peatix_search.py       # Playwright-based scraper
│   └── requirements.txt       # Python dependencies
└── frontend/         # Next.js frontend with Shadcn/ui
    ├── app/                   # Next.js App Router pages
    ├── components/            # React components (UI + custom)
    ├── lib/                   # Utilities (cn helper)
    └── package.json           # Node.js dependencies
```

### Backend (Python + FastAPI)

**Location**: `backend/`

**Tech Stack**:
- FastAPI for REST API
- Playwright for browser automation
- Uvicorn as ASGI server

**Key Files**:
- `api.py`: FastAPI application with `/api/search` endpoint
  - CORS configured for `http://localhost:3000`
  - Pydantic models: `EventResponse`, `SearchResponse`
  - Error handling with HTTPException
- `peatix_search.py`: Async scraper function
  - Uses Playwright's async API
  - Launches headless Chromium with custom User-Agent
  - Selectors: `span.event-thumb_location`, `h3`, `time`
  - Returns up to 10 events per search

**Running Backend**:
```bash
cd backend
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
python api.py              # Starts on http://localhost:8000
```

**API Endpoints**:
- `GET /` - Root with API info
- `GET /api/search?keyword={query}` - Search events
- `GET /health` - Health check
- `GET /docs` - Auto-generated Swagger docs

### Frontend (Next.js + Shadcn/ui)

**Location**: `frontend/`

**Tech Stack**:
- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Shadcn/ui component library
- Lucide React for icons

**Key Files**:
- `app/page.tsx`: Main search page (client component with `"use client"`)
  - State: `keyword`, `loading`, `results`, `error`
  - Fetches from `http://localhost:8000/api/search`
  - Responsive layout with gradient background
- `components/event-card.tsx`: Event card component
  - Uses Shadcn Card, Button components
  - Displays title, datetime, location with icons
  - External link to Peatix event page
- `components/ui/`: Shadcn/ui components
  - `button.tsx`, `input.tsx`, `card.tsx`
  - Based on Radix UI primitives
- `lib/utils.ts`: `cn()` helper for className merging

**Running Frontend**:
```bash
cd frontend
npm run dev  # Starts on http://localhost:3000 with Turbopack
```

## Development Workflow

### Setup (First Time)

**Backend**:
```bash
cd backend
uv venv
uv pip install -r requirements.txt
source .venv/bin/activate && playwright install chromium
```

**Frontend**:
```bash
cd frontend
npm install
```

### Running Both Services

You need **two terminal windows**:

**Terminal 1 - Backend**:
```bash
cd backend
source .venv/bin/activate
python api.py
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

Then open http://localhost:3000

### Common Tasks

**Add a new Shadcn/ui component**:
```bash
cd frontend
npx shadcn@latest add [component-name]
```

**Update Python dependencies**:
```bash
cd backend
uv pip install [package]
# Then update requirements.txt
uv pip freeze > requirements.txt
```

**Update frontend dependencies**:
```bash
cd frontend
npm install [package]
```

## Important Implementation Details

### Backend

- **Wait Strategy**: Uses `wait_until='load'` + `asyncio.sleep(3)` instead of `networkidle` to avoid timeouts
- **Bot Detection**: Sets custom User-Agent to avoid Peatix's bot detection
- **Error Handling**: Individual event parsing errors are caught and skipped (backend/peatix_search.py:78-80)
- **CORS**: Configured to allow frontend origin (`http://localhost:3000`)

### Frontend

- **Client Component**: Main page uses `"use client"` directive for React hooks
- **API Base URL**: Hardcoded to `http://localhost:8000` - consider using environment variables for production
- **Error States**: Displays user-friendly error messages in red banner
- **Loading States**: Shows spinner and disables inputs during search
- **Responsive Design**: Uses Tailwind's responsive utilities and container classes

## CSS Architecture

The frontend uses Tailwind CSS with Shadcn/ui's design tokens:

- **CSS Variables**: Defined in `app/globals.css` using HSL color space
- **Dark Mode**: Supported via `class` strategy (toggle `.dark` class on html element)
- **Component Variants**: Using `class-variance-authority` (CVA) for button variants
- **Utility Helper**: `cn()` function merges Tailwind classes with `clsx` and `tailwind-merge`

## Known Limitations

- **Selector Fragility**: DOM selectors in `peatix_search.py` are tightly coupled to Peatix's current HTML structure
- **Rate Limiting**: No built-in rate limiting - avoid excessive requests
- **No Pagination**: Currently returns only first 10 events
- **Hardcoded API URL**: Frontend API URL should be configurable via environment variables
- **No Loading Progress**: Long scrapes (30+ seconds) show only binary loading state

## Security Considerations

- Never commit `.env` files with API keys
- The scraper should respect Peatix's robots.txt and terms of service
- Consider adding rate limiting to the API endpoint
- Validate and sanitize all user inputs in the API layer
