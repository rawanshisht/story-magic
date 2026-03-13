# Storybook Generator (Story Magic) - Codebase Analysis

## Overview

**Story Magic** is an AI-powered web application that creates personalized children's stories. Parents can create child profiles (name, age, appearance, interests) and generate custom illustrated stories where their child is the hero. The application combines OpenAI's GPT-4o-mini for story generation, GPT-image-1 for illustrations, and TTS-1 for narration.

**Live Site:** [www.mystorymagic.uk](https://www.mystorymagic.uk)

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16.1.4 (App Router) |
| **Language** | TypeScript 5.3.3 |
| **Database** | PostgreSQL + Prisma ORM 5.22.0 |
| **Authentication** | Firebase Auth 12.8.0 + Next-Auth 5.0.0-beta.30 |
| **AI Services** | OpenAI API (GPT-4o-mini, GPT-image-1, TTS-1) |
| **PDF Generation** | PDFKit 0.17.2 |
| **UI** | Radix UI + Tailwind CSS 4.1.18 + Lucide React |
| **Testing** | Playwright 1.58.0 |
| **State Management** | TanStack React Query 5.90.20 |
| **Hosting** | Netlify |

---

## Project Structure

```
storybook-generator/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group: login, register
│   ├── (dashboard)/              # Route group: dashboard, create, stories
│   ├── api/                      # API routes (stories, children, generate, tts, auth)
│   ├── layout.tsx                # Root layout with Nunito font
│   ├── page.tsx                  # Landing page
│   ├── providers.tsx             # App providers (Auth, Query)
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # Radix UI components (Button, Card, Dialog, etc.)
│   ├── story/                    # Story-specific components (ChildDetailsForm, StoryPage, AudioPlayer)
│   ├── landing/                  # Landing page sections (Hero, Features, Pricing, etc.)
│   └── shared/                   # Shared components (Navbar, LoadingSpinner, CopyLink)
├── lib/                          # Core utilities
│   ├── story-generator.ts        # Story generation orchestration
│   ├── pdf-generator.ts          # PDF creation with PDFKit
│   ├── pdf-generator-email.ts    # Email-ready PDF generation
│   ├── openai.ts                 # OpenAI API integration
│   ├── firebase.ts               # Firebase client configuration
│   ├── firebase-admin.ts         # Firebase admin utilities
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth-helper.ts            # Authentication utilities
│   └── data-cache.ts             # Cached data fetching
├── config/
│   ├── morals.ts                 # 10 predefined moral lessons
│   └── age-settings.ts           # Age-appropriate content configuration
├── types/
│   └── index.ts                  # TypeScript type definitions
├── tests/                        # Playwright E2E tests
├── functions/                    # Netlify background functions
└── prisma/
    └── schema.prisma             # Database schema
```

---

## Database Schema

### Core Entities

```prisma
// User - Managed by NextAuth with Firebase sync
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String?
  image         String?
  accounts      Account[]
  sessions      Session[]
  stories       Story[]
  children      Child[]
}

// Child Profile - Stores child's characteristics
model Child {
  id          String   @id @default(cuid())
  name        String
  age         Int
  gender      String
  skinTone    String
  eyeColor    String
  hairColor   String
  hairStyle   String
  interests   String[] // Array of interests
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  stories     Story[]
}

// Story - Generated story with content
model Story {
  id           String   @id @default(cuid())
  title        String
  moral        String
  content      Json     // Array of {pageNumber, text, imageUrl, audioUrl}
  childId      String
  child        Child    @relation(fields: [childId], references: [id], onDelete: Cascade)
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  pageCount    Int
  cachedPdf    Bytes?   // Pre-generated PDF blob
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// StoryJob - Async job tracking for story generation
model StoryJob {
  id            String   @id @default(cuid())
  userId        String
  childId       String
  moral         String
  customSetting String?
  customTheme   String?
  pageCount     Int
  status        String   // "processing" | "complete" | "failed"
  progress      Int      // 0-100
  storyId       String?
  error         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### Relationships
- **User → Children** (1:N): Each user can have multiple child profiles
- **User → Stories** (1:N): Each user owns multiple stories
- **Child → Stories** (1:N): Stories are associated with a specific child
- **StoryJob → User** (N:1): Jobs track async story generation

---

## Key Features

### 1. Story Generation Wizard
**Location:** `app/(dashboard)/create/page.tsx`

Multi-step wizard for creating stories:
1. **Select Child**: Choose from existing child profiles
2. **Choose Moral**: Select from 10 predefined moral lessons
3. **Customize**: Optional custom setting and theme
4. **Generate**: AI-powered story and illustration generation with progress tracking

### 2. Child Profile Management
**Location:** `components/story/ChildDetailsForm.tsx`

Comprehensive child profile creation:
- Name and age
- Gender
- Physical appearance (skin tone, eye color, hair)
- Interests (array of tags)
- Stored in database for future stories

### 3. Story Viewer
**Location:** `app/(dashboard)/stories/[id]/story-view-client.tsx`

Rich story presentation:
- Page-by-page navigation
- Watercolor illustrations with flip animation
- Text-to-speech audio narration
- PDF download capability
- Responsive design for tablets/phones

### 4. Dashboard
**Location:** `app/(dashboard)/dashboard/page.tsx`

User home page with:
- Child profile quick access
- Recent stories list
- Story count statistics
- Create story CTA

---

## AI Integration Architecture

### Story Text Generation
**File:** `lib/story-generator.ts`

**Model:** GPT-4o-mini

**Prompt Engineering Strategy:**
```typescript
// Structured prompt with:
- Character description (name, age, appearance)
- Moral lesson to incorporate
- Age-appropriate constraints (vocabulary, complexity)
- Output format: TITLE and PAGE X: sections
```

**Age-Based Configuration (config/age-settings.ts):**

| Age Range | Page Count | Words/Page | Vocabulary Level |
|-----------|------------|------------|------------------|
| 2-3 years | 4 | 20-30 | Very simple |
| 4-5 years | 4 | 40-50 | Simple |
| 6-7 years | 6 | 60-80 | Intermediate |
| 8-10 years | 6 | 100-120 | Advanced |

### Illustration Generation
**File:** `lib/story-generator.ts`

**Model:** GPT-image-1 (DALL-E 3)

**Character Consistency System:**
- Detailed character reference prompts with physical attributes
- Consistent outfit description across all pages
- Watercolor style with soft brushstrokes and pastel palette
- No text/letters in images (strict policy)

**Concurrency Control:**
```typescript
processWithConcurrency(items, processor, maxConcurrent = 5)
// Prevents rate limiting while maximizing throughput
```

### Text-to-Speech
**File:** `app/api/tts/route.ts`

**Model:** TTS-1
- Voice: "coral"
- Speed: 0.85 (slightly slower for children)
- Generates MP3 files stored temporarily

### OpenAI Integration Pattern
**File:** `lib/openai.ts`

- Centralized OpenAI client initialization
- Error handling with exponential backoff
- Request/response logging

---

## Authentication Flow

### Client-Side (Firebase)
**File:** `lib/firebase.ts`

```typescript
// Initialize Firebase Auth with config from env vars
// Sign in with email/password or Google OAuth
// Set firebase-auth cookie on successful login
```

### Server-Side Protection
**File:** `middleware.ts`

```typescript
// Protects routes: /dashboard, /create, /stories
// Checks firebase-auth cookie
// Redirects unauthenticated users to /login?callbackUrl=...
```

### User Sync
**File:** `app/api/auth/sync-user/route.ts`

- Syncs Firebase users to PostgreSQL on first login
- Creates User record if not exists
- Ensures database consistency

---

## PDF Generation Pipeline

**Files:** `lib/pdf-generator.ts`, `pages/api/stories/[id]/pdf.ts`

### PDF Structure:
1. **Cover Page:** Purple theme (#8B5CF6) with title and child name
2. **Story Pages:** Illustration + text, 2 pages per sheet layout
3. **End Page:** Closing message and branding

### Technical Implementation:
- Uses PDFKit for PDF generation
- Base64 image embedding (handles URL expiration)
- Times-Roman font family
- A4 page size with margins
- Optimized for printing

### Caching:
- Generated PDFs cached in `Story.cachedPdf` (Bytes field)
- Subsequent requests serve cached version
- Cache invalidated on story update

---

## Testing Strategy

**Framework:** Playwright 1.58.0

### Test Coverage:

| Test File | Coverage Area |
|-----------|---------------|
| `landing.spec.ts` | Landing page load, navigation, CTAs, mobile responsive |
| `story-flow.spec.ts` | Multi-step wizard, forms, progress tracking |
| `api.spec.ts` | API endpoints, data validation |
| `pdf-image-overlap.spec.ts` | PDF generation accuracy |
| `pdf-download.spec.ts` | Download functionality |
| `project-structure.spec.ts` | File structure validation |
| `components.spec.ts` | Component rendering, accessibility |

### Test Patterns:
- E2E user flow simulation
- Form interaction testing
- Responsive design validation
- Accessibility checks
- Mobile viewport testing

---

## Design System

### "Kids Edition" Philosophy

**Colors:**
- **Magical Purple:** #8B5CF6 (primary)
- **Sky Blue:** #3B82F6 (secondary)
- **Sunshine Yellow:** #FBBF24 (accent)
- **Soft backgrounds:** Pastel pinks, blues, greens

**Typography:**
- **Font:** Nunito (rounded, friendly)
- **Weights:** Regular (400), SemiBold (600), Bold (700)

**Interactions:**
- Large touch targets (min 44px)
- Bouncy button animations
- Simple, clear navigation
- High contrast for readability

**Accessibility:**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility

---

## Notable Implementation Patterns

### 1. Concurrent Processing Utility
```typescript
// lib/story-generator.ts
async function processWithConcurrency<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  maxConcurrent: number = 5
): Promise<R[]>
```
- Controls parallel API calls
- Prevents OpenAI rate limits
- Maintains consistent performance

### 2. Caching Strategy
```typescript
// lib/data-cache.ts
export const getCachedUser = cache(async (userId: string) => { ... })
export const getCachedChildren = cache(async (userId: string) => { ... })
```
- React Server Components with cached data fetching
- Page-level revalidation (`export const revalidate = 60`)
- Reduces database queries

### 3. Configuration-Driven Content
- **Morals** (`config/morals.ts`): Easy to add new lessons
- **Age Settings** (`config/age-settings.ts`): Configurable without code changes
- Extensible architecture

### 4. Error Handling & Resilience
- Placeholder illustrations for failed generations
- Graceful degradation in story parsing
- Comprehensive error logging
- Job retry mechanisms

### 5. Character Consistency
- Detailed physical description prompts
- Same outfit enforced across all pages
- Watercolor style maintained throughout
- No text/letters in illustrations

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/sync-user` | POST | Sync Firebase user to database |
| `/api/children` | GET, POST | List/create child profiles |
| `/api/children/[id]` | GET, PUT, DELETE | Manage specific child |
| `/api/stories` | GET, POST | List stories, create job |
| `/api/stories/[id]` | GET, DELETE | View/delete story |
| `/api/stories/[id]/email` | POST | Email story link |
| `/api/stories/[id]/audio` | GET | Get TTS audio for story |
| `/api/stories/status` | GET | Check story generation status |
| `/api/generate` | POST | Trigger background story generation |
| `/api/tts` | POST | Generate text-to-speech audio |
| `/api/stories/[id]/pdf` | GET | Generate/download PDF |

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# OpenAI
OPENAI_API_KEY=sk-...

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
FIREBASE_ADMIN_PRIVATE_KEY=...
FIREBASE_ADMIN_CLIENT_EMAIL=...

# NextAuth
NEXTAUTH_URL=https://...
NEXTAUTH_SECRET=...

# Resend (Email)
RESEND_API_KEY=re_...
```

---

## Summary

Story Magic is a well-architected Next.js application demonstrating modern React patterns combined with AI services. Key strengths:

- **Type Safety:** Comprehensive TypeScript coverage
- **Performance:** Caching, concurrency control, optimized builds
- **UX:** Kid-friendly design with accessibility focus
- **AI Integration:** Sophisticated prompt engineering for consistency
- **Scalability:** Async job processing, database optimization
- **Testing:** Comprehensive Playwright E2E coverage

The codebase follows Next.js best practices with clear separation of concerns, making it maintainable and extensible for future features.
