# dooble

> **Find things to do around you.**

Dooble is a web app that connects visitors with local activities and helps activity organizers manage their offerings. Visitors can explore activities on an interactive map, view details, and get tickets — while organizers can create, edit, and track their activities through a dedicated dashboard.

This project was initially bootstrapped with **[Lovable](https://lovable.dev)** and later developed further with **[Antigravity](https://antigravity.dev)**.

---

## 🚀 Running Locally

Make sure you have **Node.js** and **npm** installed before you begin.

### 1. Clone the repository

```sh
git clone <YOUR_GIT_URL>
cd dooble
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your real values (Supabase project ID, anon key, URL, etc.):

```sh
cp .env.example .env
```

### 3. Install dependencies

```sh
npm install
```

### 4. Start the development server

To run just the frontend:

```sh
npm run dev
```

To run both the frontend and the backend server at the same time:

```sh
npm run dev:all
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:3001` (or whichever port is configured).

### 5. (Optional) Seed demo data

```sh
npm run seed:demo
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui, Radix UI |
| **Routing** | React Router v6 |
| **State / Data** | TanStack Query (React Query) |
| **Forms** | React Hook Form + Zod |
| **Backend** | Node.js, Express |
| **Database** | MongoDB + Mongoose |
| **Auth** | Supabase Auth + JWT |
| **Storage** | Supabase Storage (images), Multer (uploads) |

---

## 📁 Project Structure

```
dooble/
├── src/
│   ├── pages/        # Route-level page components
│   ├── components/   # Reusable UI components
│   ├── contexts/     # Auth and global state
│   ├── hooks/        # Custom React hooks
│   └── lib/          # Utilities and helpers
├── server/
│   ├── routes/       # Express API routes
│   ├── models/       # Mongoose models (User, Activity, Ticket, Rating)
│   └── middleware/   # Auth middleware
└── supabase/         # Supabase config and migrations
```

---

## 👤 User Roles

- **Visitor** — Browse activities on a map, view details, collect tickets.
- **Organizer** — Create and manage activities via a dashboard.
