# TripLedger — Travel ERP + B2B Booking Engine

> **This file is the persistent source of truth for this project.** It lives inside the repo root so the coding agent (or a fresh session of it) can always re-read it to recover full context — never rely on chat history alone. See Section 10 for the companion progress log that tracks what's actually been *done*, as opposed to what's *planned* here.

**Goal:** Build a vertical-slice DMC/Travel ERP system in 2 days to showcase during a Webkyat Agency interview. Mirrors their core service lines: Travel ERP & DMC Software, B2B Booking Engines, and Voucher/Proforma Generation.

**Target company reference:** Webkyat Agency (webkyat.com/service) — travel technology solutions for DMCs and tour operators.

---

## 1. Elevator Pitch

A DMC-style platform where an **Admin** creates travel packages (hotels/activities) with supplier net costs, and a **Travel Agent** logs into a separate portal to build a client itinerary, see agent-tier markup pricing, confirm a quotation, and generate a downloadable PDF voucher — replicating the quote-to-voucher operational loop that sits at the heart of DMC software.

---

## 2. Scope

### In scope (build this)
- Role-based auth: `admin` and `agent` roles
- Admin dashboard: manage packages, view all agents' quotations
- Agent dashboard: browse packages, build a multi-item quotation
- Dynamic pricing: `finalPrice = baseSupplierCost * (1 + agent.commissionRate)`
- Quotation lifecycle: `draft → confirmed`
- PDF voucher generation on confirm
- Seeded supplier/package data (no supplier CRUD UI)
- Deployed live demo (Vercel)

