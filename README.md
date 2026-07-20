# ✈️ Travel AI

A full-stack **Agentic AI travel platform** where travelers discover, customize, and book curated expedition packages — powered by a Groq LLM recommendation engine and a real-time streaming AI chat concierge.

> Built with Next.js, TypeScript, Node.js, Express, MongoDB, and Groq AI.

---

## 🔗 Live Links

| | URL |
|---|---|
| 🌐 **Frontend** | [https://project-travel-ai.vercel.app](https://project-travel-ai.vercel.app) |
| ⚙️ **Backend API** | [https://project-travel-ai-backend.onrender.com](https://project-travel-ai-backend.onrender.com) |
| 📁 **GitHub** | [https://github.com/Zihad-1883/Project-Travel-AI](https://github.com/Zihad-1883/Project-Travel-AI) |

---

## 🚀 Features

### 🧠 AI-Powered
- **Smart Trip Planner** — AI recommendation engine that matches user preferences (location, budget, travel style, interests) against real database packages with a match score and reasoning
- **AI Chat Concierge** — Real-time streaming chat assistant that understands your packages, bookings, and can answer travel questions with conversation history
- **Refinement Engine** — Quick preset buttons (Make it cheaper, Luxury Focus, Shorter Trip, Adventure) that re-run AI search with adjusted parameters

### 👤 Authentication
- JWT-based login & registration
- **Google OAuth** (one-click sign-in)
- **Demo accounts** — instant login for Traveler and Admin roles

### 🗺️ Package Catalog (Explore)
- Full-text search
- Filter by: Location, Max Budget (range slider), Min Rating
- Sort by: Newest, Price Low→High, Price High→Low, Top Rated
- Paginated results with skeleton loaders
- 4-column desktop grid

### 📦 Package Details
- Full description, images, pricing, duration, group size
- Booking request form (auth required)
- Duplicate booking prevention

### 📋 My Bookings (Traveler)
- View all booking requests with live status badges: Pending / Approved / Rejected / Cancelled
- Cancel pending bookings

### 🛠️ Admin Console (`/items/manage`)
- Analytics dashboard with Recharts (package distribution by region, booking status pie chart)
- Tab-based management: **My Packages** + **Requested Bookings**
- Approve / Reject traveler booking requests
- Delete packages with confirm modal

### ➕ Add Package (`/items/add`)
- Protected admin-only form
- Fields: title, short description, full description, location, price, duration, images, max group size, rating

---

## 🏗️ Tech Stack

### Frontend (`/client`)
| Tech | Usage |
|---|---|
| Next.js 14 (App Router) | Framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| TanStack Query | Server state & caching |
| Recharts | Analytics charts |
| React Hot Toast | Notifications |
| `@react-oauth/google` | Google login |

### Backend (`/server`)
| Tech | Usage |
|---|---|
| Node.js + Express | API server |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| Groq SDK | LLM inference (AI features) |
| Server-Sent Events | Streaming chat responses |

---

## 📁 Project Structure

```
Travel AI/
├── client/                   # Next.js frontend
│   └── src/
│       ├── app/
│       │   ├── page.tsx          # Landing page (8 sections)
│       │   ├── explore/          # Package listing with filters
│       │   ├── packages/[id]/    # Package details + booking
│       │   ├── trip-planner/     # AI recommendation engine
│       │   ├── my-bookings/      # Traveler booking tracker
│       │   ├── items/
│       │   │   ├── add/          # Admin: create package
│       │   │   └── manage/       # Admin: manage packages + bookings
│       │   ├── about/
│       │   ├── blog/
│       │   ├── login/
│       │   └── signup/
│       ├── components/
│       │   ├── layout/           # Navbar, Footer
│       │   └── ai/               # ChatWidget (streaming)
│       ├── context/
│       │   └── AuthContext.tsx   # Global auth state
│       └── hooks/                # usePackages, useBookings, useRecommendations, useChat
│
└── server/                   # Express backend
    └── src/
        ├── modules/
        │   ├── auth/             # Login, register, Google OAuth
        │   ├── users/            # User profile
        │   ├── packages/         # Package CRUD + filtering
        │   ├── bookings/         # Booking management
        │   └── ai/               # Recommendation engine + Chat service
        ├── middleware/
        └── config/
```

---

## ⚙️ Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas URI)
- Groq API key
- Google OAuth Client ID

### 1. Clone the repo
```bash
git clone https://github.com/Zihad-1883/Project-Travel-AI.git
cd Project-Travel-AI
```

### 2. Setup the backend
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
CLIENT_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
NODE_ENV=development
```

```bash
npm run dev
```

### 3. Setup the frontend
```bash
cd client
npm install
```

Create `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

```bash
npm run dev
```

Frontend runs at **http://localhost:3000** | Backend at **http://localhost:5000**

---

## 🔐 Demo Accounts

On the login page, click the quick demo buttons:

| Role | Email | Password |
|---|---|---|
| 👨‍💻 Traveler | `traveler@travelai.com` | `password123` |
| 🛠️ Admin | `admin@travelai.com` | `password123` |

---

## 🤖 AI Features Explained

### Trip Planner (Recommendation Engine)
1. User sets preferences: destination, budget, duration, travel style, interests, custom instructions
2. Backend fetches matching packages from MongoDB
3. Groq LLM ranks candidates with a **match score (0–100)** and human-readable **match reason**
4. Results displayed with refinement presets for further iteration

### AI Chat Concierge
1. Floating chat widget available site-wide
2. Messages are streamed token-by-token via Server-Sent Events
3. The AI has tool access to query real packages and bookings from the database
4. Full conversation history maintained per session

---

## 📸 Pages Overview

| Page | Access | Description |
|---|---|---|
| `/` | Public | Landing page with hero slider, features, stats, testimonials, FAQ, newsletter |
| `/explore` | Public | Browse all packages with filters + sorting |
| `/packages/[id]` | Public | Package details + booking form |
| `/trip-planner` | Traveler | AI-powered recommendation engine |
| `/my-bookings` | Traveler | Track booking statuses + cancel |
| `/items/add` | Admin | Create new travel package |
| `/items/manage` | Admin | Analytics, package list, approve/reject bookings |
| `/about` | Public | About the platform |
| `/blog` | Public | Travel journal articles |
| `/login` | Public | Email + Google OAuth + Demo login |
| `/signup` | Public | Register as traveler |

---

## 👨‍💻 Author

**Zihad** — [GitHub](https://github.com/Zihad-1883)
