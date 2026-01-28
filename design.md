# Storybook Generator - Design Document

## 1. Project Overview
**Storybook Generator** is a magical web application designed to create personalized illustrated stories for children (ages 5-10). Parents can generate unique stories based on their child's interests, age, and selected moral lessons, featuring consistent character illustrations.

## 2. Technical Architecture

### 2.1 Stack
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Radix UI (Shadcn-like components)
- **Database:** PostgreSQL (via [Prisma ORM](https://www.prisma.io/))
- **Authentication:** [NextAuth.js v5](https://authjs.dev/)
- **AI Integration:** OpenAI API
  - **Text:** GPT-4o-mini (Story generation)
  - **Images:** DALL-E / Image Models (Illustrations)
  - **Audio:** TTS-1 (Text-to-Speech)
- **PDF Generation:** PDFKit
- **Testing:** Playwright

### 2.2 Core Services
- **Story Engine (`lib/story-generator.ts`):** Orchestrates the generation of text, parsing into pages, and prompting for illustrations.
- **Image Optimizer (`lib/image-optimizer.ts`):** Handles image processing and base64 conversions.
- **PDF Service (`lib/pdf-generator.ts`):** Compiles text and images into a downloadable PDF format.

## 3. Data Model

The application uses a relational database with the following core entities:

- **User:** The parent/guardian account.
  - *Relations:* Has many Children, Stories, Accounts.
- **Child:** The protagonist of the stories.
  - *Attributes:* Name, Age, Gender, Appearance (skin tone, eye color, hair), Interests.
  - *Relations:* Belongs to User, Has many Stories.
- **Story:** A generated book.
  - *Attributes:* Title, Moral, Content (JSON pages), Page Count.
  - *Relations:* Belongs to Child and User.
- **StoryJob:** Tracks background generation status.
  - *Attributes:* Status (processing/complete/failed), Progress, Error logs.

## 4. Key Workflows

### 4.1 Story Generation Pipeline
1.  **Input:** User selects a Child, Moral, and optional Custom Settings.
2.  **Prompt Engineering:** System builds a prompt incorporating the child's physical description and interests.
3.  **Text Generation:** OpenAI generates the full story text.
4.  **Parsing:** Text is split into pages (default or age-based count).
5.  **Illustration:** 
    -   Parallel generation of images for each page.
    -   **Consistency Check:** Prompts include strict character reference (hair, clothes, style) to maintain visual continuity.
6.  **Assembly:** Text and images are combined into a structured object and saved to the database.

### 4.2 PDF Export
1.  **Layout:** Generates a cover page, story pages (image top, text bottom), and end page.
2.  **Assets:** Embeds base64 images directly.
3.  **Output:** Streamed as a downloadable buffer.

## 5. Design System ("Kids Edition")

Based on `design-system.md`, the UI focuses on accessibility and playfulness.

- **Principles:** Safety First, Playful & Magical, Literal & Visual.
- **Typography:** 'Nunito' (Rounded, friendly).
- **Color Palette:**
  -   Primary: Magical Purple (`hsl(265, 85%, 65%)`)
  -   Secondary: Sky Blue (`hsl(195, 85%, 60%)`)
  -   Highlights: Sunshine Yellow (`hsl(45, 95%, 60%)`)
  -   Background: Paper White (`hsl(30, 20%, 98%)`)
- **Components:**
  -   **Buttons:** Rounded "Bubbles" with bounce effects.
  -   **Cards:** Large rounded corners, thick soft borders.
  -   **Navigation:** Simple, icon-heavy interfaces.

## 6. Directory Structure
```
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Login/Register routes
│   ├── (dashboard)/      # Protected user area
│   └── api/              # API Routes (Generation, streaming)
├── components/           # React Components
│   ├── landing/          # Marketing pages
│   ├── story/            # Story viewing/creation components
│   └── ui/               # Reusable base components
├── lib/                  # Core logic and utilities
├── prisma/               # Database schema
└── types/                # TypeScript definitions
```

## 7. Future Roadmap
-   **Voice Cloning:** Allow parents to record their voice for narration.
-   **Interactive Mode:** "Choose your own adventure" style stories.
-   **Physical Printing:** Integration with print-on-demand services.
