# SmartCallr Frontend

Next.js React application for call management with AI features.

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

**Access:** http://localhost:3000

## Features

- **Dashboard** - Call and lead overview with metrics
- **Lead Management** - Create/edit leads with country codes
- **Call Interface** - Make calls, take notes, view transcripts
- **Call History** - Browse and search past calls
- **Real-time Updates** - Live call status and progress
- **AI Integration** - Transcription and summary generation

## Environment Setup

Create `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hook Form** - Form handling
- **Zod** - Validation
- **SWR** - Data fetching
- **Lucide Icons** - Icon library

## Project Structure

```
src/
├── app/              # App Router pages
├── components/       # Reusable components
│   ├── ui/          # Basic UI components
│   ├── dashboard/   # Dashboard components
│   ├── leads/       # Lead management
│   ├── calls/       # Call interface
│   └── layout/      # Layout components
├── lib/             # Utilities and services
└── types/           # TypeScript types
```

## Key Components

- **Layout** - Sidebar navigation and header
- **Dashboard** - Metrics and recent activity
- **LeadForm** - Create/edit leads with validation
- **CallInterface** - Make calls and take notes
- **CallHistory** - Browse and filter call records

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting
npm run type-check   # TypeScript checking
```

## API Integration

- **Lead API** - CRUD operations for leads
- **Call API** - Call management and history
- **User API** - Authentication and profiles
- **Real-time updates** - Status polling every 5 seconds

## Notes

- Uses App Router (Next.js 13+)
- All forms include proper validation
- Responsive design for mobile/desktop
- Error handling with toast notifications
- Loading states for better UX
