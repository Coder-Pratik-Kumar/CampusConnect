# 🎓 CampusConnect — Peer-to-Peer Skill Exchange Platform

**CampusConnect** is a full-stack peer-to-peer learning and skill exchange platform built specifically for college students. It enables students to list skills they can teach and skills they want to learn, discover compatible peers through an intelligent rule-based matching engine, schedule structured learning sessions, exchange verified peer reviews, and stay updated through event-driven notifications.

---

## 🌟 Key Features

### 1. 🔐 Authentication & Session Security
- Secure registration and login with input validation.
- Password encryption using **bcryptjs** (salt rounds: 10). Passwords are never returned in responses.
- Stateless authentication using **JSON Web Tokens (JWT)** with Bearer token authentication headers.
- Persistent session restoration with auto-login via `/api/auth/me`.
- Protected client-side and server-side routes with unauthorized access redirection.

### 2. 👤 Profile & Skills Management
- Comprehensive student profile: Name, College, Major, Bio, Avatar, Availability Schedule.
- Distinct skill categorization: **Teach Skills** (skills offered) and **Learn Skills** (skills sought).
- Interactive Skill Manager with chip adding, deletion, and quick-add suggestions.
- Full availability scheduler with day-of-the-week and time range slot configuration.
- Real-time persistence to MongoDB database.

### 3. 🎯 Rule-Based Compatibility & Peer Discovery
- Transparent multi-factor scoring algorithm (0–100 points):
  - **Reciprocal Skill Match (80 pts):** Student A teaches what Student B wants, AND Student B teaches what Student A wants.
  - **One-Way Skill Match (40 pts):** Student B teaches what Student A wants.
  - **Same College Bonus (+10 pts):** Shared campus context for easy in-person or campus collaboration.
  - **Schedule Overlap (+10 pts):** Shared availability days for effortless scheduling.
- Rich search and filtering by query keyword and campus/college.
- Dynamic sorting by Best Match, Rating, and Sessions Completed.
- Match reason highlights explaining why two students are compatible.

### 4. 📅 Learning Sessions Lifecycle
- Structured end-to-end session workflow:
  - **Create Request (`pending`):** Select peer, target skill, date, time, duration, and learning notes.
  - **Provider Response:** Provider can **Accept** (`accepted`) or **Decline** (`rejected`).
  - **Cancellation:** Requesters can cancel pending requests; either participant can cancel accepted sessions.
  - **Completion:** Either participant can mark an accepted session as **Completed** (`completed`).
- Strict participant-level authorization checks on all session routes.
- Self-session request prevention and premature completion protection.

### 5. ⭐ Reviews, Ratings & Reputation System
- Verified peer exchange reviews: only valid participants of **completed** sessions can submit reviews.
- 1–5 star rating with comprehensive feedback comments.
- Dynamic recalculation of recipient's average rating (rounded to 1 decimal) and total review count in MongoDB.
- Duplicate review prevention ensuring each participant can only review a completed session once.
- Interactive rating breakdown distributions (5-star down to 1-star percentage bars) on public profiles and reviews page.

### 6. 🔔 Notifications & Event Streams
- Automatic system notifications generated for core platform events:
  - Session requested ➔ Provider notified
  - Session accepted / declined ➔ Requester notified
  - Session completed / cancelled ➔ Participant notified
  - Review submitted ➔ Reviewee notified
- Real-time unread badges on navigation bar and sidebar.
- Single click "Mark as read" and bulk "Mark all as read" endpoints.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, JavaScript (ES6+), React Router v6, Tailwind CSS v3, Lucide React, Context API |
| **Backend** | Node.js, Express.js (REST API Architecture, CORS, Centralized Error Handling) |
| **Database** | MongoDB, Mongoose ODM (Schemas, Indexes, Validations, Cascades) |
| **Security** | JWT (JSON Web Tokens), bcryptjs, Secure Headers, Input Sanitization |
| **Testing** | Custom HTTP/MongoDB Automated API Test Suites (39/39 Automated Tests Passing) |

---

