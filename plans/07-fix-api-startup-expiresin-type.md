# Plano: Corrigir API que não inicia (`pnpm run dev:api`)

## Context

`pnpm run dev:api` (que roda `nest start --watch`) falha ao iniciar. Os testes e o lint
passam, então o problema ficou invisível até uma compilação TypeScript completa — que o
`nest start` faz, mas a suíte Jest (com `JwtService` mockado, que nunca importa
`auth.module.ts`) não faz.

A falha real é um único erro de compilação:

```
src/auth/auth.module.ts:17:22 - error TS2322:
Type 'string' is not assignable to type 'number | StringValue | undefined'.
   signOptions: { expiresIn: jwtConstants.expiresIn },
Found 1 error(s).
```

Causa raiz: `@types/jsonwebtoken` tipa `SignOptions.expiresIn` como `StringValue | number`,
onde `StringValue` é um template-literal type estrito do `ms`
(`` `${number}` | `${number}${UnitAnyCase}` | `${number} ${UnitAnyCase}` ``). Em
[constants.ts](../apps/api/src/auth/constants.ts), `expiresIn: '1h'` é inferido como o tipo
amplo `string`, que **não** é atribuível a `StringValue`. O literal `'1h'` *é* atribuível
(casa com `` `${number}h` ``) — o que quebra é apenas o alargamento para `string`.

Esses arquivos (`constants.ts`, `auth.module.ts`) são novos/untracked, então esse erro
existe desde que o auth foi adicionado; a API simplesmente nunca tinha sido iniciada.

## Mudança

Adicionar `as const` ao objeto `jwtConstants` em
[apps/api/src/auth/constants.ts](../apps/api/src/auth/constants.ts). Isso restringe
`expiresIn` ao tipo literal `'1h'`, que satisfaz `StringValue`. `secret` continua tipado
como `string` (é `process.env.JWT_SECRET ?? '...'`), então a config do `JwtModule` não muda.

```ts
export const jwtConstants = {
  secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  expiresIn: '1h',
} as const;
```

Nenhuma mudança necessária em `auth.module.ts` — a correção na constante de origem se propaga.

## Verificação

1. `pnpm run build:api` — compila com **0 erros** (antes: "Found 1 error(s)").
2. `pnpm run dev:api` — Nest sobe e loga as rotas mapeadas; permanece rodando.
3. `http://localhost:3000/docs` carrega; os 3 endpoints de auth/users e o botão **Authorize** funcionam.
4. Sanidade: `pnpm run test:api` e `pnpm run lint:api` continuam passando.