# CodeSpark REST API Specification

> Complete reference manual for the CodeSpark backend REST API, including authentication schemes, endpoints, payload formats, query parameters, and response schemas.

---

## 1. Overview & Base URL

The CodeSpark backend operates as an Express REST service. In local development, the API runs on port 5000 and is automatically proxied through Vite:

- **Local Base URL**: `http://localhost:5000/api`
- **Vite Proxy Path**: `/api` (automatically routed to `:5000` via `vite.config.ts`)
- **Content Type**: `application/json`

---

## 2. Authentication Scheme

Protected endpoints require a JSON Web Token (JWT) passed in the `Authorization` HTTP header using the standard Bearer schema:

```http
Authorization: Bearer <jwt_token>
```

Tokens are signed using `HS256` and encode the user's `userId`, `email`, and `role` (`member`, `moderator`, `admin`, `superadmin`). Tokens expire in **7 days**.

---

## 3. Authentication Endpoints (`/api/auth`)

### Sign Up (`POST /api/auth/signup`)
Registers a new member account and issues a session JWT.

- **Rate Limit**: 10 failed attempts per 15 minutes per IP.
- **Request Body**:
  ```json
  {
    "name": "Alex Developer",
    "email": "alex@studio.dev",
    "password": "SecurePassword123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "u_1726743123456",
      "name": "Alex Developer",
      "email": "alex@studio.dev",
      "role": "member",
      "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex%20Developer",
      "effects_count": 0
    }
  }
  ```
- **Errors**: `400 Bad Request` (Invalid email format, password < 8 characters, or duplicate account).

### Log In (`POST /api/auth/login`)
Authenticates existing credentials.

- **Request Body**:
  ```json
  {
    "email": "alex@studio.dev",
    "password": "SecurePassword123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "u_1726743123456",
      "name": "Alex Developer",
      "email": "alex@studio.dev",
      "role": "member",
      "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex%20Developer"
    }
  }
  ```
- **Errors**: `401 Unauthorized` (Invalid credentials or account banned).

### Current User Profile (`GET /api/auth/me`)
Retrieves the profile of the currently authenticated session.

- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "user": {
      "id": "u_1726743123456",
      "name": "Alex Developer",
      "email": "alex@studio.dev",
      "role": "member",
      "avatar": "https://api.dicebear.com/...",
      "bio": "Frontend designer & motion dev",
      "effects_count": 2
    }
  }
  ```

---

## 4. Effects Catalog Endpoints (`/api/effects`)

### List Effects (`GET /api/effects`)
Fetches published effects with optional search, category filters, and sorting.

- **Query Parameters**:
  | Parameter | Type | Allowed Values | Description |
  | :--- | :--- | :--- | :--- |
  | `cat` | string | `hover`, `text`, `cursor`, `3d`, `loader`, `card`, `transitions`, `creative`, `all` | Filter by category |
  | `difficulty`| string | `easy`, `medium`, `hard`, `all` | Filter by implementation difficulty |
  | `q` | string | any text (max 200 chars) | Full-text search across name, description, tags |
  | `sort` | string | `trending` (default), `new`, `popular`, `name` | Ordering criterion |

- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "count": 18,
    "effects": [
      {
        "id": "e_splash_cursor",
        "slug": "splash-cursor",
        "name": "Fluid Splash Cursor",
        "description": "Interactive WebGL multi-color fluid simulation with cursor velocity advection.",
        "category": "cursor",
        "categoryLabel": "Cursor Effects",
        "difficulty": "medium",
        "likes": 240,
        "saves": 115,
        "views": 4820,
        "author": {
          "id": "u_codespark",
          "name": "CodeSpark Official",
          "handle": "@codespark",
          "avatar": "https://api.dicebear.com/..."
        },
        "tags": ["webgl", "cursor", "fluid", "interactive"],
        "createdAt": "2026-09-01"
      }
    ]
  }
  ```

### Get Effect Details (`GET /api/effects/:id`)
Fetches code snippets (HTML, CSS, JS) and step-by-step instructions for a single effect.

- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "effect": {
      "id": "e_tilt_card",
      "slug": "tilt-card",
      "name": "3D Perspective Tilt Card",
      "html_code": "<div class=\"tilt-box\">...</div>",
      "css_code": ".tilt-box { transform-style: preserve-3d; ... }",
      "js_code": "card.addEventListener('mousemove', (e) => { ... });",
      "instructions": "Place the HTML card inside your grid and attach mousemove listener."
    }
  }
  ```

### Toggle Like (`POST /api/effects/:id/like`)
Increments or decrements an effect's like count.

- **Headers**: `Authorization: Bearer <token>` (Optional; unauthenticated calls track by IP)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "liked": true,
    "likeCount": 241
  }
  ```

### Toggle Save / Bookmark (`POST /api/effects/:id/save`)
Saves or unsaves an effect to the user's personal collection.

- **Headers**: `Authorization: Bearer <token>` (Required)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "saved": true,
    "saveCount": 116
  }
  ```

### Submit Community Effect (`POST /api/effects/submit`)
Submits a new effect for review.

- **Headers**: `Authorization: Bearer <token>` (Required)
- **Rate Limit**: Max 5 submissions per hour per IP.
- **Request Body**:
  ```json
  {
    "name": "Glow Button Interaction",
    "category": "hover",
    "description": "Smooth radial gradient spotlight following cursor coordinates.",
    "difficulty": "easy",
    "tags": ["button", "glow", "spotlight"],
    "html_code": "<button class=\"glow-btn\"><span>Button</span></button>",
    "css_code": ".glow-btn { position: relative; ... }",
    "js_code": ""
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Effect submitted for verification.",
    "id": "sub_1726745912345"
  }
  ```

---

## 5. Public Inquiries & Anti-Spam Endpoints

### Newsletter Subscription (`POST /api/newsletter`)
Subscribes an email address to weekly updates.

- **Honeypot Protection**: The request includes a hidden field `website_alt`. If populated by a bot, the submission is silently dropped and returns a fake success response.
- **Request Body**:
  ```json
  {
    "email": "developer@studio.dev",
    "website_alt": ""
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "You're in! Fresh effects land in your inbox every week."
  }
  ```

### Contact Support Inquiry (`POST /api/contact`)
Submits a message to support.

- **Request Body**:
  ```json
  {
    "name": "Sarah Chen",
    "email": "sarah@company.com",
    "subject": "Commercial Licensing",
    "message": "Can we bundle these effects in an enterprise SaaS?",
    "website_alt": ""
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Message received! Our engineering team will respond shortly."
  }
  ```

---

## 6. Administration Endpoints (`/api/admin`)

> **Access Restriction**: Requires `Authorization: Bearer <token>` where user role is `moderator`, `admin`, or `superadmin`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/overview` | Platform metrics (Total effects, users, views, pending reviews) |
| `GET` | `/api/admin/submissions` | List pending community submissions awaiting approval |
| `POST` | `/api/admin/submissions/:id/approve` | Approve submission and publish to public catalog |
| `POST` | `/api/admin/submissions/:id/reject` | Reject submission with optional feedback note |
| `GET` | `/api/admin/users` | List registered platform accounts |
| `POST` | `/api/admin/users/:id/role` | Update user role (`member`, `moderator`, `admin`) |
| `POST` | `/api/admin/users/:id/ban` | Toggle account suspension |
