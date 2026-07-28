# TripLedger 🌍

TripLedger is a modern **Quotation & Itinerary Builder** designed specifically for travel agencies. It empowers agents to construct beautiful day-by-day itineraries from an inventory of packages, applies dynamic markups, and instantly generates client-ready PDF vouchers.

## Features
- 🚀 **Quotation & Itinerary Builder**: Mix and match packages into a cohesive, multi-day itinerary.
- 💰 **Dynamic Pricing & Markups**: Base supplier costs are securely hidden. Client-facing prices automatically calculate based on the agent's unique commission rate.
- 🔒 **Role-Based Access Control**:
  - **Admins**: Manage the entire package inventory and oversee all agent quotations.
  - **Agents**: Build quotes, manage clients, and confirm bookings in a sandboxed environment.
- 📄 **PDF Voucher Generation**: One-click, server-side PDF generation for confirmed itineraries using `@react-pdf/renderer`.

## Architecture Diagram

```mermaid
graph TD
    Client[Web Browser] -->|Next.js App Router| Auth[NextAuth.js]
    Auth -->|Validates JWT| UI[React Server / Client Components]
    
    UI -->|BuilderClient.tsx| State[Cart State Management]
    State -->|Confirm Quotation| API_Confirm[POST /api/quotations]
    
    UI -->|Download PDF| API_PDF[GET /api/quotations/:id/pdf]
    API_PDF -->|renderToStream| PDF_Gen[@react-pdf/renderer]
    
    API_Confirm <--> ORM[Prisma Client]
    API_PDF <--> ORM
    UI <-->|Server Components| ORM
    
    ORM <--> DB[(Neon Serverless Postgres)]
```

## Tech Decisions

1. **Next.js App Router**: Chosen for its robust Server Component model. This allows us to securely fetch package inventory (including hidden supplier costs) on the server before passing sanitized data to the client builder.
2. **Tailwind CSS & shadcn/ui**: Enables rapid, highly-customizable UI development with a premium, modern aesthetic without the bloat of traditional component libraries.
3. **Prisma & Neon Postgres**: Prisma provides excellent type-safe database access, while Neon offers a scalable, serverless PostgreSQL environment perfect for modern Edge/Vercel deployments.
4. **NextAuth.js**: Implements secure JWT-based authentication, storing user roles and commission rates directly in the token to minimize redundant database hits on protected routes.
5. **@react-pdf/renderer**: Chosen for its ability to generate complex, styled PDF documents purely on the server, ensuring clients receive a perfect document without relying on unpredictable browser-side print-to-PDF quirks.

## Roadmap / Next Steps (Out of Scope for MVP)
While the current MVP successfully validates the core quotation loop, a full production release would include:
- **Payment Gateway Integration (Stripe)**: Allowing clients to pay for confirmed quotes directly from a public invoice link.
- **Automated Email Workflows (Resend/SendGrid)**: Triggering automated PDF voucher delivery to the customer upon confirmation.
- **Multi-Currency Support**: Dynamic FX rate conversions for international travel packages.
- **Supplier Portal**: A dedicated role for suppliers to update their own base costs and availability.

## Getting Started

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Set up your `.env` file with `DATABASE_URL` and `NEXTAUTH_SECRET`.
3. Push the schema and seed the database:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

### Demo Accounts
- **Admin**: `admin@tripledger.com` / `password123`
- **Agent**: `agent1@tripledger.com` / `password123`
