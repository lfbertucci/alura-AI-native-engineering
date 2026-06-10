# Plano: Ajuste das rotas de autenticação

## Context

O backend de auth já está implementado (`apps/api`, NestJS 11 + Passport JWT + Swagger,
store em memória). Numa revisão das rotas, o usuário definiu as URLs definitivas, que
diferem do que foi implementado. O objetivo é **realinhar as rotas** sem mudar o
comportamento de cada endpoint.

### Rotas atuais → desejadas

| Endpoint | Hoje | Desejado |
|---|---|---|
| Cadastrar usuário | `POST /v1/auth/register` | **`POST /v1/users`** |
| Login (JWT) | `POST /v1/auth/login` | `POST /v1/auth/login` (mantém) |
| Usuário logado | `GET /v1/users/me` | **`GET /v1/auth/me`** |

Na prática é uma **troca de lugar**: o cadastro passa a pertencer ao recurso `users` e o
"me" passa a ficar sob `auth`.

### Decisão estrutural (confirmada)

Mover a lógica de registro para o `UsersModule`, deixando as fronteiras REST limpas:
- A regra de cadastro (hash bcrypt + checagem de email duplicado + create) sai do
  `AuthService` e vai para **`UsersService.register`**.
- O `UsersController` (rota `POST /users`) passa a viver no **`UsersModule`** e injeta
  apenas o `UsersService`.
- O `AuthModule` fica responsável por **login** e **me**.

Não há dependência circular: `AuthModule` importa `UsersModule` (já importa hoje e o
`UsersModule` já exporta o `UsersService`); o `UsersModule` não precisa de nada do `auth`.

## Mudanças

### 1. `UsersService` (`src/users/users.service.ts`)
- Adicionar `register(dto: RegisterDto): Promise<UserResponseDto>`:
  - se `findByEmail(dto.email)` existir → `ConflictException('Email already in use')` (409);
  - senão `bcrypt.hash(dto.password, 10)`, `this.create({...})`, retorna `{ id, name, email }` (sem hash).
- Mantém `create` / `findByEmail` / `findById` como estão.
- Passa a importar `bcrypt` (a dep já existe; hoje é usada no `AuthService`).

### 2. DTOs
- Mover `register.dto.ts` e `user-response.dto.ts` de `src/auth/dto/` para `src/users/dto/`
  (agora são input/output do recurso `users`). Atualizar os imports nos arquivos que os usam.
- `login.dto.ts` e `auth-response.dto.ts` permanecem em `src/auth/dto/`.

### 3. `UsersController` — mover para `src/users/users.controller.ts`
- Sai de `src/auth/users.controller.ts` para dentro do `UsersModule`.
- Substituir `GET me` por:
  - `POST /users` (`@Controller('users')`, sem subpath) → `@HttpCode(201)`,
    `@ApiCreatedResponse({ type: UserResponseDto })`, delega para `usersService.register(dto)`.
- Remove o uso de `JwtAuthGuard` / `CurrentUser` (vão para o `AuthController`).

### 4. `AuthController` (`src/auth/auth.controller.ts`)
- Remover o método `register` (e o import de `RegisterDto`/`UserResponseDto` se não usados).
- Manter `login`.
- Adicionar `getMe`:
  - `GET /auth/me`, `@UseGuards(JwtAuthGuard)`, `@ApiBearerAuth()`,
    `@ApiOkResponse({ type: UserResponseDto })`;
  - injetar `UsersService` no construtor; resolver `usersService.findById(payload.userId)`;
    `NotFoundException` se ausente; retornar `{ id, name, email }`.
  - reutiliza `JwtAuthGuard` (`src/auth/guards/`) e `@CurrentUser()` (`src/auth/current-user.decorator.ts`).

### 5. `AuthService` (`src/auth/auth.service.ts`)
- Remover `register` (migrado para `UsersService`). Manter `login` (usa `findByEmail` +
  `bcrypt.compare` + `jwtService.signAsync`).

### 6. Módulos
- `src/users/users.module.ts`: declarar `controllers: [UsersController]`; manter
  `providers: [UsersService]` e `exports: [UsersService]`.
- `src/auth/auth.module.ts`: remover `UsersController` da lista de `controllers`
  (fica só `AuthController`). `imports` (UsersModule, PassportModule, JwtModule) e
  `providers` (AuthService, JwtStrategy) permanecem.

## Testes a atualizar

- **`auth.controller.spec.ts`**: remover os testes de `register`; manter `login`; adicionar
  teste de `getMe` (mock de `UsersService`: retorna usuário → `{id,name,email}`; ausente → `NotFoundException`).
- **`auth.service.spec.ts`**: remover os testes de `register`; manter os de `login`.
- **`users.service.spec.ts`**: adicionar testes de `register` (sucesso devolve DTO sem hash;
  email duplicado lança `ConflictException`).
- **Novo `users.controller.spec.ts`**: `POST /users` delega para `usersService.register` e
  propaga `ConflictException`.
- Conferir imports de DTO quebrados após a mudança de pasta (`src/auth/dto` → `src/users/dto`).

## Verificação

1. `pnpm run test:api` — todos os specs passam.
2. `pnpm run dev:api` e abrir `http://localhost:3000/docs` — confirmar:
   - `POST /v1/users` (tag **users**), `POST /v1/auth/login` e `GET /v1/auth/me` (tag **auth**, cadeado Bearer);
   - **não** existem mais `POST /v1/auth/register` nem `GET /v1/users/me`.
3. Fluxo manual (Swagger UI ou curl):
   - `POST /v1/users` `{ name, email, password }` → `201` + usuário sem senha; repetir email → `409`.
   - `POST /v1/auth/login` → `200` + `{ accessToken }`.
   - `GET /v1/auth/me` sem token → `401`; com `Authorization: Bearer <token>` → `200` + dados do usuário.

## Commit

`refactor(api): move register to POST /v1/users and me to GET /v1/auth/me`