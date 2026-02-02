# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Palette Arena (调色竞技场) is a photo color grading evaluation platform for comparing two photographers' color grading techniques. It supports A/B comparison voting and single photo rating modes with blind evaluation.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173/Palette-Arena/)
npm run dev

# Build for production (TypeScript compilation + Vite build)
npm run build

# Preview production build
npm run preview
```

## Environment Configuration

Optional environment variables in `.env` file (credentials are embedded for development):

- `VITE_BMOB_APP_ID` - Bmob Application ID
- `VITE_BMOB_REST_API_KEY` - Bmob REST API Key
- `VITE_SMMS_TOKEN` - SM.MS image hosting API token (only needed for file upload mode)

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **Backend**: Bmob (BaaS for data storage)
- **Image Hosting**: SM.MS API (optional)
- **Charts**: Recharts

### Data Model (Bmob)

**Photo Table**
- `url`: Image URL
- `author`: "A" or "B"
- `originalId`: Identifier linking A/B versions of same original photo
- `title`: Optional title

**Vote Table**
- `originalId`: Links to photo pair
- `winner`: "A" or "B"
- `voter`: Voter nickname

**Rating Table**
- `photoId`: Photo object ID
- `score`: 1-5 stars
- `voter`: Rater nickname

### Application Structure

**Routes** (`src/App.tsx`):
- `/` - Home page with mode selection
- `/compare` - A/B comparison voting mode
- `/rate` - Single photo rating mode
- `/dashboard` - Statistics dashboard (password protected)
- `/admin` - Photo management page (password protected)

**Key Services**:
- `src/services/bmob.ts` - All Bmob REST API operations (CRUD for photos, votes, ratings, statistics)
- `src/services/smms.ts` - SM.MS image upload integration (optional)

**Admin Page** (`src/pages/Admin.tsx`):
- Two upload modes: URL mode (direct image URLs) and File mode (upload via SM.MS)
- Photo management: view, delete, check pairing status
- Same password as Dashboard

**Core Concept**: Photos are grouped by `originalId`. Each original has two versions (author A and B). The comparison mode shows pairs side-by-side for blind voting. The rating mode shows individual photos for star ratings.

### Important Notes

- **Base Path**: The app is configured for GitHub Pages deployment with base path `/Palette-Arena/` (see `vite.config.ts` and `App.tsx` BrowserRouter basename)
- **Dashboard Password**: Default is `palette2024`, defined in `src/pages/Dashboard.tsx` as `DASHBOARD_PASSWORD` constant
- **Admin Password**: Same as Dashboard, defined in `src/pages/Admin.tsx`
- **Blind Evaluation**: Author information is hidden during voting/rating to ensure unbiased evaluation
- **Statistics**: The dashboard calculates win rates and average ratings per author by aggregating votes and ratings across all photos
