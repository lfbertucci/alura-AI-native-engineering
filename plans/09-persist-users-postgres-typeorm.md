# Plan: Persist users in PostgreSQL via TypeORM

## Context

`apps/api/src/users/users.service.ts` keeps users in a private in-memory array
(`private readonly users: User[] = []`). Every restart wipes all registered
users, and the data cannot be shared across processes. We need real
persistence backed by **PostgreSQL**, replacing the array with an ORM-managed
repository, and a root `docker-compose.yml` that starts Postgres with a named
volume so data survives container restarts.

## ORM decision: TypeORM (chosen)

The user delegated the choice. **TypeORM** is selected because it is the most
natural fit for this NestJS codebase:

- Official first-party integration via `@nestjs/typeorm` — `Repository<User>`
  is injected through Nest's DI exactly like the current services.
- Entities are decorator-based (`@Entity`, `@Column`), matching the decorator
  style already used across the app (`@Injectable`, `@Controller`, DTO
  validators), so the existing `User` interface converts cleanly to an entity.
- Mature first-class **migrations** CLI (the user chose migrations over
  auto-`synchronize`).

**Alternatives considered:**
- **Prisma** — excellent DX and the strongest type-safety, but lives outside
  Nest's DI/decorator model: a separate `schema.prisma`, a generated client, and
  a `PrismaService` wrapper. More moving parts and a second source of truth for
  the schema. Rejected for added friction against the current code.
- **MikroORM** — solid TypeScript support, Unit-of-Work/Identity-Map, and a Nest
  adapter, but a smaller community/ecosystem and an identity model that is less
  familiar than TypeORM's Active-Record/Data-Mapper split. Rejected as
  lower-value for a learning project.
- **Sequelize** — battle-tested but JS-first; weaker TypeScript ergonomics and
  no decorator-native modeling without extra layers. Rejected.

Schema is managed with **TypeORM migrations** (`synchronize: false`); migrations
run automatically on app boot (`migrationsRun: true`) and can be generated/run
via CLI scripts.

## Changes

### 1. `docker-compose.yml` (project root — new)
Postgres 16 with a **named volume** for persistence:
```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: carreira-native-ai-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: carreira_native_ai
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```
The `pgdata` named volume is what keeps data across `docker compose down`/`up`.

### 2. Dependencies (`apps/api/package.json`)
- runtime: `@nestjs/typeorm`, `typeorm`, `pg`, `@nestjs/config`
- dev: `@types/pg`, `dotenv` (so the migration CLI DataSource can read `.env`)

### 3. Environment config
- New `apps/api/.env` (gitignored) and `apps/api/.env.example` (committed):
  `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`,
  `DATABASE_NAME` (matching docker-compose), plus the existing `JWT_SECRET`.
- Ensure `.env` is in `.gitignore` (add an entry if missing).

### 4. User entity — `apps/api/src/users/entities/user.entity.ts`
Convert the plain interface into a TypeORM entity (keeps the `User` type name,
so existing imports keep working):
```ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ unique: true }) email: string;
  @Column() passwordHash: string;
}
```
This makes `crypto.randomUUID()` in the service unnecessary (DB generates the id).

### 5. Root TypeORM wiring — `apps/api/src/app.module.ts`
Add `ConfigModule.forRoot({ isGlobal: true })` and
`TypeOrmModule.forRootAsync` driven by `ConfigService`:
`type: 'postgres'`, host/port/user/password/database from env, `entities: [User]`,
`migrations`, `synchronize: false`, `migrationsRun: true`.

### 6. CLI DataSource + migrations — `apps/api/src/database/`
- `data-source.ts` — exports a `DataSource` reading from `process.env`
  (`dotenv/config`), pointing at the same entity + `migrations` glob. Used by the
  TypeORM CLI only.
- `migrations/` — holds the generated initial migration (creates `users` table
  with the unique email index).
- `apps/api/package.json` scripts:
  - `"typeorm": "typeorm-ts-node-commonjs -d src/database/data-source.ts"`
  - `"migration:generate"`, `"migration:run"`, `"migration:revert"` wrapping it.
- Optional root convenience scripts: `db:up`/`db:down` (docker compose) and
  `migration:run` (`pnpm --filter api ...`).

### 7. `UsersService` — `apps/api/src/users/users.service.ts`
Inject the repository and replace the array. All lookups/creates become async:
```ts
constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

async create(data): Promise<User> { return this.users.save(this.users.create(data)); }
async findByEmail(email): Promise<User | null> { return this.users.findOne({ where: { email } }); }
async findById(id): Promise<User | null> { return this.users.findOne({ where: { id } }); }
```
`register` keeps the explicit `findByEmail` check → `ConflictException` (the
entity's `unique` email is the DB-level safety net), now with `await`.

### 8. `UsersModule` — `apps/api/src/users/users.module.ts`
Add `imports: [TypeOrmModule.forFeature([User])]`.

### 9. Update synchronous consumers to `await`
- `apps/api/src/auth/auth.service.ts` → `const user = await this.usersService.findByEmail(...)`.
- `apps/api/src/auth/users.controller.ts` → make `getMe` async, return
  `Promise<UserResponseDto>`, `await this.usersService.findById(...)`.

### 10. Tests
- `users.service.spec.ts` and `auth.service.spec.ts` currently provide
  `UsersService` directly and call `create`/`findByEmail`/`findById`
  synchronously. Update them to:
  - register a mock `Repository<User>` via `getRepositoryToken(User)` — a small
    array/Map-backed fake implementing `create`, `save`, `findOne` (no native
    DB driver added, reliable on Windows), and
  - `await` the now-async calls.
- `app.e2e-spec.ts` boots the full `AppModule`, so it requires a running
  Postgres. Document that `docker compose up -d` must run first (the test itself
  only hits `/v1`).

## Verification

1. `docker compose up -d` (root) — Postgres starts; `docker volume ls` shows
   `*_pgdata`.
2. `cd apps/api && pnpm migration:run` — `users` table created.
3. `pnpm run dev:api` (root) — boots clean, `migrationsRun` is idempotent.
4. `POST /v1/users` (Swagger at `/docs` or curl) → `201` with `{id,name,email}`.
   Repeat same email → `409 Conflict`.
5. `POST /v1/auth/login` with those credentials → `200` + `accessToken`;
   `GET /v1/users/me` with the Bearer token → `200`.
6. **Persistence check:** `docker compose down && docker compose up -d`, restart
   the API — the previously registered user still logs in (data survived via the
   `pgdata` volume).
7. `pnpm test:api` (root) — unit specs pass with the mocked repository.