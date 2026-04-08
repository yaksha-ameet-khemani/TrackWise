# Content Sharing Portal

A web application for tracking daily assessment and question sharing activity across clients and programs.

## Overview

The Content Sharing Portal allows teams to log, manage, and review shared assessments and questions. Entries are stored in Supabase and can be filtered, edited, replaced, and exported. Access is role-based — admins can manage users in addition to entries.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — dev server and build tool
- **Tailwind CSS** — styling
- **Supabase** — database and authentication (`@supabase/supabase-js`)

## Features

- **Dashboard** — summary view of all active entries
- **Updated Dashboard** — alternate dashboard layout
- **Log Entry** — add new entries or edit/replace existing ones
- **All Entries** — filterable table with edit, replace, and delete actions
- **User Management** — admin-only tab for managing user accounts
- **Replacement tracking** — entries can be replaced with a reason; originals are preserved and linkable
- **Optimistic UI** — changes apply immediately and revert on failure

## Entry Fields

Each entry captures: date, client, program, track, skill, question shared, type (MFA / SF / MCQ / etc.), milestone, learning path, grading method, CSDM, autograding ETA, status, issues, course correction, and remarks.

**Clients:** Cognizant, KPMG, UST, IIHT, B2C, Infosys, Wipro, Other

**Statuses:** Under Review, Approved, Closed program, Pending, Rejected, Sent to CSDM

**Grading:** AutoGraded, Manual, AI-Autograded

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with the required tables and auth configured

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

## Project Structure

```
src/
  auth/           # Auth context (session, profile, role)
  components/     # UI components (Dashboard, EntryForm, AllEntries, Nav, etc.)
    admin/        # Admin-only components (UserManagement)
  data/           # Sample/seed data
  lib/            # Supabase client
  pages/          # Page-level components (Login, AcceptInvite)
  types/          # TypeScript types and interfaces
  utils/          # Storage, export, and database helpers
  constants.ts    # Shared constants (clients, skills, statuses, etc.)
  types.ts        # Core Entry, Tab, and Filters types
  App.tsx         # Root component and state management
```

## Roles

| Role  | Capabilities                                     |
| ----- | ------------------------------------------------ |
| User  | View dashboards, log entries, edit, replace      |
| Admin | All user capabilities + manage users (Users tab) |
