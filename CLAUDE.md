# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack monorepo (pnpm workspaces) with two apps:
- `apps/api` — NestJS 11 backend (TypeScript, port 3000)
- `apps/web` — React 19 + Vite frontend (TypeScript)

## Commands

All commands run from the project root with `pnpm run <script>`.

### Web (React + Vite)
| Script | Action |
|---|---|
| `dev:web` | Start Vite dev server with HMR |
| `build:web` | Production build |
| `test:web` | Run tests |
| `lint:web` | Lint |

### API (NestJS)
| Script | Action |
|---|---|
| `dev:api` | Start in watch mode |
| `build:api` | Compile TypeScript to `dist/` |
| `start:api` | Start compiled output |
| `test:api` | Run Jest tests |
| `lint:api` | Lint |

To run a single NestJS test: `cd apps/api && npx jest <test-file-pattern>`

## Architecture

**Backend (`apps/api`):** Standard NestJS module architecture — feature code lives in modules under `src/`, each with a controller, service, and module file. Entry point is `src/main.ts`. E2E tests are in `test/`.

**Frontend (`apps/web`):** React with hooks. Entry is `src/main.tsx`, root component is `src/App.tsx`.

**Monorepo:** pnpm workspaces with `apps/*` glob. Root `package.json` scripts use `pnpm --filter <name>` to delegate to each app. The API package is named `api`, the web package is named `web`.

## Frontend: Atomic Design + Tailwind

Components live in `src/components/` organized by Atomic Design levels:

```
src/components/
  atoms/       # Indivisible UI primitives (Button, Input, Label, Icon)
  molecules/   # Compositions of atoms (FormField, SearchBar, Card)
  organisms/   # Complex, self-contained sections (Header, ProductList, LoginForm)
  templates/   # Page layouts without real data (slot-based structure)
  pages/       # Templates bound to real data; routed entry points
```

- Styling is done exclusively with Tailwind utility classes — no separate CSS files for components.
- Every component must have a co-located test file (e.g., `Button.test.tsx` next to `Button.tsx`) covering its essential usage: renders correctly, key interactions, and relevant prop variations.

## Backend: REST Principles

- **Resources as nouns:** URLs identify resources, never actions (`/users`, `/orders/:id`, not `/getUser` or `/createOrder`).
- **Correct HTTP verbs:** `GET` read, `POST` create, `PUT`/`PATCH` update, `DELETE` remove.
- **Meaningful status codes:** `200 OK`, `201 Created` (with `Location` header), `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`.
- **Consistent response envelope:** success responses return the resource or collection directly; error responses return `{ statusCode, message, error }`.
- **Stateless:** no server-side session state; authentication via token (Bearer) in the `Authorization` header.
- **Versioning:** prefix all routes with `/v1/` (e.g., `/v1/users`).

## Git: Conventional Commits

All commits in both apps must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

Common types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `style`, `perf`.  
Scope is optional but recommended (e.g., `feat(auth): add JWT login`, `fix(api): return 404 when user not found`).

Breaking changes: append `!` after the type/scope (`feat!: ...`) and add a `BREAKING CHANGE:` footer.

## Code Style

- TypeScript strict mode in both apps
- ESLint flat config (`eslint.config.mjs` / `eslint.config.js`)
- Prettier with single quotes and trailing commas
