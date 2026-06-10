# Plano: Migrar auth para Passport (passport-jwt) + reorganizar pastas

## Context

O backend de auth (`apps/api/src/auth/`) foi implementado com o approach **custom** da
página oficial *Authentication* do Nest: um `AuthGuard implements CanActivate` que chama
`jwtService.verifyAsync` na mão, sem Passport e com estrutura de pastas plana.

O usuário quer migrar para o padrão **Passport** (`@nestjs/passport` + `passport-jwt`), que é
o mais difundido no ecossistema NestJS e melhor para portfólio / evolução futura (adicionar
OAuth, local strategy etc.). Isso traz a estrutura idiomática que o usuário descreveu:
`strategies/jwt.strategy.ts` (uma `PassportStrategy`) e `guards/jwt-auth.guard.ts` que
**extende `AuthGuard('jwt')`** (factory do `@nestjs/passport`, não uma classe nossa).

Os endpoints, DTOs, fluxo de register/login (bcrypt + assinatura JWT via `JwtService`) e o
Swagger **não mudam** — só troca o mecanismo de verificação do token e a organização de pastas.

## Dependências a instalar (`apps/api`)

- `@nestjs/passport`, `passport`, `passport-jwt`
- `@types/passport-jwt` (dev)

(`@nestjs/jwt` continua sendo usado pelo `AuthService` para **assinar** o token no login.)

## Mudança de estrutura

```
src/auth/
  guards/
    jwt-auth.guard.ts      # NOVO — extends AuthGuard('jwt')
    jwt-auth.guard.spec.ts # NOVO — teste trivial de instanciação
  strategies/
    jwt.strategy.ts        # NOVO — extends PassportStrategy(Strategy)
    jwt.strategy.spec.ts   # NOVO — testa validate()
  dto/                     # inalterado
  auth.controller.ts       # inalterado
  auth.controller.spec.ts  # inalterado
  auth.service.ts          # inalterado
  auth.service.spec.ts     # inalterado
  users.controller.ts      # ajustar import do guard + shape do payload
  current-user.decorator.ts# mantido (lê request.user, populado pelo Passport)
  constants.ts             # mantido (secret/expiresIn)
  auth.module.ts           # ajustar: PassportModule + provider JwtStrategy
  auth.guard.ts            # REMOVER (substituído)
  auth.guard.spec.ts       # REMOVER
```

## Novos arquivos

### `src/auth/strategies/jwt.strategy.ts`
- `JwtStrategy extends PassportStrategy(Strategy)` (de `passport-jwt`).
- No `super({ ... })`: `jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()`,
  `ignoreExpiration: false`, `secretOrKey: jwtConstants.secret` (reusa
  [constants.ts](../apps/api/src/auth/constants.ts)).
- `validate(payload: { sub: string; email: string })` → retorna `{ userId: payload.sub, email: payload.email }`.
  Esse retorno é o que o Passport injeta em `request.user`.

### `src/auth/guards/jwt-auth.guard.ts`
- `export class JwtAuthGuard extends AuthGuard('jwt') {}` (factory de `@nestjs/passport`).

### Specs
- `jwt.strategy.spec.ts` — instancia a strategy e verifica que `validate({ sub, email })`
  retorna `{ userId, email }`.
- `jwt-auth.guard.spec.ts` — teste mínimo: `expect(new JwtAuthGuard()).toBeDefined()`.

## Arquivos a modificar

### `src/auth/auth.module.ts`
- Importar `PassportModule` (de `@nestjs/passport`) na lista de `imports`.
- Trocar o provider `AuthGuard` por `JwtStrategy`.
- Manter `UsersModule`, `JwtModule.register({ secret, signOptions })` e os controllers
  (`AuthController`, `UsersController`).

### `src/auth/users.controller.ts`
- Trocar import/uso: `@UseGuards(AuthGuard)` (de `./auth.guard`) → `@UseGuards(JwtAuthGuard)`
  (de `./guards/jwt-auth.guard`).
- O `@CurrentUser()` agora recebe `{ userId, email }` (retorno do `validate`); ajustar
  `usersService.findById(payload.sub)` → `findById(payload.userId)`.
- `@ApiBearerAuth()` permanece.

### Remoções
- Apagar [auth.guard.ts](../apps/api/src/auth/auth.guard.ts) e
  [auth.guard.spec.ts](../apps/api/src/auth/auth.guard.spec.ts).

## O que NÃO muda

- `AuthService` (register/login, bcrypt, `jwtService.signAsync({ sub, email })`), seus specs,
  o `AuthController` e seus specs, os 4 DTOs e toda a config de Swagger em `main.ts`.
- `current-user.decorator.ts` (continua lendo `request.user`).

## Verificação

1. `pnpm install` (novas deps de Passport).
2. `pnpm run test:api` — specs antigos continuam passando; os novos (strategy/guard) passam.
   Esperado: suites = anteriores − 1 (guard antigo) + 2 (strategy + guard novo).
3. `pnpm run dev:api` + `http://localhost:3000/docs` — os 3 endpoints e o botão **Authorize**
   continuam funcionando.
4. Fluxo manual: `register` → `login` (pega `accessToken`) → `GET /v1/users/me` com
   `Authorization: Bearer <token>` retorna `200` + dados; sem token → `401`; token inválido → `401`.