# St. Dominic Hoopers Mayor's Cup Team Portal

Official full-stack portal for the St. Dominic Hoopers subdivision team participating in the Mayor's Cup / Lapu-Lapu City Hoops Sports Festival 2026.

## Stack

- Next.js 16 App Router + TypeScript
- PostgreSQL through Prisma Cloud / Prisma Postgres
- Prisma ORM 7 with PostgreSQL driver adapter
- NextAuth.js v5 beta with role-based admin access
- Tailwind CSS v4 + shadcn/ui-style components
- React Hook Form + Zod validation
- Nodemailer SMTP contact form

## Features

- Public pages for sports, rosters, schedules, standings, announcements, gallery, and contact
- Sport detail pages for Basketball Open Category, Basketball 3x3 14 Under, Mobile Legends, Darts, and Badminton
- Protected admin dashboard with CRUD for players, sports/categories, rosters, schedules/results, standings, announcements, gallery, and users
- Server-side validation and admin role checks before every mutation
- Audit logging for admin create/update/delete actions
- Seed data for initial sports/categories, Mobile Legends roster, Basketball Open roster draft, and team officials

Private registration form data such as addresses, precinct numbers, signatures, and parent/guardian signatures is intentionally not modeled or seeded.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Set `DATABASE_URL`, `AUTH_SECRET`, and SMTP variables in `.env`.

4. Generate Prisma Client:

```bash
npx prisma generate
```

5. Create and apply a migration:

```bash
npx prisma migrate dev
```

6. Seed initial data:

```bash
npx prisma db seed
```

Seeded admin login:

```text
admin@stdominichoopers.local
ChangeMeMayorCup2026!
```

Change this password immediately after setup.

7. Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Required Environment Variables

```env
DATABASE_URL=
AUTH_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
ADMIN_EMAIL=
```

## Useful Commands

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
npm run lint
npm run build
```

## Deployment Notes

- Deployable to Vercel.
- Add all environment variables in the Vercel project settings.
- `postinstall` runs `prisma generate`, so the generated Prisma client is created during deployment.
- The public gallery supports local and remote image URLs.
