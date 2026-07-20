# PRD — TravelAI (Travel Agency Agentic AI Platform)

**Status:** Draft v1
**Owner:** [Your name]
**Purpose:** This document is the single source of truth for what gets built. Anything not specified or implied here should not be built; anything specified here must be built to satisfy the assignment requirements.

---

## 1. Product Overview

TravelAI is a full-stack travel agency web application where an **agency (admin)** publishes real tour packages, and **travelers (users)** browse, get AI-personalized recommendations, and can request AI-customized trip itineraries. All custom itineraries go through an **admin approval workflow** before becoming real bookings — the agency always retains control over what it actually fulfills.

The product exists to demonstrate:
- Full-stack engineering (React/Next.js + TypeScript + Express + MongoDB)
- Two substantial agentic AI features (reasoning, memory, context-awareness — not just single-shot text generation)
- Clean, consistent, professional UI/UX
- Realistic business logic with proper role separation

---

## 2. Target Audience

| Persona | Description | Primary goals |
|---|---|---|
| **Traveler** | General public user browsing/booking trips | Find a trip that fits budget/interests, get personalized suggestions, customize a trip, track booking status |
| **Agency Admin** | The business operator | Publish and manage packages, review/approve or reject custom trip requests, keep control over final pricing and feasibility |

Only two roles exist. No third-party vendor/sub-agent role is in scope.

---

## 3. Tech Stack (mandatory, per requirements doc)

**Frontend:** React.js/Next.js, TypeScript, Tailwind CSS, TanStack Query (or RTK Query), Recharts/Chart.js (for any admin-side stats)
**Backend:** Node.js, Express.js, TypeScript, MongoDB
**Auth:** JWT-based authentication, with Google social login
**AI Provider:** Groq (Groq API) — used for both required AI features
**Deployment:** Live site + GitHub repos for frontend and backend, both required at submission

Nothing outside this stack is to be introduced without updating this document first.

---

## 4. Global UI/UX Rules (non-negotiable)