## 📁 Project Structure

```
CampusConnect/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & MongoDB connection
│   │   ├── controllers/     # Business logic (auth, profile, matches, sessions, reviews, notifications)
│   │   ├── middleware/      # JWT auth guard, error handler, 404 fallback
│   │   ├── models/          # Mongoose models (User, Skill, Session, Review, Notification)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Matching engine algorithm
│   │   ├── server.js        # Express application entry point
│   │   └── testAll.js       # Master backend test suite runner
│   ├── .env.example         # Backend environment variable template
│   └── package.json
├── src/
│   ├── components/
│   │   ├── common/          # Brand logo, icons
│   │   ├── layout/          # TopNavbar, Sidebar, AppLayout
│   │   └── ui/              # Stitch-inspired UI kit (Avatar, Badge, Button, Card, Input, SkillTag, Modal)
│   ├── context/             # AuthContext (JWT management, user state)
│   ├── data/                # Navigation configurations
│   ├── hooks/               # Custom hooks (useProfile, useMatches, useSessions, useReviews, useNotifications)
│   ├── pages/               # LandingPage, LoginPage, RegisterPage, DashboardPage, DiscoverPage,
│   │                        # ProfilePage, SkillsPage, SessionsPage, SessionRequestPage, ReviewsPage,
│   │                        # NotificationsPage, SettingsPage
│   ├── routes/              # AppRoutes & ProtectedRoute
│   ├── utils/               # apiFetch client, className merge helper
│   ├── App.jsx
│   └── main.jsx
├── .env.example             # Frontend environment variable template
├── .gitignore               # Comprehensive Git ignore rules
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local community edition or MongoDB Atlas connection URI)

### 1. Clone & Setup Repository
```bash
git clone https://github.com/your-username/CampusConnect.git
cd CampusConnect
```

### 2. Configure Backend Environment
Navigate to `backend/` and create `.env` from `.env.example`:
```bash
cd backend
cp .env.example .env
npm install
```
Configure your `backend/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/campusconnect
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
```

### 3. Configure Frontend Environment
In the root directory, create `.env` from `.env.example`:
```bash
cp .env.example .env
npm install
```
Configure your `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start Development Servers

**Start Backend API Server:**
```bash
cd backend
npm run dev
# Server running at http://localhost:5000
```

**Start Frontend Development Server (in root):**
```bash
npm run dev
# Application running at http://localhost:5173
```

---

## 🧪 Running Automated Backend Tests

The project includes an isolated automated test suite that boots an ephemeral Express instance and tests real MongoDB transactions:

```bash
# Run Master Test Suite (All 6 Suites, 39 Tests)
node backend/src/testAll.js

# Or run individual test suites:
node backend/src/testFrontendAuthIntegration.js # Auth (5/5)
node backend/src/testProfileApi.js              # Profile & Skills (6/6)
node backend/src/testMatchingApi.js             # Matching Engine (7/7)
node backend/src/testSessionsApi.js             # Sessions Lifecycle (7/7)
node backend/src/testReviewsApi.js              # Reviews & Ratings (6/6)
node backend/src/testNotificationsApi.js        # Notifications Stream (8/8)
```

---

## 🏗️ Production Build

To build the client bundle for production:
```bash
npm run build
```
Vite transforms modules and generates an optimized production bundle in `dist/`.

---

## 🌐 Deployment Plan

- **Frontend:** Deploy to **Vercel** or **Netlify** with environment variable `VITE_API_URL=https://<your-backend-api>/api`.
- **Backend:** Deploy to **Render**, **Railway**, or **AWS EC2** with environment variables (`PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`).
- **Database:** **MongoDB Atlas** M0/M10 cluster with IP access lists configured.

---

## ⚠️ Known Limitations
- **REST Notification Polling:** System notifications are delivered via authenticated REST requests (`GET /api/notifications`) on page load and action triggers rather than WebSockets/Socket.IO.
- **In-App Communication:** Direct peer communication is conducted via session meeting links and notes rather than an integrated real-time instant messenger.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
