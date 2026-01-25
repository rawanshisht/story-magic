# PDF Image Overlap Fix

## Context

### Original Request
**User Request**: "pdf generation is broken, image overlaps text"

### Interview Summary
**User Selections**:
- **Solution Approach**: Option A - fit + dynamic calculation (use PDFKit's fit option to constrain image height, calculate actual rendered dimensions, position text dynamically)
- **Test Strategy**: TDD approach (write failing tests first that demonstrate the overlap issue)
- **Additional Improvements**: All improvements (fix overlap + add page break handling + improve placeholder styling)

**Key Discussions**:
- Root cause identified in `lib/pdf-generator.ts` lines 104-158
- Text placed at fixed Y position (400) regardless of actual image height
- Need to use PDFKit's `fit` option to constrain image dimensions
- Page break handling needed for story text that exceeds one page
- Placeholder styling should match image area dimensions

### Metis Review
**Status**: Metis consultation unavailable (provider error). Proceeding with comprehensive research-based plan.

**Research Findings**:
- PDFKit `fit: [width, height]` scales image proportionally to fit within bounds
- `fit` and `cover` options support `align` and `valign` parameters
- Existing code uses only `width: 400` with no height constraint
- `image-optimizer.ts` has `getImageDimensions()` function for pre-measurement
- Playwright test infrastructure exists for PDF functionality testing

---

## Work Objectives

### Core Objective
Fix PDF generation in `lib/pdf-generator.ts` where images overlap story text due to fixed text positioning. Implement dynamic text positioning based on actual image dimensions, add page break handling, and improve placeholder styling.

### Concrete Deliverables
1. Modified `lib/pdf-generator.ts` with dynamic image/text positioning
2. Page break handling for story text exceeding page capacity
3. Improved placeholder styling for missing images
4. TDD tests verifying no overlap occurs
5. Tests for page break functionality
6. Tests for placeholder rendering

### Definition of Done
- [ ] All story pages render without image/text overlap
- [ ] Long story text breaks across pages correctly
- [ ] Placeholder images have consistent styling matching image area
- [ ] TDD tests pass demonstrating fix works
- [ ] PDF generation works for various image aspect ratios (portrait, landscape, square)

### Must Have
- Dynamic text positioning based on actual image height
- Proper page margin handling (top: 50, bottom: 50)
- Text constrained to readable width (page margins respected)
- Placeholder styling matches image area dimensions

### Must NOT Have (Guardrails)
- NO hardcoded text Y positions (Y=400 must be removed)
- NO text overlapping images
- NO text extending beyond page margins
- NO breaking in middle of sentences (use `hyphenate: false` and proper break options)
- NO modifying unrelated PDF functionality (cover page, end page, fonts)

---

## Verification Strategy (TDD)

### Test Decision
- **Infrastructure exists**: YES (Playwright)
- **User wants tests**: YES (TDD approach)
- **Framework**: Playwright
- **Strategy**: TDD - RED-GREEN-REFACTOR workflow

### TDD Workflow
Each task follows RED-GREEN-REFACTOR:

1. **RED**: Write failing test first
   - Test file: `tests/pdf-image-overlap.spec.ts`
   - Test command: `npm test -- pdf-image-overlap.spec.ts`
   - Expected: FAIL (tests demonstrate the bug)

2. **GREEN**: Implement minimum code to pass
   - Command: `npm test -- pdf-image-overlap.spec.ts`
   - Expected: PASS (N tests, 0 failures)

3. **REFACTOR**: Clean up while keeping green
   - Command: `npm test -- pdf-image-overlap.spec.ts`
   - Expected: PASS (still)

### Test Setup Task (if infrastructure doesn't exist)
**N/A** - Playwright infrastructure already exists.

### Test File Structure
```typescript
// tests/pdf-image-overlap.spec.ts
import { test, expect } from '@playwright/test';

test.describe('PDF Image Overlap Fix', () => {
  test.beforeAll(async ({ }) => {
    // Generate test PDF with various image aspect ratios
  });

  test('should not overlap text on portrait images', async ({ }) => {
    // Test tall/portrait images
  });

  test('should not overlap text on landscape images', async ({ }) => {
    // Test wide/landscape images
  });

  test('should handle page breaks for long text', async ({ }) => {
    // Test text exceeding page capacity
  });

  test('placeholder should match image area dimensions', async ({ }) => {
    // Test placeholder styling
  });
});
```

### Manual QA Verification (Required Even With Tests)
Even with TDD tests, manual verification confirms visual correctness:

**For PDF rendering:**
- [ ] Generate PDF with test story
- [ ] Open in PDF reader (Adobe Acrobat, Preview, etc.)
- [ ] Verify no overlap on all pages
- [ ] Check page breaks occur appropriately
- [ ] Verify placeholder styling visually

---

## Task Flow

```
Task 1 (TDD RED) → Task 2 (GREEN) → Task 3 (GREEN) → Task 4 (GREEN)
                                    ↘ Task 5 (GREEN)
                                    ↘ Task 6 (GREEN)
```

## Parallelization

| Group | Tasks | Reason |
|-------|-------|--------|
| A | 1 | TDD RED - write failing tests first (must come first) |
| B | 2, 3, 4, 5, 6 | Implementation tasks (can be done in sequence after tests) |

| Task | Depends On | Reason |
|------|------------|--------|
| 2 | 1 | Must have failing test first |
| 3 | 1 | Must have failing test first |
| 4 | 1 | Must have failing test first |
| 5 | 1 | Must have failing test first |
| 6 | 1 | Must have failing test first |

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> Specify parallelizability for EVERY task.

- [ ] 1. Write TDD RED tests for image overlap issue

  **What to do**:
  - Create `tests/pdf-image-overlap.spec.ts`
  - Write failing test that demonstrates image overlap bug
  - Test with various image aspect ratios (portrait, landscape, square)
  - Test page break functionality
  - Test placeholder styling

  **Must NOT do**:
  - Modify implementation code yet
  - Skip any aspect ratio tests
  - Use real API calls (use mock data)

  **Parallelizable**: NO (TDD RED phase - must be first)

  **References**:

  **Pattern References** (existing code to follow):
  - `tests/pdf-download.spec.ts:1-35` - Playwright test structure and patterns
  - `tests/pdf-download.spec.ts:36-53` - API endpoint testing patterns

  **Implementation References** (code to understand but not modify):
  - `lib/pdf-generator.ts:104-158` - createStoryPage function (THE BUG)
  - `lib/pdf-generator.ts:72-102` - createCoverPage (reference for proper structure)
  - `lib/pdf-generator.ts:173-200` - createEndPage (reference for proper structure)

  **Documentation References** (specs and requirements):
  - PDFKit docs: `https://pdfkit.org/docs/images.html` - Image sizing options (fit, cover, align, valign)
  - This plan's "Root Cause Analysis" section - detailed problem description

  **WHY Each Reference Matters**:
  - `tests/pdf-download.spec.ts` - Shows Playwright test patterns to follow
  - `lib/pdf-generator.ts:104-158` - Target of the fix (don't modify yet, just understand)
  - PDFKit docs - How to properly size images with fit option

  **Acceptance Criteria**:

  **TDD (tests enabled)**:
  - [ ] Test file created: `tests/pdf-image-overlap.spec.ts`
  - [ ] Test covers: Image overlap detection with different aspect ratios
  - [ ] Test covers: Page break functionality
  - [ ] Test covers: Placeholder styling
  - [ ] `npm test -- pdf-image-overlap.spec.ts` → FAIL (demonstrates bug exists)

  **Manual Execution Verification**:
  - [ ] Generate test PDF using the failing tests
  - [ ] Open PDF in viewer
  - [ ] Visually confirm overlap exists (this is expected in RED phase)

  **Evidence Required**:
  - [ ] Test file exists with proper structure
  - [ ] Test output shows FAIL (not PASS)
  - [ ] Screenshot or description of visual overlap (for documentation)

  **Commit**: YES
  - Message: `test(pdf): add failing tests for image overlap bug`
  - Files: `tests/pdf-image-overlap.spec.ts`
  - Pre-commit: None (tests should fail)

---

- [ ] 2. Fix image positioning with fit + dynamic calculation

  **What to do**:
  - Modify `lib/pdf-generator.ts` function `createStoryPage()`
  - Add `fit: [400, 280]` option to image rendering
  - Calculate actual rendered image height
  - Position text dynamically: textY = imageY + fittedHeight + padding
  - Add proper padding (40px) between image and text

  **Must NOT do**:
  - Remove or modify cover page logic
  - Change font configuration
  - Modify end page
  - Add unrelated features

  **Parallelizable**: NO (depends on Task 1)

  **References**:

  **Pattern References** (existing code to follow):
  - `lib/pdf-generator.ts:72-102` - createCoverPage pattern for doc.rect() and doc.fillColor()
  - `lib/pdf-generator.ts:135-143` - Current text positioning (TO BE FIXED)

  **API/Type References** (contracts to implement against):
  - PDFKit image options: `fit: [width, height]` scales proportionally within bounds
  - PDFKit text options: `width`, `align`, `lineGap` for text layout

  **Test References** (testing patterns to follow):
  - `tests/pdf-image-overlap.spec.ts:Task 1` - Tests should now pass

  **External References** (libraries and frameworks):
  - Official docs: `https://pdfkit.org/docs/images.html` - Image `fit` option usage
  - Example: `doc.image(buffer, x, y, { fit: [400, 280], align: 'center', valign: 'top' })`

  **WHY Each Reference Matters**:
  - `lib/pdf-generator.ts:72-102` - Shows proper background fill pattern
  - PDFKit docs - Official syntax for fit option with align/valign
  - Current text code (135-143) - Must be replaced with dynamic positioning

  **Acceptance Criteria**:

  **TDD (tests enabled)**:
  - [ ] Test file updated: `tests/pdf-image-overlap.spec.ts` (if needed)
  - [ ] `npm test -- pdf-image-overlap.spec.ts` → PASS (tests now pass)

  **Manual Execution Verification**:
  - [ ] Generate PDF with portrait image
  - [ ] Verify NO overlap (text below image)
  - [ ] Measure text Y position is at least 320px below image top
  - [ ] Generate PDF with landscape image
  - [ ] Verify NO overlap

  **Evidence Required**:
  - [ ] Command output: `npm test -- pdf-image-overlap.spec.ts` → PASS
  - [ ] Screenshot of PDF showing no overlap (save to `.sisyphus/evidence/task-2-portrait.png`)
  - [ ] Screenshot of PDF showing no overlap for landscape (save to `.sisyphus/evidence/task-2-landscape.png`)

  **Commit**: YES
  - Message: `fix(pdf): use fit option and dynamic text positioning`
  - Files: `lib/pdf-generator.ts`
  - Pre-commit: `npm test -- pdf-image-overlap.spec.ts`

---

- [ ] 3. Add page break handling for long story text

  **What to do**:
  - Modify `createStoryPage()` to handle text exceeding page capacity
  - Use PDFKit's built-in page break handling (automatic with text flow)
  - Add explicit page break if text would exceed bottom margin
  - Ensure page numbers update correctly across breaks

  **Must NOT do**:
  - Break in middle of sentences (use `hyphenate: false`)
  - Create orphan pages with only text or only image
  - Modify header/footer on new pages

  **Parallelizable**: NO (depends on Task 1)

  **References**:

  **Pattern References** (existing code to follow):
  - `lib/pdf-generator.ts:145-152` - Current page number rendering (needs update for breaks)
  - PDFKit docs - Text continuation and page breaking

  **API/Type References** (contracts to implement against):
  - PDFKit text continued option: `continued: false` (default)
  - Page break: `doc.addPage()` when text exceeds available space

  **Test References** (testing patterns to follow):
  - `tests/pdf-image-overlap.spec.ts:Task 1` - Page break tests should pass

  **External References** (libraries and frameworks):
  - PDFKit text options: `width`, `align`, `lineGap`, `columns` for multi-column layout
  - Example: `doc.text(text, x, y, { width: width, align: 'center' })` - automatically breaks

  **WHY Each Reference Matters**:
  - Page number code (145-152) - Must be updated to reflect correct page numbers
  - PDFKit docs - How text flows and breaks across pages automatically

  **Acceptance Criteria**:

  **TDD (tests enabled)**:
  - [ ] Test covers: Long text breaks correctly
  - [ ] `npm test -- pdf-image-overlap.spec.ts` → PASS

  **Manual Execution Verification**:
  - [ ] Generate PDF with very long story text (>1 page)
  - [ ] Verify text breaks to new page at appropriate point
  - [ ] Verify page numbers are correct on all pages
  - [ ] Verify no text is cut off or lost

  **Evidence Required**:
  - [ ] Command output: `npm test -- pdf-image-overlap.spec.ts` → PASS
  - [ ] Screenshot of multi-page PDF showing correct breaks (save to `.sisyphus/evidence/task-3-page-breaks.png`)
  - [ ] Page numbers verified correct on all pages

  **Commit**: YES
  - Message: `feat(pdf): add page break handling for long text`
  - Files: `lib/pdf-generator.ts`
  - Pre-commit: `npm test -- pdf-image-overlap.spec.ts`

---

- [ ] 4. Improve placeholder image styling

  **What to do**:
  - Modify `drawPlaceholder()` function to use consistent dimensions
  - Match placeholder size to fitted image dimensions (400x280)
  - Add proper styling (border, background, centered text)
  - Ensure placeholder scales with fit dimensions

  **Must NOT do**:
  - Change placeholder text content
  - Add animations or interactive elements
  - Modify real image rendering

  **Parallelizable**: NO (depends on Task 1)

  **References**:

  **Pattern References** (existing code to follow):
  - `lib/pdf-generator.ts:160-171` - Current drawPlaceholder function (TO BE IMPROVED)

  **API/Type References** (contracts to implement against):
  - PDFKit rect: `doc.rect(x, y, width, height).fill(color)`
  - PDFKit text: `doc.text(content, x, y, { align: 'center', width: width })`

  **Test References** (testing patterns to follow):
  - `tests/pdf-image-overlap.spec.ts:Task 1` - Placeholder tests should pass

  **External References** (libraries and frameworks):
  - PDFKit graphics: `doc.rect()`, `doc.fill()`, `doc.stroke()`
  - Color scheme: `#F3F4F6` (gray-100) background, `#9CA3AF` (gray-400) text

  **WHY Each Reference Matters**:
  - Current drawPlaceholder (160-171) - Must be enhanced to match image area
  - Color scheme - Should match design system used elsewhere

  **Acceptance Criteria**:

  **TDD (tests enabled)**:
  - [ ] Test covers: Placeholder styling matches image area
  - [ ] `npm test -- pdf-image-overlap.spec.ts` → PASS

  **Manual Execution Verification**:
  - [ ] Generate PDF with missing image
  - [ ] Verify placeholder is 400x280 pixels
  - [ ] Verify placeholder background is gray
  - [ ] Verify "Illustration" text is centered
  - [ ] Verify consistent styling with real images

  **Evidence Required**:
  - [ ] Command output: `npm test -- pdf-image-overlap.spec.ts` → PASS
  - [ ] Screenshot of placeholder (save to `.sisyphus/evidence/task-4-placeholder.png`)

  **Commit**: YES
  - Message: `style(pdf): improve placeholder image styling`
  - Files: `lib/pdf-generator.ts`
  - Pre-commit: `npm test -- pdf-image-overlap.spec.ts`

---

- [ ] 5. Add valign parameter for consistent image alignment

  **What to do**:
  - Update image rendering in `createStoryPage()` to use `valign: 'top'`
  - Ensure images align consistently at top of designated area
  - Combine with existing `align: 'center'` for full alignment control

  **Must NOT do**:
  - Remove or change the fit dimensions
  - Add unrelated alignment changes

  **Parallelizable**: NO (depends on Task 1)

  **References**:

  **Pattern References** (existing code to follow):
  - Task 2 changes - Image rendering with fit option

  **API/Type References** (contracts to implement against):
  - PDFKit image options: `valign: 'top' | 'center' | 'bottom'`

  **Test References** (testing patterns to follow):
  - `tests/pdf-image-overlap.spec.ts:Task 1` - Tests should pass

  **External References** (libraries and frameworks):
  - PDFKit docs: `valign` works with `fit` and `cover` options
  - Example: `{ fit: [400, 280], align: 'center', valign: 'top' }`

  **WHY Each Reference Matters**:
  - PDFKit docs - Official syntax for valign parameter
  - Task 2 - Base implementation to enhance

  **Acceptance Criteria**:

  **TDD (tests enabled)**:
  - [ ] `npm test -- pdf-image-overlap.spec.ts` → PASS

  **Manual Execution Verification**:
  - [ ] Generate PDF with various images
  - [ ] Verify images align consistently at top of area
  - [ ] Verify no vertical misalignment

  **Evidence Required**:
  - [ ] Command output: `npm test -- pdf-image-overlap.spec.ts` → PASS
  - [ ] Screenshot showing consistent alignment (save to `.sisyphus/evidence/task-5-valign.png`)

  **Commit**: YES
  - Message: `feat(pdf): add valign parameter for image alignment`
  - Files: `lib/pdf-generator.ts`
  - Pre-commit: `npm test -- pdf-image-overlap.spec.ts`

---

- [ ] 6. Refactor and clean up code

  **What to do**:
  - Remove hardcoded magic numbers (replace with constants)
  - Add comments explaining dynamic positioning logic
  - Extract configuration to top of file or separate constants
  - Ensure code follows existing patterns in the file

  **Must NOT do**:
  - Change functionality (only refactor)
  - Remove necessary logic
  - Break existing behavior

  **Parallelizable**: NO (depends on Tasks 2-5)

  **References**:

  **Pattern References** (existing code to follow):
  - `lib/pdf-generator.ts:6-30` - Configuration patterns (options interface, font helpers)
  - `lib/pdf-generator.ts:31-70` - Main generatePDF function structure

  **API/Type References** (contracts to implement against):
  - TypeScript interfaces: `PDFGeneratorOptions`, `StoryPage`

  **Test References** (testing patterns to follow):
  - `tests/pdf-image-overlap.spec.ts:Task 1` - All tests should still pass

  **WHY Each Reference Matters**:
  - Configuration patterns (6-30) - Show how to organize constants
  - Main function (31-70) - Show proper structure for the module

  **Acceptance Criteria**:

  **TDD (tests enabled)**:
  - [ ] `npm test -- pdf-image-overlap.spec.ts` → PASS
  - [ ] `npm test` → PASS (all existing tests still pass)

  **Manual Execution Verification**:
  - [ ] Code review confirms clean, documented, maintainable code
  - [ ] No magic numbers remain
  - [ ] Comments explain the "why" not just the "what"

  **Evidence Required**:
  - [ ] Command output: `npm test` → PASS (all tests)
  - [ ] Code review notes (optional, in comments)

  **Commit**: YES
  - Message: `refactor(pdf): clean up code and add documentation`
  - Files: `lib/pdf-generator.ts`
  - Pre-commit: `npm test`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `test(pdf): add failing tests for image overlap bug` | tests/pdf-image-overlap.spec.ts | npm test → FAIL |
| 2 | `fix(pdf): use fit option and dynamic text positioning` | lib/pdf-generator.ts | npm test → PASS |
| 3 | `feat(pdf): add page break handling for long text` | lib/pdf-generator.ts | npm test → PASS |
| 4 | `style(pdf): improve placeholder image styling` | lib/pdf-generator.ts | npm test → PASS |
| 5 | `feat(pdf): add valign parameter for image alignment` | lib/pdf-generator.ts | npm test → PASS |
| 6 | `refactor(pdf): clean up code and add documentation` | lib/pdf-generator.ts | npm test → PASS |

---

## Success Criteria

### Verification Commands
```bash
# Run specific tests
npm test -- pdf-image-overlap.spec.ts

# Run all tests
npm test

# Generate test PDF (manual verification)
curl -o test-story.pdf "http://localhost:3000/api/stories/[test-story-id]/pdf"
```

### Final Checklist
- [ ] All "Must Have" present (dynamic positioning, page breaks, placeholder styling)
- [ ] All "Must NOT Have" absent (no hardcoded Y positions, no overlap)
- [ ] All tests pass (TDD tests + existing tests)
- [ ] PDF renders correctly for all aspect ratios
- [ ] Page breaks work correctly
- [ ] Code is clean and documented

### Edge Cases to Test
1. **Very tall portrait images** (height > width significantly)
2. **Very wide landscape images** (width > height significantly)
3. **Square images** (width = height)
4. **Very long story text** (> 2 pages)
5. **Single line story text** (minimal content)
6. **Missing images** (placeholder rendering)
7. **Different moral values** (might affect text length)

### Known Limitations
- PDFKit doesn't provide easy way to get exact fitted dimensions before rendering
- The fit option calculates dimensions internally, so we use the max bounds (400, 280)
- Text positioning uses padding (40px) to ensure separation
