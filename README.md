# Content Sharing Portal

A web application for tracking daily assessment and question sharing activity across clients and programs.

## Overview

The Content Sharing Portal allows teams to log, manage, and review shared assessments and questions. Entries are stored in Supabase and can be filtered, edited, replaced, and exported. Access is role-based — admins can manage users in addition to entries.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — dev server and build tool
- **Tailwind CSS** — styling
- **Supabase** — database, authentication, and edge functions (`@supabase/supabase-js`)

## Features

- **Dashboard** — summary view of all active entries
- **Updated Dashboard** — alternate dashboard with milestone breakdown (Assignment / Assessment / Mock / Review) for each content type including Skill Assist
- **Log Entry** — add new entries or edit/replace existing ones
- **All Entries** — filterable, paginated table with edit, replace, and delete actions
- **Authentication** — email + password login; admin-only invite flow with email verification
- **User Management** — admin-only tab to invite, resend invites, revoke, and restore member access
- **Replacement tracking** — entries can be replaced with a reason; originals are preserved and linkable
- **Optimistic UI** — changes apply immediately and revert on failure

## Entry Fields

Each entry captures: date, client, program, track, skill, question shared, type (MFA / SF / MCQ / etc.), milestone, learning path, grading method, CSDM, autograding ETA, status, issues, course correction, and remarks.

**Clients:** Cognizant, KPMG, UST, IIHT, B2C, Infosys, Wipro, Other

**Statuses:** Under Review, Approved, Closed program, Pending, Rejected, Sent to CSDM

**Grading:** AutoGraded, Manual, AI-Autograded

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with the required tables and auth configured
- Supabase CLI (for deploying Edge Functions)

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Install & Run

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Seed Database

```bash
npm run seed
```

---

## Project Structure

```
src/
  auth/               # AuthContext (session, profile, role, revoked state)
  components/
    admin/            # Admin-only components (UserManagement)
  data/               # Sample/seed data
  lib/                # Supabase client
  pages/              # LoginPage, AcceptInvitePage
  types/              # TypeScript types (Entry, Profile, etc.)
  utils/              # Storage, export, and database helpers
  constants.ts        # Shared constants (clients, skills, statuses, etc.)
  types.ts            # Core Entry, Tab, and Filters types
  App.tsx             # Root component — auth gates + state management

supabase/
  functions/
    invite-user/      # Edge Function — admin sends invite email
    manage-user/      # Edge Function — admin revokes or restores a user
  migrations/
    20260408000000_profiles.sql       # profiles table, RLS, new-user trigger
    20260408000002_profiles_revoke.sql # status, invited_at, is_revoked columns
```

---

## Database Setup

Run all SQL migration files (in order) from the `supabase/migrations/` folder using the **Supabase SQL Editor**.

### Tables

| Table | Purpose |
|-------|---------|
| `entries` | All content sharing entries |
| `profiles` | Linked to `auth.users` — stores name, role, status, invite metadata |

### profiles columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | FK → auth.users |
| `name` | text | Display name |
| `email` | text | Email address |
| `role` | text | `admin` or `member` |
| `status` | text | `pending` (invite not accepted) or `active` |
| `is_revoked` | boolean | Soft-delete flag — revoked users cannot log in |
| `invited_at` | timestamptz | When the invite was sent |
| `last_sign_in_at` | timestamptz | Updated on each sign-in via DB trigger |
| `revoked_at` | timestamptz | When the account was revoked |

---

## Edge Functions

Two Supabase Edge Functions handle privileged admin operations (both require the service role key, which never touches the browser).

### invite-user

Sends an invite email to a new member via Supabase Auth admin API and creates their profile row.

**Deploy:**
```bash
npx supabase functions deploy invite-user --project-ref <project-ref> --no-verify-jwt
```

### manage-user

Revokes or restores a user — bans/unbans them in Supabase Auth and updates `profiles.is_revoked`.

**Deploy:**
```bash
npx supabase functions deploy manage-user --project-ref <project-ref> --no-verify-jwt
```

---

## Authentication Flow

### Login
Standard email + password via `supabase.auth.signInWithPassword()`.

### Invite (admin → new member)
1. Admin fills in name + email in the **Users** tab
2. App calls the `invite-user` Edge Function
3. Supabase sends an invite email with a 24-hour link
4. Member clicks the link → lands on **Set Password** page
5. Member sets their password → account becomes active

### Invite link expiry
Invite links expire after **24 hours**. If expired, the member sees a clear message and the admin can resend the invite from the Users tab.

### Revoke / Restore
- Admin clicks **Revoke** on any member row → user is immediately banned in Supabase Auth (signed out) and marked `is_revoked = true`
- Admin clicks **Restore** → user is unbanned and can log in again
- Admins cannot revoke other admins or themselves

---

## Roles

| Role | Capabilities |
|------|-------------|
| Member | View dashboards, log entries, edit, replace, export |
| Admin | All member capabilities + Users tab (invite, resend, revoke, restore) |

---

## First Admin Setup

1. Go to **Supabase Dashboard → Authentication → Users → Invite user** and enter your email.
2. Accept the invite and set your password via the app.
3. Run this in the **Supabase SQL Editor** to promote yourself to admin:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
```

All subsequent users are invited through the app UI by the admin.
