# rules.md — Project Ground Rules

**Applies to:** anyone or anything (including AI coding agents, e.g. Antigravity) working on this codebase.
**Precedence:** `prd.md` and `requirements.md` are the source of truth for *what* to build. This document governs *how* it gets built. If any instruction conflicts with `prd.md` or the original assignment requirements doc, **`prd.md`/`requirements.md` win — do not deviate from them.**

---

## 1. Core Principles

1. Follow `prd.md` exactly. No new pages, features, or business logic that isn't in it.
2. Follow `requirements.md` exactly. It is the graded spec — nothing in this project should contradict it.
3. When in doubt, do less, not more. Unapproved scope creep is a bigger risk than a missing nice-to-have.
4. Consistency over cleverness. A boring, predictable pattern used everywhere beats a clever one-off.
5. Write code in a minimalistic, "junior developer" style. Always use normal functions exported via plain objects for services and controllers; do not use complex class abstractions.

---

## 2. What TO Do

- **TypeScript everywhere** (frontend and backend) — no plain `.js` files in new code.
- Use the tech stack exactly as defined in `architecture.md`/`requirements.md` (React/Next.js, Tailwind, Express, MongoDB, JWT).
- Keep all AI provider calls **server-side only**. The frontend never talks to Groq/OpenAI/etc. directly.
- Validate all form input on both client and server.
- Protect every admin-only and auth-only route on the **backend**, not just by hiding UI elements.
- Write real content for every page (no lorem ipsum, no "Sample Package," no placeholder images without real captions).
- Keep card components, spacing, and colors consistent with `design.md` once it exists.
- Log errors server-side; never expose stack traces or internal error details to the client.
- Store all secrets (API keys, JWT secret, DB URI) in environment variables — never in source code or committed files.
- Write commit messages and PRs that reference which phase (`phases.md`) the work belongs to.

## 3. What NOT To Do

- Do **not** introduce a new library, framework, or service not listed in §4 without first updating this file.
- Do **not** invent new pages, admin capabilities, or user roles beyond what `prd.md` defines (only **Traveler** and **Admin** exist).
- Do **not** let AI-generated content become a real booking without the admin-approval flow defined in `prd.md` §7. This rule cannot be "optimized away" for convenience.
- Do **not** hardcode API keys, tokens, or credentials anywhere in the repo, including in example/test files.
- Do **not** fabricate data to make the UI look populated — use real seed data instead.
- Do **not** silently swallow errors (empty `catch {}` blocks are forbidden).
- Do **not** change the approved libraries or folder structure without documenting the change here first.
- Do **not** build payment processing, real third-party travel APIs, or a user-to-user marketplace — explicitly out of scope per `prd.md` §10.

---

## 4. Approved Libraries & Tools

| Purpose | Approved | Not approved (unless this doc is updated) |
|---|---|---|
| Frontend framework | React.js / Next.js | Vue, Angular, Svelte |
| Language | TypeScript | Plain JavaScript |
| Styling | Tailwind CSS | Styled-components, Bootstrap, plain CSS files at scale |
| Server state / data fetching | TanStack Query (or RTK Query) | SWR, raw `useEffect` fetch chains for data that should be cached |
| Charts | Recharts or Chart.js | D3 from scratch, other charting libs |
| Backend framework | Express.js | Fastify, NestJS, Koa |
| Database | MongoDB (Mongoose recommended for schema structure) | SQL databases, other NoSQL stores |
| Auth | JWT (jsonwebtoken + bcrypt) or Better Auth | Roll-your-own crypto, storing plaintext passwords |
| Social login | Google OAuth | Other providers, unless added to `prd.md` first |
| AI provider | Groq (Groq API via `groq-sdk`) | Mixing multiple LLM providers in the same feature without reason |
| Icons | lucide-react (or one consistent icon set) | Mixing multiple icon libraries |
| Forms/validation | React Hook Form + Zod (or equivalent) | Unvalidated raw form state |

Any addition to this table requires updating this file — treat it as a changelog, not a static list.

---

## 5. Error Handling Standards

**Backend:**
- Every route wrapped in try/catch (or a centralized async error handler).
- Consistent error response shape:
  ```json
  { "success": false, "error": { "message": "human readable message", "code": "OPTIONAL_ERROR_CODE" } }
  ```
- Use correct HTTP status codes: `400` validation, `401` unauthenticated, `403` unauthorized/wrong role, `404` not found, `500` unexpected server error.
- Never leak internal details (stack traces, DB errors, provider error payloads) to the client — log them server-side instead.
- AI provider calls (Groq) must have their own try/catch with a graceful fallback message ("AI is temporarily unavailable, please try again") — a failed AI call must never crash a page or block core browsing/booking functionality.

**Frontend:**
- Every data-fetching hook must handle loading, error, and empty states explicitly — no silent blank screens.
- Use toast/inline error messages for user-facing failures (failed login, failed submission, etc.).
- Wrap major page sections in error boundaries where practical.
- Skeleton loaders (per `requirements.md` §4) during all loading states on listing pages.

---

## 6. Boundaries for the AI Building This Project (e.g. Antigravity)

These rules apply specifically to any AI coding agent generating or modifying code for this project.

**Required Operational Actions:**
- **Push to GitHub**: After doing each task, you must push the changes to GitHub with a meaningful commit message.

**Allowed, without asking first:**
- Writing code for features, pages, and business logic already fully specified in `prd.md`, `architecture.md`, and `phases.md`.
- Fixing bugs, refactoring for clarity, and improving error handling within the approved stack (§4).
- Writing seed/demo data that is realistic and non-placeholder.
- Writing tests for existing functionality.

**Requires explicit confirmation before proceeding:**
- Adding any new library/package not in §4.
- Any change to the business logic in `prd.md` §7 (the admin-approval flow) — this is the most sensitive part of the app and must never be "simplified" unilaterally.
- Any change to the database schema shape once other phases depend on it.
- Any change that touches authentication/authorization logic.
- Deviating from the folder structure defined in `architecture.md`.

**Never allowed, full stop:**
- Committing real API keys/secrets into the repository.
- Opening the browser (e.g., using `browser_subagent`) to test/verify code. If browser action is needed, you must request and receive explicit approval from the user first.
- Implementing payment processing, a real third-party travel booking API, or a user-to-user package marketplace (explicitly out of scope in `prd.md` §10).
- Letting an AI-drafted custom itinerary become a real booking without passing through admin approval.
- Filling pages with placeholder/lorem-ipsum content to "finish faster."
- Silently skipping a requirement from `requirements.md` because it's inconvenient — if something can't be done as specified, it must be flagged, not quietly dropped.

---

## 7. Change Log
- v1 — initial ground rules established alongside `prd.md`.