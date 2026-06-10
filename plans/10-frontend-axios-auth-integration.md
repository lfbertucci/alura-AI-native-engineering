# Plano: Integração do frontend (axios) com o backend de autenticação

## Context

O backend NestJS (`apps/api`) já expõe endpoints de autenticação com Swagger em `/docs`,
prefixo global `/v1` e CORS liberado para `http://localhost:5173`. No frontend
(`apps/web`), as telas de **Login** e **Cadastro** já existem (Atomic Design), mas os
formulários apenas validam localmente e chamam `onSubmit={() => console.log('TODO: connect auth API')}`.
Não há axios instalado, nem camada de serviços, nem configuração de URL da API.

O objetivo é conectar essas telas ao backend real usando **axios**: cadastrar usuários,
autenticar (recebendo JWT), persistir o token e proteger uma área logada.

### Endpoints do backend (já existentes)
| Endpoint | Método | Body | Resposta | Erros |
|---|---|---|---|---|
| `/v1/users` | POST | `{ name, email, password }` | `{ id, name, email }` (201) | 400 validação, 409 email em uso |
| `/v1/auth/login` | POST | `{ email, password }` | `{ accessToken }` (200) | 401 credenciais inválidas |
| `/v1/auth/me` | GET (Bearer) | — | `{ id, name, email }` | 401 token inválido |

Envelope de erro NestJS: `{ statusCode, message: string | string[], error }`.

### Decisões do usuário
- **Pós-login:** criar rota `/home` **protegida** que exige token e chama `GET /v1/auth/me` para exibir o nome.
- **Pós-cadastro:** redirecionar para `/login` (endpoint não retorna token; login manual).
- **"Lembrar-me":** marcado → `localStorage`; desmarcado → `sessionStorage`.

## Mudanças

### 1. Dependência e configuração de ambiente
- Adicionar `axios` em [apps/web/package.json](apps/web/package.json) e instalar (`pnpm --filter web add axios`).
- Criar `apps/web/.env` com `VITE_API_URL=http://localhost:3000/v1` e `apps/web/.env.example` com o mesmo conteúdo (documentação).
- Adicionar uma referência de tipo para `import.meta.env` se necessário (Vite já tipa `VITE_*` por padrão; não criar arquivo extra a menos que o TS reclame).

### 2. Cliente axios — `apps/web/src/services/api.ts`
- Instância `axios.create({ baseURL: import.meta.env.VITE_API_URL })`.
- **Request interceptor:** lê o token via helper de storage (ver item 3) e adiciona `Authorization: Bearer <token>` quando presente.
- **Response interceptor:** em `401`, limpa o token armazenado (não forçar `window.location` para manter testabilidade — deixar o roteamento/guard tratar o redirect).

### 3. Token storage — `apps/web/src/services/token-storage.ts`
- `setToken(token: string, remember: boolean)` → grava em `localStorage` se `remember`, senão em `sessionStorage` (limpando o outro para evitar tokens órfãos).
- `getToken(): string | null` → procura em `localStorage` e depois `sessionStorage`.
- `clearToken()` → remove de ambos.
- Chave única, ex.: `'auth_token'`.

### 4. Serviço de autenticação — `apps/web/src/services/auth.service.ts`
Funções finas sobre a instância axios, retornando os shapes tipados do backend:
- `register({ name, email, password })` → `POST /users`.
- `login({ email, password })` → `POST /auth/login`, retorna `{ accessToken }`.
- `getMe()` → `GET /auth/me`, retorna `{ id, name, email }`.
- Tipos `RegisterPayload`, `LoginPayload`, `AuthResponse`, `UserResponse` co-locados aqui.
- Helper `extractApiError(error)` para normalizar a mensagem do envelope NestJS
  (`message` pode ser `string` ou `string[]`) em uma string amigável para a UI.

### 5. Formulários: estados de loading e erro de servidor
Os organisms precisam exibir feedback assíncrono. Adicionar props **opcionais** (sem quebrar testes existentes):
- [apps/web/src/components/organisms/LoginForm.tsx](apps/web/src/components/organisms/LoginForm.tsx):
  - `onSubmit` passa a poder ser assíncrono; adicionar props `loading?: boolean` e `serverError?: string`.
  - Desabilitar o `Button` e mostrar texto/estado de carregando quando `loading`.
  - Renderizar `serverError` (quando presente) acima do botão, usando token `text-error`.
  - O campo `identifier` é enviado como **`email`** (backend só aceita email).