### Explicitly out of scope (mention as "next steps" in interview)
- Customer-facing B2C storefront
- Live GDS/flight/hotel API integration (use seeded data; stub the interface so it's swappable later)
- Multi-currency support
- Mobile app (iOS/Android)
- Payment gateway integration
- Multi-branch management
- Supplier contract management UI

---

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Single deployable codebase, fast to scaffold |
| Language | TypeScript | Type safety across schema/API/UI |
| Database | PostgreSQL via Neon | Relational domain (quotes→items→packages); serverless, free tier |
| ORM | Prisma | Fast schema iteration + migrations |
| Auth | NextAuth (Credentials provider) | Simple email/password, role stored on user. **Neon Auth is OFF** — not used, to avoid two auth systems |
| Styling/UI | Tailwind CSS + shadcn/ui | No time to hand-design components |
| PDF generation | `@react-pdf/renderer` | Generates voucher PDF server-side, no headless browser needed |
| Deployment | Vercel | Zero-config, push to deploy |
| DB hosting | Neon | Postgres 18 (default), region `aws-us-east-1` (N. Virginia) — matches Vercel's default `iad1` function region for lowest latency |

---

## 4. Neon Database Setup (do this once, in Phase 0)

- **Postgres version:** accept the default (Postgres 18) — no legacy constraints on a fresh project.
- **Region:** AWS US East (N. Virginia) — `aws-us-east-1`. This matches Vercel's default Serverless Function region (`iad1`, Washington D.C.), minimizing latency between the deployed app and the DB.
- **Neon Auth:** leave toggled **off**. NextAuth (Credentials provider) is the auth system for this project — do not enable a second auth system.
- **Connection string:** use the single pooled `DATABASE_URL` from the Connect modal (default, hostname has `-pooler`) for everything — app runtime, migrations, and seeding. Set it as an env var locally (`.env`) and in Vercel Project Settings. If a migration or seed run ever throws a "prepared statement already exists" style error, that's the known tradeoff of skipping the separate unpooled URL — rerun the command, or set `directUrl` later if it becomes a recurring problem.

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 5. Data Model (Prisma schema — authoritative version)

```prisma
enum Role {
  ADMIN
  AGENT
}

enum QuotationStatus {
  DRAFT
  CONFIRMED
}

model User {
  id             String       @id @default(cuid())
  name           String
  email          String       @unique
  passwordHash   String
  role           Role
  commissionRate Float        @default(0.15) // only meaningful for AGENT
  quotations     Quotation[]
  createdAt      DateTime     @default(now())
}

model Package {
  id                String   @id @default(cuid())
  title             String
  destination       String
  nights            Int
  baseSupplierCost  Float
  description       String?
  imageUrl          String?
  createdAt         DateTime @default(now())
  items             QuotationItem[]
}

model Quotation {
  id             String            @id @default(cuid())
  agent          User?             @relation(fields: [agentId], references: [id])
  agentId        String?           // nullable on purpose: a future B2C/public booking
                                    // reuses this same model with no agent attached.
                                    // Do NOT make this required later — see Section 9.
  customerName   String
  status         QuotationStatus   @default(DRAFT)
  markupApplied  Float             // snapshot of agent's commission rate at creation
  totalAmount    Float
  items          QuotationItem[]
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
}

model QuotationItem {
  id           String     @id @default(cuid())
  quotation    Quotation  @relation(fields: [quotationId], references: [id])
  quotationId  String
  package      Package    @relation(fields: [packageId], references: [id])
  packageId    String
  dayNumber    Int
  quantity     Int        @default(1)
  unitCost     Float      // baseSupplierCost snapshot
  unitPrice    Float      // after markup snapshot
}
```

---

## 6. Phased Build Plan

> **Agent instruction: build ONLY the current phase. Do not build ahead. After finishing a phase, stop, verify the deliverable, then append an entry to `PROGRESS.md` (see Section 10) before starting the next phase.**

### Phase 0 — Project Setup (~1 hr)
- Scaffold Next.js + TypeScript + Tailwind + shadcn/ui
- Set up Prisma + connect to Neon Postgres using the single `DATABASE_URL` as described in Section 4
- Push initial schema (`prisma migrate dev`)
- Create `lib/data/packages.ts` with `getPackageById(id)` and `getAllPackages()` — thin wrappers around the Prisma `Package` queries. **Rule for the whole project: no component or API route queries `Package` directly via Prisma; everything goes through these two functions.**
- Deploy an empty shell to Vercel immediately, with `DATABASE_URL` set in Vercel Project Settings

**Deliverable:** Empty app live on a Vercel URL, DB connected, with the package data-access layer stubbed in.

---

### Phase 1 — Auth & Roles (~2 hrs)
- Implement login (email/password, NextAuth Credentials provider)
- Seed 1 admin user + 2 agent users (different commission rates, e.g. 10% and 20%)
- Middleware: redirect `/admin/*` and `/agent/*` based on role
- Basic layout shells for admin and agent dashboards

**Deliverable:** Can log in as admin or agent and land on the correct dashboard.

---

### Phase 2 — Package Data & Admin View (~2 hrs)
- Seed script: 6–8 packages across 2–3 destinations with realistic supplier costs
- Admin dashboard: table of all packages
- Admin dashboard: table of all quotations across all agents (read-only), with agent name + status + total

**Deliverable:** Admin can see the full picture — packages and every agent's quotations.

---

### Phase 3 — Agent Quotation Builder (~3 hrs) — CORE FEATURE
- Agent view: browse packages (cards, filter by destination optional)
- "Add to itinerary" flow: pick package, day number, quantity
- Live price calculation shown as: `Supplier cost → + Your markup (X%) → Client price`
- Save as Quotation (status: DRAFT) with customer name field
- Quotation detail page showing itemized breakdown and total

**Deliverable:** Agent can build a real multi-item quote with correct pricing math persisted to DB.

---

### Phase 4 — Confirm → PDF Voucher (~2 hrs)
- "Confirm Quotation" action: status DRAFT → CONFIRMED (lock further edits)
- Generate PDF voucher server-side via `@react-pdf/renderer`: customer name, itemized days/packages, total, agent name — gated so it only renders when `status === CONFIRMED`
- Download button on quotation detail page

**Deliverable:** End-to-end loop complete: package → quote → confirm → downloadable voucher PDF.

---

### Phase 5 — Polish & Interview-Readiness (~2 hrs)
- Landing page copy that explicitly echoes Webkyat's service language ("Quotation & Itinerary Builder," "Dynamic Pricing & Markups," "Role-Based Access Control")
- README.md: architecture diagram (even ASCII/mermaid is fine), tech decisions, screenshots
- "Roadmap / Next Steps" section listing the explicitly-out-of-scope items — shows you understand the fuller product surface
- Final smoke test on the live Vercel URL (not just localhost)
- Seed clean demo data so the live demo looks intentional, not empty

**Deliverable:** Interview-ready live demo + repo + README.

---

## 7. Suggested 2-Day Time Split

| Day | Phases | Hours |
|---|---|---|
| Day 1 | Phase 0, 1, 2 | ~5 hrs |
| Day 2 | Phase 3, 4, 5 | ~9 hrs |

Adjust based on your actual availability — Phase 3 (agent builder) is the phase to protect; everything else can flex.

---

## 8. Interview Talking Points (keep handy)

- "I focused on the core operational loop — quote to voucher with agent-tier pricing — because that's the heart of DMC ERP software."
- "Pricing is snapshotted at quote-time (unitCost/unitPrice stored on QuotationItem) so historical quotes don't change if I later edit a package's base cost — same reasoning a real DMC accounting system needs."
- "The package data layer is seeded now, but designed so a real GDS/Hotel API integration would slot into the same `Package` shape without changing the pricing or quotation logic, because everything routes through one data-access function."
- "`Quotation.agentId` is nullable by design — a future customer-facing B2C storefront just reuses this same model without an agent attached."
- "Given more time: customer-facing B2C storefront, live API integration, multi-currency, and a supplier contracts module."

---

## 9. Future-Extensibility Decisions (already baked in, do not undo)

### 9.1 `Quotation.agentId` is nullable from day one
Even though every quotation in the 2-day build will always have an agent attached, the field is modeled as optional (`agentId String?`). **Why:** a future B2C storefront is structurally just a booking with no agent attached — same `customerName`, `items`, `totalAmount` shape. If `agentId` is required, adding B2C later means a migration plus auditing every place that assumes `quotation.agent` exists.

### 9.2 All `Package` reads go through `lib/data/packages.ts`
Never call `prisma.package.findMany()` (or similar) directly from a component or route. **Why:** a future live GDS/hotel API integration needs to merge or replace seeded `Package` rows with live API results. If that logic lives in one function, the integration is a one-file change instead of a project-wide refactor.

---

## 10. Progress Log Convention — CRITICAL FOR CONTEXT RECOVERY

**Maintain a separate file, `PROGRESS.md`, in the project root, alongside this `plan.md`.** This is not optional — it's the mechanism that lets the agent (or a fresh session of it, or you manually) recover exactly where the project stands without re-reading an entire chat history or guessing from the codebase.

### Rule for the agent
After **every phase** (or any meaningful checkpoint within a long phase) is completed and verified working, append a new entry to `PROGRESS.md` — never overwrite previous entries, only append. Each entry should follow this template:

```markdown
## [Phase N] — <short title> — COMPLETED <date>

**What was built:**
- bullet list of concrete things implemented

**Key decisions/deviations from plan.md:**
- anything that differs from what plan.md originally said, and why

**Verified working:**
- what you tested and confirmed (e.g. "logged in as agent, built a quote, confirmed it, downloaded PDF — all correct on localhost and on the deployed Vercel URL")

**Known issues / TODO before next phase:**
- anything left rough or deferred

**Next phase to start:** Phase N+1 — <title>
```

### Why this matters
If the agent's context window resets, if you switch machines, or if you start a brand-new chat/session with the coding agent, the **first thing to do is have the agent read both `plan.md` (the unchanging blueprint) and `PROGRESS.md` (the actual build history) before touching any code.** `plan.md` says what *should* be built; `PROGRESS.md` says what *has* been built and any decisions that shifted along the way. Together they let any agent session — old or brand new — reconstruct full project context in two file reads instead of guessing from source code or lost chat history.

### Recovery prompt to use if you ever start a fresh agent session
```
Before doing anything else, read plan.md and PROGRESS.md in the project root.
plan.md is the full project blueprint (tech stack, schema, phased plan).
PROGRESS.md is an append-only log of what's actually been completed so far, in order.
Summarize back to me: which phase we're currently on, what's already done, and what the next concrete task is. Do not write or modify any code until I confirm your summary is correct.
```

---

## 11. Kickoff Prompt Used (for reference — already executed)

This is the prompt that was used to start Phase 0 with the Antigravity + Gemini Pro agent. Kept here for reference so it's clear what the agent was originally told, in case behavior needs to be traced back to it.

```
You are helping me build "TripLedger," a Travel ERP + B2B Booking Engine web app, over 2 days, in 5 phases (Phase 0 through Phase 5). I will direct you phase by phase — do NOT build ahead of the current phase.

STACK: Next.js 14 (App Router) + TypeScript, Tailwind CSS + shadcn/ui, Prisma ORM with PostgreSQL (Neon, region aws-us-east-1, Postgres 18), NextAuth (Credentials provider) for auth, @react-pdf/renderer for PDF generation, deployed on Vercel.

DOMAIN CONTEXT: This is a DMC (Destination Management Company) operational tool. An Admin creates travel Packages with a supplier net cost. An Agent (role-based login) builds a Quotation for a customer by adding Packages as line items across itinerary days. Each Agent has a commissionRate; the client-facing price is baseSupplierCost * (1 + commissionRate). A Quotation moves from DRAFT to CONFIRMED, at which point a PDF voucher can be generated and downloaded.

DATA MODEL: Use the Prisma schema in plan.md exactly as the starting point — User (role: ADMIN|AGENT, commissionRate), Package (title, destination, nights, baseSupplierCost), Quotation (agentId nullable, customerName, status, markupApplied, totalAmount), QuotationItem (quotationId, packageId, dayNumber, quantity, unitCost, unitPrice).

CONTEXT RECOVERY: plan.md in the project root is the full blueprint for this project. PROGRESS.md is an append-only log you must update after every completed phase, following the template in plan.md Section 10. If you ever lose context, re-read both files before proceeding.

RIGHT NOW, ONLY DO PHASE 0 as described in plan.md Section 6. Ask me for my Neon DATABASE_URL if you need it, and stop for my confirmation once Phase 0 is verified working — then create PROGRESS.md with the first entry before I give you the next instruction.
```

**Going forward, for each new phase:** point the agent to `plan.md` Section 6 for that phase's task list, and remind it to update `PROGRESS.md` when done. You don't need to retype the full task list each time — "Read plan.md, we're starting Phase 2 now" is enough since the file is already in the repo.
