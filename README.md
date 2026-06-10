# AI Native Engineering

> A hands-on journey into the new way of building software — where AI is a first-class collaborator in every step of the development process.

---

## About

This is an educational project developed as part of Alura's **AI Native Engineering** career track.

The goal is not just to learn a new framework or language, but to experience a **new paradigm of software development** — one where AI tools augment every phase: from designing architecture and writing code to reviewing, testing, and refactoring. Every feature in this project is an opportunity to explore what it means to develop software in the AI Age.

My background is in **.NET / C#** and **Angular** — NestJS and React are outside my day-to-day stack. That makes this project a genuine learning exercise: building something real in an unfamiliar ecosystem, with AI as the primary collaborator throughout.

> **For educational purposes only.**

---

## What This Project Explores

- Building a production-like full-stack app with modern tooling
- Using AI as a development partner — not a shortcut, but a collaborator
- Applying software engineering best practices (REST, Atomic Design, Conventional Commits, strict TypeScript) in an AI-assisted workflow
- Understanding how AI changes the role of the engineer: less time on boilerplate, more focus on architecture, intent, and quality

---

## Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11, TypeScript, REST |
| Frontend | React 19, Vite, TypeScript, Tailwind v4 |
| Database | PostgreSQL 16 (Docker), TypeORM |
| Monorepo | pnpm workspaces |
| Quality | ESLint, Prettier, Jest, strict TypeScript |

---

## Project Structure

```
ProjetoCarreiraNativeAI/
├── apps/
│   ├── api/        # NestJS REST API (port 3000)
│   └── web/        # React + Vite SPA
└── package.json    # Root workspace with shared scripts
```

The frontend follows **Atomic Design** — components are organized into `atoms`, `molecules`, `organisms`, `templates`, and `pages`.

---

## Getting Started

Install dependencies from the repo root:

```bash
pnpm install
```

### Database (PostgreSQL via Docker)

A `docker-compose.yml` at the repo root starts Postgres 16 with a named volume so data persists across restarts.

```bash
pnpm db:up    # docker compose up -d  (start Postgres)
pnpm db:down  # docker compose down   (stop Postgres)
```

Migrations run automatically when the API boots (`migrationsRun: true`). You can also run them manually:

```bash
pnpm migration:run   # apply pending migrations
```

Copy `apps/api/.env.example` to `apps/api/.env` before starting (the default values match the docker-compose config).

### Run in development

```bash
# Start the API (watch mode) — requires Postgres running
pnpm dev:api

# Start the web app (HMR)
pnpm dev:web
```

### Other scripts

```bash
pnpm build:api    # Compile API to dist/
pnpm build:web    # Production build for the web app
pnpm test:api     # Run API tests (Jest)
pnpm test:web     # Run web tests
pnpm lint:api     # Lint the API
pnpm lint:web     # Lint the web app
```

---

## License

This project is for educational purposes only and is not intended for production use.
