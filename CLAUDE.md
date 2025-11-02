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
- SQLAlchemy for ORM and database management
- SQLite for development database
- OpenAI API for AI recommendations (planned)
- Uvicorn as ASGI server

**Key Files**:
- `api.py`: FastAPI application with REST endpoints
  - CORS configured for `http://localhost:3000`
  - Database initialization on startup
  - Topic Management CRUD endpoints
  - Event search endpoint
  - Error handling with HTTPException
- `database.py`: SQLAlchemy models and database setup
  - Models: `Topic`, `Recommendation`, `Notification`
  - Relationships with cascade delete
  - `get_db()` dependency for FastAPI
- `schemas.py`: Pydantic schemas for request/response validation
  - Topic schemas: `TopicCreate`, `TopicUpdate`, `TopicResponse`
  - Recommendation and Notification schemas
  - Search response schemas
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
- `GET /api/topics` - List all registered topics
- `POST /api/topics` - Create a new topic
- `PUT /api/topics/{id}` - Update a topic
- `DELETE /api/topics/{id}` - Delete a topic
- `GET /health` - Health check
- `GET /docs` - Auto-generated Swagger docs

**Database**:
- SQLite database stored as `peatix_ai.db` in backend directory
- Auto-initialized on server startup via `init_db()` in `api.py`
- Tables: `topics`, `recommendations`, `notifications`
- **Relationships**:
  - `Topic` → `Recommendation` (one-to-many, cascade delete)
  - `Topic` → `Notification` (one-to-many, cascade delete)
  - When a topic is deleted, all associated recommendations and notifications are automatically deleted
- **Important Fields**:
  - `topics.user_id`: Currently defaults to "default" (future: JWT authentication)
  - `topics.notification_frequency`: "daily" | "weekly" | "custom"
  - `topics.is_active`: Boolean toggle for enabling/disabling notifications
  - `recommendations.ai_score`: Float 0.0-1.0 (planned for AI feature)
  - `notifications.status`: "sent" | "failed" (planned for notification feature)

### Frontend (Next.js + Shadcn/ui)

**Location**: `frontend/`

**Tech Stack**:
- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Shadcn/ui component library
- Lucide React for icons

**Key Files**:
- `app/page.tsx`: Event search page (client component with `"use client"`)
  - State: `keyword`, `loading`, `results`, `error`
  - Fetches from `http://localhost:8000/api/search`
  - Responsive layout with gradient background
- `app/topics/page.tsx`: Topic management page
  - CRUD operations for topics
  - Toggle notification settings
  - Dialog for creating new topics
  - Uses Switch, Dialog, Select components
- `components/navigation.tsx`: Navigation bar component
  - Links to search and topics pages
  - Active state highlighting
  - Sticky header with backdrop blur
- `components/event-card.tsx`: Event card component
  - Uses Shadcn Card, Button components
  - Displays title, datetime, location with icons
  - External link to Peatix event page
- `components/ui/`: Shadcn/ui components
  - `button.tsx`, `input.tsx`, `card.tsx`, `dialog.tsx`, `select.tsx`, `switch.tsx`, `badge.tsx`
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

**Lint frontend code**:
```bash
cd frontend
npm run lint
```

**Build frontend for production**:
```bash
cd frontend
npm run build
npm start  # Run production build
```

**Initialize or reset database**:
```bash
cd backend
source .venv/bin/activate
python database.py  # Creates all tables
# Or delete peatix_ai.db and restart api.py (auto-initializes)
```

**Direct database access (SQLite CLI)**:
```bash
cd backend
sqlite3 peatix_ai.db
# Then use SQL commands:
# .tables          - List all tables
# .schema topics   - Show table schema
# SELECT * FROM topics;
# .quit            - Exit
```

**Test scraper independently**:
```bash
cd backend
source .venv/bin/activate
python peatix_search.py "AI"  # Replace "AI" with any keyword
# This runs the scraper standalone without the API server
```

**Debug Playwright issues**:
```bash
# Run browser in non-headless mode (modify peatix_search.py temporarily)
# Change: headless=True → headless=False
# Or take screenshots for debugging (already saves peatix_page.png on errors)
```

## Important Implementation Details

### Backend

