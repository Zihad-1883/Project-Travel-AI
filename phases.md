# phases.md — Build Phases

**Precedence reminder:** Phases only sequence work already defined in `prd.md`, `architecture.md`, and `requirements.md`. No phase introduces new scope. Each phase should end in something demoable, testable, and **deployed** before moving to the next — deployment is not saved for the end, it happens from Phase 0 onward.

**Project layout reminder:** the repo has two top-level folders — `client/` (Next.js App Router, per `architecture.md` §3.1) and `server/` (feature-first Express + raw MongoDB driver, per `architecture.md` §3.2). Every phase below lists tasks split explicitly by `client/` and `server/`.

---

## Phase 0 — Project Setup + Early Deployment
**Goal:** a running skeleton, deployed, nothing functional yet.

**server/**
- Initialize Express + TypeScript project inside `server/`.
- Set up `config/db.ts` (raw `MongoClient` connection, `getDb()` export) and `config/env.ts` (validated env loading).
- Set up `app.ts` (Express app + middleware, no `listen()`) and `server.ts` (connects DB, then starts the app) per the split in `architecture.md` §3.2.
- Add a single health-check route (`GET /api/health`) to confirm the deployed server is alive.
- Set up ESLint + Prettier.

**client/**
- Initialize Next.js (App Router) + TypeScript + Tailwind inside `client/`.
- Root `layout.tsx` with placeholder Navbar/Footer shell (logged-out state only).
- Set up `lib/api.ts` fetch wrapper pointed at the server's health-check route to confirm connectivity.
- Set up ESLint + Prettier.

**Deployment (do this now, not later)**
- Deploy `server/` (Render) with MongoDB connected — confirm `/api/health` responds in production.
- Deploy `client/` (Vercel) pointed at the deployed server URL.
- Confirm the deployed client can successfully hit the deployed server's health check end-to-end.

**Done when:** both `client/` and `server/` are live at real URLs, connected to each other and to MongoDB, with zero features yet. This deployment pipeline stays in place and gets redeployed at the end of every phase from here on.

---

## Phase 1 — Authentication
**Goal:** users can register, log in, and roles are enforced — deployed and testable live.

**server/**
- `modules/auth/` (`auth.routes.ts`, `auth.controller.ts`, `auth.service.ts`, `auth.types.ts`): register, login, password hashing, JWT issuing.
- `modules/user/` (`user.routes.ts`, `user.controller.ts`, `user.service.ts`, `user.types.ts`): raw `db.collection("users")` queries.
- `middleware/auth.middleware.ts` (verifies JWT) and `middleware/role.middleware.ts` (admin-only guard).
- Google OAuth flow wired into `auth.service.ts`.
- Seed script: one demo traveler account, one demo admin account.

**client/**
- `app/login/page.tsx` and `app/signup/page.tsx` with validation + error handling.
- Demo login button (auto-fills the seeded demo traveler credentials).
- Google login button.
- `context/` AuthContext (or lightweight store) + `lib/auth.ts` token helpers.
- `middleware.ts` for edge-level redirect UX (real enforcement stays server-side per `architecture.md` §3.1 note).
- Logged-in vs logged-out Navbar states (3 routes logged out / 5 routes logged in, per `requirements.md` §3).

**Deployment:** redeploy both `client/` and `server/`; confirm demo login and Google login both work on the **live** URLs, not just localhost.

**Done when:** a traveler and an admin demo account both exist and work in production, and protected-route redirects function correctly.

---

## Phase 2 — Core Package Browsing (Public)
**Goal:** the non-AI core of the product works end-to-end, live.

**server/**
- `modules/packages/` (`packages.routes.ts`, `packages.controller.ts`, `packages.service.ts`, `packages.types.ts`): CRUD + list/filter/sort/paginate queries against `db.collection("packages")`.
- Indexes on `location`/`price` for filtering (per `architecture.md` §5).
- Seed real, non-placeholder package data.

**client/**
- `app/page.tsx` (Home): hero + minimum 7 sections (`requirements.md` §3).
- `app/explore/page.tsx`: search, filters (≥2 fields), sorting, pagination/infinite scroll, skeleton loaders (`requirements.md` §6).
- `app/packages/[id]/page.tsx`: gallery, overview, specs, reviews, related packages (`requirements.md` §5).
- `app/about/page.tsx`, `app/blog/page.tsx`, and Footer with working links (`requirements.md` §10).

**Deployment:** redeploy; confirm a logged-out visitor can browse, search, filter, and view details on the **live** site using real seeded data.

**Done when:** public browsing fully works in production.

---

## Phase 3 — Admin Package Management
**Goal:** admin can run the "business" side without AI yet, live.

**server/**
- Add admin-only create/delete endpoints to `modules/packages/` (guarded by `role.middleware.ts`).
- Ensure ownership checks (`ownerAdminId`) are enforced server-side on delete.

**client/**
- `app/items/add/page.tsx` (admin-only, redirects otherwise).
- `app/items/manage/page.tsx` — "My Packages" tab: view/delete.

**Deployment:** redeploy; confirm on the live site that admin can add a package and it appears immediately on `/explore`, and can delete it from `/items/manage`.

**Done when:** the full admin package lifecycle works in production.

---

## Phase 4 — AI Smart Recommendation Engine
**Goal:** first required AI feature, fully working, live.

**server/**
- `modules/ai/claude.service.ts`: isolated Anthropic API calls (server-side only, per `rules.md` §2).
- `modules/ai/recommendation.service.ts`: sends user profile + real package data to Claude, requests structured JSON, validates response shape before returning.
- `modules/ai/ai.routes.ts` + `ai.controller.ts`: `POST /api/ai/recommend`.
- `userInteractions` collection logging (views/saves) feeding into future calls.

**client/**
- `app/trip-planner/page.tsx`: preference form UI, ranked results with match reasons, refinement controls.
- `hooks/useRecommendations.ts` (TanStack Query wrapper).

**Deployment:** redeploy; confirm the live Trip Planner returns real ranked packages and that refining the query changes results, using the production Claude API key (never exposed client-side).

**Done when:** the recommendation engine works end-to-end in production.

---

## Phase 5 — AI Chat Assistant
**Goal:** second required AI feature, fully working, live.

**server/**
- `modules/ai/chat.service.ts`: conversation history persistence (`chatMessages` collection), streaming response handling.
- `modules/ai/ai.routes.ts` extended with `POST /api/ai/chat` (streamed).
- Basic tool-use: lookup into `packages.service.ts` / `tripRequests.service.ts` when the assistant needs app data.

**client/**
- `components/ai/ChatWidget.tsx`: typing indicator, streamed text render, suggested follow-up prompts, conversation history UI.
- `hooks/useChat.ts`.

**Deployment:** redeploy; confirm on the live site that a multi-turn conversation streams correctly, follow-up suggestions appear, and context carries across turns ("make it cheaper").

**Done when:** the chat assistant works end-to-end in production.

---

## Phase 6 — Custom Trip Requests & Admin Approval (Business Logic)
**Goal:** implement the approval workflow from `prd.md` §7, live — the most important business-logic phase.

**server/**
- `modules/tripRequests/` (`tripRequests.routes.ts`, `controller.ts`, `service.ts`, `types.ts`): create request (`pending`), admin quote/reject, traveler accept (`approved`). Status transitions enforced server-side, never trusted from the client.
- `modules/bookings/` (`bookings.routes.ts`, `bookings.controller.ts`, `bookings.service.ts`, `bookings.types.ts`): standard package bookings workflow. Creates pending bookings for logged-in travelers (POST `/api/bookings`), lists bookings, and allows admins to approve/reject status (PATCH `/api/bookings/:id/status`).

**client/**
- "Request this trip" action wired into the Trip Planner / Chat Widget → creates a `pending` request.
- `app/my-trips/page.tsx`: traveler's custom requests with status badges.
- `app/my-bookings/page.tsx`: traveler's standard package bookings with status badges (pending, approved, rejected) to keep track of booking requests.
- `app/packages/[id]/page.tsx` updated with a "Book Now" CTA above the AI planner button, confirming reservation request of standard packages for logged-in travelers.
- `app/items/manage/page.tsx` extended with two tabs:
  - "My Packages" for CRUD package templates.
  - "Standard Bookings" to view, approve, and reject passenger booking requests.

**Deployment:** redeploy; run a full request → quote → accept cycle live, and confirm rejected/pending states also render correctly in production.

**Done when:** the complete custom and standard booking approval workflow is demoable on the live site.

---

## Phase 7 — Polish, Additional Pages, UX Pass
**Goal:** meet every remaining UI/UX requirement, live.

**client/**
- Confirm 3-color system and consistent card styling across the whole app (`design.md`).
- Full responsive pass: mobile, tablet, desktop on every page.
- Replace any remaining placeholder content.
- Add any remaining supporting pages (Contact, FAQ, etc.).
- Error/loading/empty state pass on every data-fetching hook (per `rules.md` §5).
- Accessibility pass (alt text, contrast, keyboard nav).

**server/**
- Confirm consistent error response shape and status codes across every module (`rules.md` §5).
- Review CORS is restricted to the deployed client origin in production.

**Deployment:** redeploy; do a full click-through of the live site on real mobile/tablet/desktop viewports.

**Done when:** the live app looks and behaves consistently on all screen sizes with zero placeholder content or dead links.

---

## Phase 8 — Final Testing & Submission
**Goal:** ship it — but since deployment has been continuous since Phase 0, this phase is verification, not a first deploy.

**server/ + client/**
- Manual end-to-end pass through every flow in `architecture.md` §2, on the live URLs.
- Refresh the seed dataset for a clean demo (packages, one demo traveler, one demo admin, at least one full custom-trip-request cycle already in `approved` state).
- Verify demo login button and Google login work on the deployed version.
- Final production build check for both `client/` and `server/` (no console errors, no dev-only code paths left enabled).

**Submission**
- Confirm GitHub repos are accessible and README instructions are accurate for both `client/` and `server/`.
- Submit live URL + repo links (`requirements.md` §13).

**Done when:** a stranger can open the live link, use the demo login, and successfully exercise both AI features and the admin approval flow without any local setup.

---

## Future Phase — Interactive Traveler Blogs
**Goal:** Allow authenticated travelers to author, edit, and post their own travel blog posts directly to the platform, replacing static blog content.

**server/**
- `modules/blogs/` (`blogs.routes.ts`, `controller.ts`, `service.ts`, `types.ts`):
  - CRUD endpoints for blog posts (create, read/list, update, delete).
  - Schema: `{ _id, title, category, content, imageUrl, authorId (User), readTime, createdAt }`.
  - Guarding write/edit/delete actions so travelers can only modify or delete their own posts.

**client/**
- `app/blog/create/page.tsx`: Authoring form with title, category, content editor, and image link/upload options.
- `app/blog/[id]/page.tsx`: Dynamic blog details view page allowing users to read the full self-authored travel articles.
- Edit/Delete UI triggers on blog lists for the original authors.

---

## Suggested Order Rationale
Deployment starts at Phase 0 (not the end) specifically to catch environment/config issues (env vars, CORS, DB connection strings, API keys) early, when they're cheap to fix, rather than discovering them under deadline pressure at submission time. Auth comes before browsing-dependent features because roles gate almost everything downstream. Core browsing (Phase 2–3) comes before AI (Phase 4–6) because both AI features are explicitly grounded in real package data — there's nothing for the AI to recommend or customize until real packages exist. The admin-approval workflow (Phase 6) comes last among functional phases because it depends on both AI features being in place first (recommendations feed into the trip planner; chat feeds into custom requests).