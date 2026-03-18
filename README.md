# dooble

> **Find things to do around you.**

Dooble is a web app that connects visitors with local activities and helps activity organizers manage their offerings. Visitors can explore activities on an interactive map, view details, and get tickets — while organizers can create, edit, and track their activities through a dedicated dashboard.

This project was initially bootstrapped with **[Lovable](https://lovable.dev)** and later developed further with **[Antigravity](https://antigravity.dev)**.

---

## 🎓 GitHub Pages Demo

This repository has been converted into a **static frontend-only demo** specifically for teacher review. All backend dependencies have been removed or mocked, allowing the app to run completely in the browser without any server or database.

### Demo Credentials

You can test both user roles using the following pre-configured credentials:

- **Normal Visitor:**
  - **Email:** `funny@email.com`
  - **Password:** `123456`
- **Activity Provider:**
  - **Email:** `mail@chalmers.com`
  - **Password:** `123456`

### Mocked Features

Since this is a static demo:
- **Authentication:** Mocked locally. Logins and signups update the browser's `localStorage` state instead of calling a real backend.
- **Data Persistence:** Activities, tickets, and user accounts are persisted only in your local browser storage. If you clear your site data or use a private window, it will reset.
- **Images/Uploads:** Image uploads are mocked using temporary object URLs.
- **Database:** Supabase Auth, Storage, and MongoDB have all been decoupled.

### Deployment & URL

The application automatically deploys to GitHub Pages via a GitHub Actions workflow when changes are pushed to `main`/`master`.

**The live static demo can be accessed at:**  
[https://ReGalala.github.io/dooble/](https://ReGalala.github.io/dooble/)

---

## 🚀 Running Locally

To run the demo build locally on your machine:

### 1. Clone the repository

```sh
git clone https://github.com/ReGalala/dooble.git
cd dooble
```

### 2. Install dependencies

```sh
npm install
```

### 3. Start the development server

```sh
npm run dev
```

The frontend will be available at `http://localhost:8080`.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui, Radix UI |
| **Routing** | React Router v6 |
| **State / Data** | TanStack Query (React Query) |
| **Forms** | React Hook Form + Zod |
| **API** | Mocked `localStorage` API layer (`MockBackend`) |

---

## 📁 Project Structure

```
dooble/
├── src/
│   ├── pages/        # Route-level page components
│   ├── components/   # Reusable UI components
│   ├── contexts/     # Auth and global state
│   ├── hooks/        # Custom React hooks
│   ├── data/         # Seed data and mock info
│   └── lib/          # Utilities, API abstraction, and MockBackend
└── .github/          # GitHub Actions deployment workflow
```

---

## 👤 User Roles

- **Visitor** — Browse activities on a map, view details, collect tickets.
- **Provider** — Create and manage activities via a dashboard.
