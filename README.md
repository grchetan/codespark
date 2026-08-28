# CodeSpark — Discover, Preview & Copy Beautiful UI Effects

A modern developer platform and living library for frontend UI effects and interactions (hover effects, 3D cards, text animations, cursor followers, loaders, and transitions) with instant copyable code and live interactive preview sandboxes.

---

## ⚡ Tech Stack

- **Frontend**: React 18, React Router DOM 6, Tailwind CSS 3, Vite 5, Remix Icon, i18next
- **Backend**: Express 4, SQLite (`better-sqlite3`), JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, CORS
- **Tooling**: TypeScript 5, tsx, concurrently, PostCSS, Autoprefixer

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Full Application (Frontend + Backend)
```bash
npm start
```
- **Frontend URL**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

### 3. Or Run Independently
```bash
# Start Backend API Server
npm run server

# Start Frontend Dev Server
npm run dev

# Production Build
npm run build
```

---

## 🛡️ Default Admin Credentials

To access the **Admin Console** (`/admin`):
- **Email**: `admin@codespark.dev`
- **Password**: `Admin@123`

---

## 📂 Project Structure

```
codespark/
├── data/                      # SQLite database (auto-created & seeded)
│   └── effekt.db
├── server/                    # Express REST API Server
│   ├── routes/
│   │   ├── auth.ts            # Signup, login, session
│   │   ├── effects.ts         # Effects catalog, search, filter, like, save, submit
│   │   ├── admin.ts           # Overview, submissions, official effects, user ban/role, requirements
│   │   ├── contact.ts         # Contact form inquiries
│   │   └── newsletter.ts      # Newsletter subscriptions
│   ├── auth.ts                # JWT authentication & authorization
│   ├── db.ts                  # SQLite schema initialization & seeding
│   └── index.ts               # Server entry point (port 5000)
├── src/                       # React 18 Frontend
│   ├── components/
│   │   ├── base/              # Scroll Reveal animations
│   │   └── feature/           # Navbar, Footer, EffectCard, CodeBlock, LivePreview, Demos
│   ├── context/               # AuthContext (user session, JWT storage)
│   ├── pages/
│   │   ├── home/              # Hero, Showcase, Trending, Creators, Impact
│   │   ├── effects/           # Effects catalog with category filters, difficulty, search, sort
│   │   ├── effect/            # Effect details & code playground (HTML/CSS/JS)
│   │   ├── submit/            # Effect Creator Studio with real-time live preview sandbox
│   │   ├── community/         # Leaderboard, creators, recent activity
│   │   ├── about/             # FAQ, values, platform story
│   │   ├── contact/           # Contact support form
│   │   ├── auth/              # Sign in & Sign up pages
│   │   ├── admin/             # Admin control center (verifications, users, requirements)
│   │   └── NotFound.tsx       # 404 error page
│   ├── router/                # React Router v6 setup
│   ├── mocks/                 # Fallback offline mock data & code snippets
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css              # Design system & Tailwind layer styles
├── index.html                 # HTML template with Google Fonts & RemixIcon
├── package.json               # Dependencies & scripts
├── tailwind.config.js         # CodeSpark color palette & animations
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite configuration with API proxy
```

---

## ✨ Features

1. **Interactive Effects Library**: Over 16+ built-in interactive UI effects across Hover, 3D/Tilt, Text, Cursor, Loaders, Cards, Transitions, and Creative categories.
2. **Real-time Live Sandbox Studio (`/submit`)**: Write HTML, CSS, and JS in a dual-pane editor and watch the preview update live in an isolated sandbox. Publish straight to the library!
3. **Full Authentication System**: User registration, login, JWT session management, role-based permissions (Member, Moderator, Admin).
4. **Admin Control Center (`/admin`)**:
   - Overview dashboard metrics (Total effects, Users, Pending reviews, Monthly views).
   - Verify and approve/reject community submissions.
   - Publish official effects with custom CSS.
   - User moderation (Ban/Unban, role changes).
   - Manage community requirements and feature request votes.
5. **Contact & Newsletter**: Local persistence for newsletter subscribers and contact inquiries.
6. **Zero Third-Party AI Branding**: 100% clean, independent codebase with no external watermark scripts, ads, or tracking.
