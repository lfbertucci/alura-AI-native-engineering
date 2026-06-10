# Plano: Backend de Autenticação (in-memory, JWT, Swagger)

## Context

O frontend (`apps/web`) já tem as telas de login e cadastro. Agora o backend (`apps/api`,
NestJS 11) precisa expor a API de autenticação. Hoje a API só tem o `AppController` de
"Hello World" — sem módulos de feature, sem JWT, sem Swagger.

O objetivo é entregar **3 endpoints**:
1. **Cadastrar usuário** (nome, email, senha)
2. **Login** (retorna JWT)
3. **Dados do usuário logado** (protegido por Auth Guard)

Decisões confirmadas com o usuário:
- **Auth Guard custom + `@nestjs/jwt`** (padrão da página oficial *Authentication* do Nest, sem Passport).
- **Módulos separados**: `UsersModule` (store em memória) + `AuthModule` (fluxo de auth).
- **bcrypt** para hash de senha.
- **Persistência em memória**: um array no `UsersService`. Nada de ORM/DB.

A base já tem `ValidationPipe` (whitelist + forbidNonWhitelisted), `class-validator` e
`class-transformer` configurados — vamos reaproveitar para validar os DTOs.

## Endpoints (todos sob o prefixo `/v1`)

| Método | Rota | Descrição | Status | Guard |
|---|---|---|---|---|
| `POST` | `/v1/auth/register` | Cadastra usuário | `201 Created` | — |
| `POST` | `/v1/auth/login` | Autentica e retorna JWT | `200 OK` | — |
| `GET` | `/v1/users/me` | Dados do usuário logado | `200 OK` | `AuthGuard` (Bearer) |

`GET /v1/users/me` fica sob `users` (recurso = substantivo, conforme as regras REST do
CLAUDE.md), mas o guard segue o padrão da doc do Nest.

## Dependências a instalar (`apps/api`)

- `@nestjs/jwt` — assinar/verificar JWT
- `@nestjs/swagger` — documentação OpenAPI
- `bcrypt` + `@types/bcrypt` (dev) — hash de senha

(`class-validator` e `class-transformer` já estão presentes.)

## Mudanças de infraestrutura

### `src/main.ts`
- `app.setGlobalPrefix('v1')` para versionar todas as rotas (CLAUDE.md exige `/v1`).
- Configurar Swagger com `DocumentBuilder`: título, versão, `.addBearerAuth()`, montado em
  `/docs`. Manter helmet/cors/ValidationPipe como estão.

### `src/app.controller.ts` + testes
- Trocar `@Controller('v1')` por `@Controller()` (o prefixo global agora aplica o `v1`),
  para a rota não virar `/v1/v1`.
- Ajustar `app.controller.spec.ts` e `test/app.e2e-spec.ts` para baterem em `GET /v1`.

### `src/app.module.ts`
- Importar `UsersModule` e `AuthModule`.

## Novos arquivos

### Users (`src/users/`)
- `entities/user.entity.ts` — modelo interno `User` (`id`, `name`, `email`, `passwordHash`).
- `users.service.ts` — array em memória + métodos:
  - `create({ name, email, passwordHash })` → gera `id` (ex.: `crypto.randomUUID()`), insere e retorna o `User`.
  - `findByEmail(email)` → `User | undefined`.
  - `findById(id)` → `User | undefined`.
- `users.module.ts` — declara o service e o **exporta** (consumido pelo `AuthModule`).
- `users.service.spec.ts`.

### Auth (`src/auth/`)
- `constants.ts` — `jwtConstants` com `secret: process.env.JWT_SECRET ?? '<fallback dev>'`
  e `expiresIn` (ex.: `'1h'`), espelhando a doc do Nest.
- `dto/register.dto.ts` — `name`, `email`, `password` com validadores
  (`@IsNotEmpty`, `@IsEmail`, `@MinLength(6)`) **e** `@ApiProperty` (input no Swagger).
- `dto/login.dto.ts` — `email`, `password` com validadores + `@ApiProperty`.
- `dto/user-response.dto.ts` — `id`, `name`, `email` (output, **sem** senha/hash), com `@ApiProperty`.
- `dto/auth-response.dto.ts` — `accessToken` (output do login), com `@ApiProperty`.
- `auth.service.ts`:
  - `register(dto)` → se `findByEmail` existir, lança `ConflictException` (409); senão
    `bcrypt.hash`, `usersService.create(...)`, retorna `UserResponseDto` (sem hash).
  - `login(dto)` → busca por email + `bcrypt.compare`; se falhar, `UnauthorizedException`
    (401); senão assina o JWT (`sub: id`, `email`) e retorna `{ accessToken }`.
- `auth.guard.ts` — guard custom (padrão doc Nest): extrai o Bearer do header
  `Authorization`, `jwtService.verifyAsync` com o secret, anexa o payload em `request.user`;
  401 se ausente/inválido.
- `current-user.decorator.ts` — param decorator `@CurrentUser()` que lê `request.user`
  (açúcar opcional sobre `@Req()`).
- `auth.controller.ts`:
  - `POST register` → `@HttpCode(201)`, `@ApiCreatedResponse({ type: UserResponseDto })`.
  - `POST login` → `@HttpCode(200)`, `@ApiOkResponse({ type: AuthResponseDto })`.
- `UsersController` (rota `users/me`) → `GET /users/me`, protegido por `@UseGuards(AuthGuard)`
  + `@ApiBearerAuth()`; resolve o `id` do payload via `usersService.findById` e retorna `UserResponseDto`.
- `auth.module.ts` — importa `UsersModule` e `JwtModule.register({ secret, signOptions })`;
  declara `AuthController`, `UsersController`, `AuthService`, `AuthGuard`.
- Specs: `auth.service.spec.ts`, `auth.controller.spec.ts`, `auth.guard.spec.ts`.

> Nota sobre dependência circular: o `GET /users/me` precisa do `AuthGuard`, e o `AuthModule`
> já importa o `UsersModule`. Para evitar ciclo, o `UsersController` é declarado **dentro do
> `AuthModule`** (que já tem acesso ao `UsersService` via import e ao `AuthGuard`). O
> `UsersModule` fica apenas com o service/store em memória.

## Padrões a seguir

- **Swagger**: todo DTO de input/output usa `@ApiProperty`; controllers usam
  `@ApiTags`, `@ApiOkResponse`/`@ApiCreatedResponse` (outputs) e `@ApiBearerAuth` na rota protegida.
- **Senha nunca volta na resposta** — sempre mapear para `UserResponseDto`.
- **Testes co-locados** (`.spec.ts`) seguindo o padrão `Test.createTestingModule` já usado em
  `app.controller.spec.ts`.
- **Conventional Commits** no commit final (ex.: `feat(api): add in-memory JWT auth with swagger`).

## Verificação

1. `pnpm install` (instala as novas deps).
2. `pnpm run test:api` — todos os specs passam.
3. `pnpm run dev:api` e abrir `http://localhost:3000/docs` — confirmar os 3 endpoints,
   schemas de input/output e o botão **Authorize** (Bearer).
4. Fluxo manual (curl ou Swagger UI):
   - `POST /v1/auth/register` com `{ name, email, password }` → `201` + usuário sem senha.
   - Repetir o mesmo email → `409 Conflict`.
   - `POST /v1/auth/login` com as credenciais → `200` + `{ accessToken }`.
   - `GET /v1/users/me` **sem** token → `401`.
   - `GET /v1/users/me` com `Authorization: Bearer <token>` → `200` + dados do usuário.