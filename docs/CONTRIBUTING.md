# Contributing to CodeSpark

> Thank you for considering contributing to CodeSpark! This guide outlines the standards, workflows, and best practices expected by the core maintainers.

---

## 1. Code of Conduct & Core Standards

CodeSpark is an open, developer-first community. We hold all contributions to the following engineering standards:
- **Zero Third-Party Ad / Tracking Scripts**: No external analytics, tracking pixels, or affiliate tags.
- **Hardware Acceleration**: Animations must use GPU-friendly properties (`transform`, `opacity`). Never animate layout properties (`width`, `height`, `top`, `left`, `margin`).
- **Responsive by Default**: Effects must work flawlessly on mobile (375px), tablet (768px), and desktop (1200px+).
- **Reduced Motion Support**: Always provide `@media (prefers-reduced-motion: reduce)` fallbacks.

---

## 2. Local Development Setup

### Prerequisites
- **Node.js**: `v18.x` or higher (`v20.x LTS` recommended)
- **Package Manager**: `npm` v9+ (or `pnpm` / `yarn`)
- **Git**: Installed and configured

### Step-by-Step Setup
1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/codespark.git
   cd codespark
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   *(Note: CodeSpark runs out of the box with local SQLite even without Supabase credentials!)*

4. **Start the Development Servers**:
   ```bash
   # Starts both Vite Frontend (:5173) and Express API (:5000)
   npm start
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 3. Git Branching & Commit Conventions

### Branch Naming Strategy
Branch names must reflect the intent of your change:
- `feature/<feature-name>` (e.g., `feature/dark-mode-preset`)
- `effect/<effect-slug>` (e.g., `effect/magnetic-dock`)
- `fix/<bug-description>` (e.g., `fix/mobile-marquee-flicker`)
- `docs/<doc-topic>` (e.g., `docs/api-rate-limits`)

### Conventional Commits Standard
Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description in present tense>

[optional body explaining rationale]
```

**Types**:
- `feat`: A new user-facing feature or effect
- `fix`: A bug fix
- `docs`: Documentation updates only
- `style`: Formatting, spacing, CSS contrast tweaks without logic change
- `refactor`: Code restructuring without modifying behavior
- `perf`: Performance optimization
- `test`: Adding or updating test cases

**Example**:
```bash
git commit -m "feat(effects): add WebGL fluid splash cursor interaction"
```

---

## 4. How to Add a New Effect (Tutorial)

There are two ways to contribute an effect to CodeSpark:

### Method A: Via Community Submission (No Code Edit Needed)
1. Run the app locally and navigate to [http://localhost:5173/submit](http://localhost:5173/submit).
2. Enter your title, category, tags, and description.
3. Paste your standalone HTML, CSS, and optional JavaScript into the dual-pane editor.
4. Test interactions live in the sandbox.
5. Click **Submit Effect**. Once verified in the Admin Console, it ships to the public library!

---

### Method B: Native React Component Integration (Core Contributor)

To add a high-performance, zero-eval React component (like `SplashCursor`):

1. **Create the component** in `src/effects/<YourEffectName>.tsx`:
   ```typescript
   // src/effects/MagneticButton.tsx
   import React, { useRef, useState } from 'react';

   export default function MagneticButton({ text = "Hover Me" }: { text?: string }) {
     // Component implementation...
     return (
       <button className="relative px-6 py-3 rounded-xl bg-[#FF4B32] text-white font-bold transition-transform">
         {text}
       </button>
     );
   }
   ```

2. **Register the component in [`src/effects/registry.tsx`](file:///e:/DevWorkspace/Projects/CodeSpark/src/effects/registry.tsx)**:
   - Import your component.
   - Add it to `MANUAL_REACT_EFFECTS` with metadata (`id`, `slug`, `name`, `category`, `tags`).
   - Map it inside `EFFECT_REGISTRY`:
     ```typescript
     export const EFFECT_REGISTRY: Record<string, React.ComponentType<any>> = {
       // ...
       MagneticButton: MagneticButton,
     };
     ```

3. **Add mock code snippets in [`src/mocks/code.ts`](file:///e:/DevWorkspace/Projects/CodeSpark/src/mocks/code.ts)**:
   Provide copy-pasteable HTML, CSS, and JS so developers can use the effect without React if they prefer.

4. **Verify Build**:
   ```bash
   npm run build
   ```
   Ensure `tsc` compiles with 0 errors.

---

## 5. Pull Request Checklist

Before opening a Pull Request:
- [ ] Code follows CodeSpark Design System color tokens (`var(--bg-primary)`, `var(--accent)`).
- [ ] No hardcoded muddy brown text or unreadable low-contrast combinations.
- [ ] No external telemetry, tracking, or promotional watermarks.
- [ ] Build passes locally with `npm run build`.
- [ ] Component tested on Chrome, Firefox, Safari, and mobile viewport (375px).
- [ ] PR title follows Conventional Commits (e.g. `feat(effects): add magnetic dock interaction`).