- **Wait Strategy**: Uses `wait_until='load'` + `asyncio.sleep(3)` instead of `networkidle` to avoid timeouts
- **Bot Detection**: Sets custom User-Agent to avoid Peatix's bot detection
- **Error Handling**: Individual event parsing errors are caught and skipped (backend/peatix_search.py:78-80)
- **CORS**: Configured to allow frontend origin (`http://localhost:3000`)

### Frontend

- **Client Components**: Pages use `"use client"` directive for React hooks (useState, useEffect)
- **API Base URL**: Hardcoded to `http://localhost:8000` - consider using environment variables for production
- **Error States**: Displays user-friendly error messages in red banner with retry buttons
- **Loading States**: Shows spinner and disables inputs during async operations
- **Responsive Design**: Uses Tailwind's responsive utilities and container classes
- **Navigation**: Navigation component uses Next.js `usePathname()` for active state highlighting
- **Topic Management Flow**:
  1. Fetch topics from API on page load
  2. Create: Opens dialog → validates input → POST request → refreshes list
  3. Update: Toggle switch → PUT request → refreshes list
  4. Delete: Confirmation prompt → DELETE request → refreshes list

## CSS Architecture

The frontend uses Tailwind CSS with Shadcn/ui's design tokens:

- **CSS Variables**: Defined in `app/globals.css` using HSL color space
- **Dark Mode**: Supported via `class` strategy (toggle `.dark` class on html element)
- **Component Variants**: Using `class-variance-authority` (CVA) for button variants
- **Utility Helper**: `cn()` function merges Tailwind classes with `clsx` and `tailwind-merge`

## Data Flow Architecture

### Event Search Flow
1. User enters keyword in `frontend/app/page.tsx`
2. Frontend sends GET request to `backend/api.py` `/api/search?keyword={keyword}`
3. Backend calls `peatix_search.py` async function
4. Playwright launches headless browser, navigates to Peatix
5. Scrapes event data (title, datetime, location, url)
6. Returns JSON array to frontend
7. Frontend displays events using `EventCard` components

### Topic Management Flow
1. User navigates to `frontend/app/topics/page.tsx`
2. Page fetches topics from `GET /api/topics`
3. Backend queries SQLite database via SQLAlchemy
4. User performs CRUD operations (POST/PUT/DELETE)
5. Backend validates via Pydantic schemas
6. Database updates with cascade deletes for relationships
7. Frontend refreshes list after each operation

### Future: AI Recommendation Flow (Planned)
See `FEATURE_DESIGN.md` for detailed AI recommendation architecture using OpenAI API.

## Known Limitations

- **Selector Fragility**: DOM selectors in `peatix_search.py` are tightly coupled to Peatix's current HTML structure
- **Rate Limiting**: No built-in rate limiting - avoid excessive requests
- **No Pagination**: Currently returns only first 10 events from search
- **Hardcoded API URL**: Frontend API URL should be configurable via environment variables
- **No Loading Progress**: Long scrapes (30+ seconds) show only binary loading state
- **No Tests**: No unit tests or integration tests currently implemented
- **Single User Mode**: Database uses `user_id="default"` - authentication system not yet implemented

## Security Considerations

- Never commit `.env` files with API keys (already in `.gitignore`)
- The scraper should respect Peatix's robots.txt and terms of service
- Consider adding rate limiting to the API endpoint
- All user inputs are validated via Pydantic schemas in `schemas.py`
- Database uses parameterized queries via SQLAlchemy (prevents SQL injection)
- Topic keyword has duplicate checking to prevent redundant entries
- CORS is restricted to `http://localhost:3000` only

## Environment Variables

Required for future AI features (see `FEATURE_DESIGN.md`):

```bash
# backend/.env
OPENAI_API_KEY=sk-...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
NOTIFICATION_EMAIL=notifications@example.com
```

## Future Roadmap

See `FEATURE_DESIGN.md` for detailed implementation plan:

### Phase 1: Foundation (✅ Completed)
- Database models for topics, recommendations, notifications
- Topic management CRUD API
- Frontend topic management page

### Phase 2: AI Recommendations (Planned)
- OpenAI API integration for event analysis
- AI scoring and ranking system
- Recommendation storage and retrieval

### Phase 3: Notification System (Planned)
- APScheduler for periodic event searches
- Email notifications via SMTP
- Notification history tracking

### Phase 4: Advanced Features (Future)
- User authentication (JWT/OAuth2)
- Push notifications
- Multi-platform event sources
- Machine learning-based personalization