- [apps/web/src/components/organisms/RegisterForm.tsx](apps/web/src/components/organisms/RegisterForm.tsx): mesmas props `loading`/`serverError` e tratamento equivalente.
- Verificar se o `Button` ([apps/web/src/components/atoms/Button.tsx](apps/web/src/components/atoms/Button.tsx)) aceita `disabled`; se não, adicionar passthrough da prop.

### 6. Páginas: orquestração das chamadas
- [apps/web/src/components/pages/LoginPage.tsx](apps/web/src/components/pages/LoginPage.tsx):
  - Estado local `loading` e `serverError`.
  - `handleSubmit`: chama `authService.login({ email: identifier, password })`; em sucesso, `setToken(accessToken, remember)` e `navigate('/home')` (via `useNavigate`); em erro, `setServerError(extractApiError(e))`.
- [apps/web/src/components/pages/CadastroPage.tsx](apps/web/src/components/pages/CadastroPage.tsx):
  - `handleSubmit`: chama `authService.register(...)`; em sucesso, `navigate('/login', { state: { registered: true } })`; em erro (ex.: 409), `setServerError`.
  - Opcional: na LoginPage, ler `location.state.registered` para mostrar aviso "Cadastro realizado, faça login".

### 7. Área protegida
- Criar `apps/web/src/components/organisms/ProtectedRoute.tsx` (ou `routes/`): se `getToken()` for nulo, `<Navigate to="/login" replace />`; senão renderiza `children`/`<Outlet />`.
- Criar `apps/web/src/components/pages/HomePage.tsx`: no `useEffect`, chama `authService.getMe()` para exibir o nome do usuário; botão "Sair" que faz `clearToken()` + `navigate('/login')`. Layout simples com tokens Tailwind (não precisa do `AuthTemplate`).
- Atualizar [apps/web/src/App.tsx](apps/web/src/App.tsx): adicionar rota `/home` envolvida por `ProtectedRoute`.

### 8. Testes (Vitest + Testing Library, padrão existente)
Co-locar testes seguindo o padrão atual (`MemoryRouter`, `vi.fn()`, `jest-axe`):
- `auth.service.test.ts`: mockar a instância axios; validar payloads e parsing de erro (`extractApiError` com `message` string e array).
- `token-storage.test.ts`: remember → localStorage; sem remember → sessionStorage; `getToken`/`clearToken`.
- Atualizar `LoginForm.test.tsx` / `RegisterForm.test.tsx`: cobrir render de `serverError` e `loading` (botão desabilitado). Garantir que os testes existentes continuam passando (props novas são opcionais).
- `ProtectedRoute.test.tsx`: redireciona sem token; renderiza filho com token.
- `HomePage.test.tsx`: mockar `getMe`, exibir nome; ação de logout limpa token.

## Arquivos principais
- Novos: `apps/web/src/services/api.ts`, `token-storage.ts`, `auth.service.ts`, `apps/web/src/components/pages/HomePage.tsx`, `ProtectedRoute.tsx`, `.env`, `.env.example` (+ testes co-locados).
- Modificados: `apps/web/package.json`, `App.tsx`, `LoginPage.tsx`, `CadastroPage.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`, possivelmente `Button.tsx`.

## Verificação (end-to-end)
1. **Backend:** `pnpm run dev:api` (porta 3000). Conferir Swagger em `http://localhost:3000/docs`.
2. **Frontend:** garantir `apps/web/.env` com `VITE_API_URL`; `pnpm run dev:web` (porta 5173).
3. **Cadastro:** em `/cadastro`, criar usuário → deve redirecionar para `/login` (e exibir aviso de sucesso). Repetir o mesmo email → exibir erro 409 "Email already in use".
4. **Login:** em `/login`, entrar com as credenciais → token salvo (conferir DevTools: local/sessionStorage conforme "Lembrar-me") e redirecionar para `/home` com o nome vindo de `/auth/me`.
5. **Proteção:** abrir `/home` sem token (aba anônima) → redireciona para `/login`. Logout em `/home` limpa o token e volta para `/login`.
6. **Erro de credenciais:** login com senha errada → mensagem 401 "Invalid credentials" no formulário.
7. **Testes:** `pnpm run test:web` — todos verdes (novos + existentes).

> Observação: o backend usa armazenamento **em memória** — usuários somem ao reiniciar a API. Para um teste end-to-end, cadastre e logue na mesma sessão do servidor.