- Maximum 3 primary colors + 1 neutral.
- Every card component shares identical size, border radius, and visual style.
- Fully responsive: mobile, tablet, desktop.
- No lorem ipsum or placeholder content anywhere in the shipped product.
- All buttons/links must be functional — no dead UI.
- Consistent spacing/alignment system across every page (use a single Tailwind spacing scale, don't improvise per page).

---

## 5. Site Map

**Public (logged out):** Home, Explore, Package Details, About, Blog/Contact, Login, Register
**Additional (logged in):** AI Trip Planner (recommendations), My Trips (bookings + custom requests), Add Package* , Manage* (*admin-only — see §7)

Logged-out navbar: minimum 3 routes. Logged-in navbar: minimum 5 routes. Both sticky/fixed and fully responsive.

---

## 6. Page-Level Functional Requirements

### 6.1 Home Page
- Navbar (per §5 rules), full-width, sticky.
- Hero section: 60–70% viewport height, interactive element (destination slider or search CTA), clear scroll-flow into next section.
- Minimum 7 real, distinct sections. Recommended: Featured Destinations, Categories (beach/mountain/city/adventure), Why Choose Us, Testimonials, Stats (trips booked, destinations, happy travelers), Blog Preview, Newsletter Signup, FAQ.
- Footer: working internal links, contact info, social icons — all functional, none decorative-only.

### 6.2 Explore Page (Listing)
- Search bar (matches title/location).
- Filtering on **at least 2 fields** — minimum: category/destination type + price range. Recommended addition: duration or rating.
- Sorting: price (asc/desc), rating, popularity.
- Pagination or infinite scroll (pick one, implement fully — no partial state).
- Skeleton loaders while fetching.
- Cards: image, title, short description, meta (price, duration, rating, location), "View Details" button. Identical dimensions/radius across all cards. 4 per row on desktop.

### 6.3 Package Details Page
- Publicly accessible, no login required.
- Multiple images/gallery.
- Sections: Overview/Description, Key Info/Specifications (duration, group size, inclusions), Reviews/Ratings, Related Packages.
- "Request This Trip" / "Customize with AI" entry point lives here, linking into the AI Trip Planner flow (§8.1).

### 6.4 Authentication
- Login + Register pages, full client + server-side validation and error handling.
- **Demo login button** that auto-fills a working demo account's credentials — required, not optional.
- Google social login — required.
- Clean, minimal, on-brand UI (reuses the 3-color system).

### 6.5 Protected Page — Add Package (`/items/add`)
- Accessible to **Admin role only**. Non-admin logged-in users and logged-out users are redirected to `/login` (or shown "not authorized" if logged in as traveler).
- Fields: Title, Short description, Full description, Price, Duration/Date, Location, Optional image URL(s).
- Submit button creates a new `Package` document, immediately visible on Explore.

### 6.6 Protected Page — Manage (`/items/manage`)
Split into two tabs to reflect the two things an admin actually manages:
- **My Packages tab:** table/grid of all published packages. Actions: View, Delete.
- **Custom Requests tab:** queue of pending `CustomTripRequest` items (see §7.2) awaiting review. Actions: View, Quote (set final price), Approve, Reject.

For travelers, the equivalent page is **My Trips**: list of their custom requests (with status badges) and any approved bookings. View action only — no delete of admin-owned data.

### 6.7 Additional Pages
Minimum 2 required — implement: **About** (real agency story/content) and **Blog** (real, written articles — doubles as a showcase for the optional AI Content Generator later, and as SEO-style content, not placeholder text). Contact info can live in the footer and/or a dedicated Contact page.

---

## 7. Business Logic

### 7.1 Roles & Ownership
- **Admin owns:** Packages (the real, bookable inventory — price, availability, feasibility all controlled by admin).
- **Traveler owns:** Their custom trip requests (drafts) and their confirmed bookings.
- **AI owns:** Nothing. It only drafts/suggests. It cannot create a real booking or commit the business to anything.

This is the core rule: **no AI-generated content becomes a real, priced, fulfillable booking without an admin approving it.**

### 7.2 Custom Trip Request Lifecycle
A dedicated entity, separate from `Package`, tracks every AI-assisted customization:

```
CustomTripRequest
- userId
- basePackageId (nullable — may start from an existing package or from scratch via chat)
- aiGeneratedItinerary (day-by-day plan produced by the AI)
- userNotes
- estimatedPrice (AI's rough, clearly-labeled estimate — never final)
- status: "pending" | "quoted" | "approved" | "rejected"
- adminQuote: { finalPrice, adminNotes } (populated at "quoted" stage)
- timestamps
```

**Status flow:**
1. **pending** — Traveler finishes an AI-customized itinerary (via chat or the Trip Planner) and submits it as a request. No booking exists yet.
2. **quoted / rejected** — Admin reviews in the Custom Requests tab. Either sets a real price and notes (→ `quoted`) or rejects with a reason (→ `rejected`). The AI's estimate is never treated as authoritative.
3. **approved** — Traveler accepts the admin's quote. **This is the moment a real booking exists.** It now behaves like any other booking — visible in My Trips, counted in admin stats.

### 7.3 Standard Package Booking
Booking an existing, unmodified admin package does not require the approval workflow — it can move straight to a confirmed booking, since the admin already vouches for that package as-is. (No live payment gateway is required for this assignment; a booking is a status/record, not a real transaction, unless you choose to add one.)

### 7.4 What must be scrapped
Any flow that lets a user-customized itinerary become bookable without passing through admin `quoted → approved` status is out of scope and must not be implemented (this includes any marketplace-style "users publish their own packages for others to book" model).

---

## 8. AI Features (2 required, both in scope)

### 8.1 AI Smart Recommendation Engine ("AI Trip Planner")
- **Input:** structured preference form (budget, trip length, interests, travel style, group type) + implicit signals (saved/viewed packages, logged per user).
- **Process:** backend sends the user profile + relevant package data to Groq, requesting structured JSON output (packageId, matchScore, reason) — grounded in real DB packages, not invented destinations.
- **Output:** ranked package cards with a plain-language match reason.
- **Refinement:** user can adjust constraints ("cheaper," "shorter") and get re-ranked results — satisfies "filtering and refinement."
- **Continuous improvement:** every save/click is stored and included as context in future recommendation calls for that user — satisfies "improve based on user interactions" without requiring custom ML training.
- **Bridge to business logic:** from a recommended package, the user can either book it directly (§7.3) or ask the AI to customize it, which creates a `CustomTripRequest` (§7.2).

### 8.2 AI Chat Assistant
- **Input:** free-text messages, site-wide floating widget.
- **Process:** backend maintains per-user/session conversation history; system prompt gives the assistant real app context; assistant can query the package/request database as a tool (e.g., "what's the status of my custom trip?").
- **Output:** streamed response, 2–3 suggested follow-up prompts, typing indicator while streaming.
- **Context/memory requirement satisfied by:** persisted conversation history + follow-up reasoning (e.g., "make it cheaper" correctly resolves to whatever itinerary was just discussed).

Any additional AI feature (e.g., AI Content Generator for blog posts) is optional and must not compromise the two required features above.

---

## 9. Non-Functional Requirements
- Fully responsive across mobile/tablet/desktop for every page listed in §5–6.
- No placeholder/dummy content anywhere in the final build.
- Secure API design: JWT validation on all protected routes, admin-only routes checked server-side (not just hidden in the UI).
- Consistent design system (spacing, colors, card style) enforced across all pages.

## 10. Out of Scope
- Real payment processing.
- Live third-party flight/hotel price integration.
- Multi-language support.
- Native mobile apps.
- Marketplace-style user-to-user package publishing (explicitly excluded per §7.4).

## 11. Submission Requirements
- Live deployed website URL.
- GitHub repository links for both frontend and backend.
- All required pages, both AI features, and the admin-approval business logic (§7) fully functional — not mocked.

---

## 12. Future Scope
- **Interactive Traveler Blogs**: A future update allowing authenticated travelers to author, edit, and post their own travel experiences directly to the platform, replacing current static blogs with dynamic, author-controlled database documents stored in a dedicated `blogs` collection.

---

**Change control:** Any feature, page, or flow not described in this document should be treated as out of scope. Any implementation detail that conflicts with this document (especially §7's business logic) must be corrected to match this document, not the other way around.