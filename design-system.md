# StoryBook Design System - Kids Edition (Ages 5-10)

## 1. Core Principles
*   **Safety First:** A secure environment where kids can explore without leaving the app.
*   **Playful & Magical:** Every interaction should feel like part of a story.
*   **Literal & Visual:** Show, don't just tell. Use icons and images over text.
*   **Forgiving:** Big touch targets, easy "undo" actions, and gentle error messages.
*   **Encouraging:** Positive reinforcement through animations and friendly copy.

## 2. Color Palette
Bright, cheerful, but harmonized. Avoid neon overuse.

### Primary Colors
*   **Magical Purple:** `hsl(265, 85%, 65%)` - Main brand color, primary actions.
*   **Sky Blue:** `hsl(195, 85%, 60%)` - Secondary actions, info, calmness.
*   **Sunshine Yellow:** `hsl(45, 95%, 60%)` - Highlights, "fun" elements, stars/rewards.
*   **Berry Red:** `hsl(340, 85%, 60%)` - Important alerts (gentle), close buttons.
*   **Leaf Green:** `hsl(150, 75%, 45%)` - Success, "Go", positive affirmation.

### Neutrals
*   **Paper White:** `hsl(30, 20%, 98%)` - Main background (warm, paper-like).
*   **Ink Blue:** `hsl(225, 40%, 20%)` - Text (softer than pure black).
*   **Cloud Gray:** `hsl(210, 20%, 95%)` - Secondary backgrounds.

## 3. Typography
Highly readable, rounded, and friendly.

*   **Font Family:** 'Nunito' (Google Fonts) - Rounded terminals, approachable.
*   **Headings:** Bold, playful. 
    *   H1: 3rem (48px) - "Story Title"
    *   H2: 2.25rem (36px) - Section Headers
*   **Body:** Large, readable.
    *   Base size: 1.125rem (18px) or 1.25rem (20px).
    *   Line height: 1.6 (roomy).

## 4. UI Components

### Buttons ("Bubbles")
*   **Shape:** Full pill/rounded (`rounded-full`).
*   **Size:** Large touch targets (min height 56px).
*   **Effect:** Bouncy hover (scale 1.05), active press (scale 0.95).
*   **Shadow:** Soft, playful shadows (`shadow-[0_4px_0_0_rgb(..)]`) to give depth/3D feel.

### Cards ("Story Pages")
*   **Shape:** Large rounded corners (`rounded-3xl` / 24px).
*   **Border:** Thick, soft colored borders (e.g., 4px solid light purple).
*   **Background:** White or very light pastel washes.

### Icons
*   **Style:** Filled, rounded, possibly hand-drawn style (using Lucide with thicker stroke or custom SVG).
*   **Size:** Large (32px+).

## 5. Layout & Spacing
*   **Container:** `max-w-5xl` (keep content focused).
*   **Whitespace:** Generous padding. "Airy" feel.
*   **Grid:** Simple 1 or 2 column layouts. Avoid complex dashboards for kids.

## 6. Motion & Feedback
*   **Hover:** Wiggle, bounce, or color shift.
*   **Transition:** Smooth fades and slides (`ease-out-back` for bounce).
*   **Loading:** Fun animations (e.g., a book opening, stars twinkling) instead of spinners.

## 7. Accessibility (Kids Context)
*   **Reading Level:** Simple vocabulary (Grade 1-3 level).
*   **Voice Over:** Support for text-to-speech (future consideration).
*   **Contrast:** High contrast for text (WCAG AAA).

---

## Implementation Plan
1.  **Tailwind Config:** Update colors, add 'Nunito' font, custom shadows/radii.
2.  **Globals:** Apply "Paper White" background and default text styles.
3.  **Component Refactor:** 
    *   Update `Button` to be "bouncy bubbles".
    *   Update `Card` to have thick borders and large radii.
    *   Update `Navbar` to be simpler/larger.
