# Plano: Feed de Posts (CodeConnect)

## Contexto

O projeto hoje tem apenas autenticação (login/cadastro/home) sobre NestJS + PostgreSQL + React/Atomic Design. Precisamos implementar o produto em si: um **feed de publicações** (CodeConnect), com **detalhe do post** e **criação de post**, conforme o Figma (`Feed` 155:3099, `Detalhes Página` 155:3194, `Publicar` 155:3123).

Regras de negócio (do usuário):
- **Não logado** pode **ver** feed e detalhe; **não** pode curtir nem comentar.
- **Logado** pode **criar post, curtir e comentar** livremente.
- O **filtro/busca** é **full-text search no backend**.
- Feed e detalhe **compartilham layout** → usar um template comum (sidebar + conteúdo).
- O menu lateral tem um link que alterna **Login / Sair** conforme a sessão.
- Posts sem thumbnail mostram um **placeholder**.
- Seed gerando posts mockados.

Decisões confirmadas com o usuário:
1. **Tokens**: unificar `@theme` aos valores exatos do design system CodeConnect.
2. **Fontes**: adotar **Prompt** (UI), **Roboto Mono** (bloco de código) e **Material Icons** (ícones).
3. **Imagem**: **upload de arquivo** (multer) salvo em `apps/api/uploads`, servido estaticamente; `thumbnailUrl` guarda o caminho.
4. **Comentários**: **um nível de respostas** (`parentId` auto-referente).

---

## Backend — `apps/api`

### Entidades (`src/posts/entities/`)
Padrão existente: `@PrimaryGeneratedColumn('uuid')`, tabela nomeada, relações `@ManyToOne`. Adicionar `@CreateDateColumn`/`@UpdateDateColumn` onde fizer sentido.

- **`post.entity.ts`** — `id`, `title`, `description` (text), `code` (text, nullable — snippet exibido no detalhe), `thumbnailUrl` (nullable), `author` (`@ManyToOne(User)`), `tags` (`@ManyToMany(Tag)` via `post_tags`), `createdAt`, `updatedAt`. Coluna gerada `searchVector tsvector` (ver migration).
- **`tag.entity.ts`** — `id`, `name` (unique). Alimenta os chips de filtro e as tags do card.
- **`comment.entity.ts`** — `id`, `content`, `author` (`@ManyToOne(User)`), `post` (`@ManyToOne(Post)`), `parent` (`@ManyToOne(Comment, nullable)` — respostas), `createdAt`.
- **`post-like.entity.ts`** — `id`, `user`, `post`, `createdAt`, `@Unique(['user','post'])`.

`User` **não** será alterado: o `@handle` é derivado do local-part do email no mapeamento de resposta (ex.: `julio@…` → `@julio`); avatar usa fallback de iniciais no front.

### Módulo (`src/posts/`)
`posts.module.ts` (registra `TypeOrmModule.forFeature([Post, Tag, Comment, PostLike])`), `posts.controller.ts`, `comments.controller.ts`, `posts.service.ts`, `comments.service.ts`. Importa `UsersModule`/`AuthModule` conforme necessário.

### Endpoints (prefixo `/v1`, princípios REST do CLAUDE.md)
- `GET /posts?search=&tags=&sort=&page=` — feed. **Optional auth** (popula `likedByMe`). `search` → full-text; `tags` → filtro por nome.
- `GET /posts/:id` — detalhe (autor, tags, contadores, `likedByMe`, comentários aninhados 1 nível).
- `POST /posts` — criar (**protegido**, `multipart/form-data` com `FileInterceptor('thumbnail')`). Campos: `title`, `description`, `code?`, `tags?`.
- `POST /posts/:id/likes` / `DELETE /posts/:id/likes` — curtir/descurtir (**protegido**).
- `POST /posts/:id/comments` — comentar (**protegido**); body `{ content, parentId? }`.
- `GET /tags` — lista de tags para os chips de filtro.

### Optional auth guard
Novo `src/auth/guards/optional-jwt-auth.guard.ts` estendendo `AuthGuard('jwt')` com `handleRequest(err, user) { return user ?? null; }`. Usado nos `GET` para resolver `likedByMe` sem exigir login. (`JwtAuthGuard` + `@CurrentUser()` já existem e serão reusados nos endpoints protegidos.)

### Full-text search (Postgres)
Na migration: coluna gerada
`search_vector tsvector GENERATED ALWAYS AS (to_tsvector('portuguese', coalesce(title,'') || ' ' || coalesce(description,''))) STORED` + índice **GIN**. Consulta no service via QueryBuilder: `post.search_vector @@ plainto_tsquery('portuguese', :search)`. Filtro de tags por `join` em `post_tags`/`tags.name IN (...)`.

### Upload estático
`main.ts`: trocar para `NestFactory.create<NestExpressApplication>` e `app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' })`. `thumbnailUrl` salvo como `/uploads/<arquivo>`. Adicionar `apps/api/uploads/.gitkeep` e ignorar conteúdo no `.gitignore`.

### Migration
`src/database/migrations/<timestamp>-CreatePosts.ts` (SQL escrito à mão, seguindo o padrão de `1781049600000-CreateUsers.ts`): cria `posts`, `tags`, `post_tags`, `comments`, `post_likes`, a coluna `search_vector` + índice GIN, FKs e índices. **Registrar a classe nos dois lugares**: array `migrations` de `src/database/data-source.ts` e de `src/app.module.ts`; e adicionar as 4 entidades nos dois arrays `entities`. (`migrationsRun: true` aplica no boot.)

### Seed (`src/database/seed.ts`)
Script standalone (inicializa `AppDataSource`). Cria ~3 usuários demo (handles via email), tags (React, Front-end, Acessibilidade, Node, TypeScript…), ~10–12 posts variados — **alguns sem `thumbnailUrl`** (demonstra placeholder) e alguns com URL —, comentários com 1 nível de resposta e alguns likes. `code` com snippets reais. Adicionar script `"seed": "ts-node -r tsconfig-paths/register src/database/seed.ts"` (alinhar ao runner usado em `typeorm`).

### DTOs / validação
`CreatePostDto` (`title`, `description`, `code?`, `tags?`) e `CreateCommentDto` (`content`, `parentId?`) com `class-validator` + `@ApiProperty` (padrão dos DTOs de auth). Mapas de resposta retornam shape enxuto: `{ id, title, description, code, thumbnailUrl, tags, author:{id,name,handle}, counts:{likes,comments}, likedByMe, createdAt }`.

---

## Frontend — `apps/web`

### Tokens & fontes (`src/index.css`, `index.html`)
- Atualizar `@theme` para os valores CodeConnect: `--color-bg:#00090E`, `--color-surface:#171D1F`, `--color-accent:#81FE88` (+`accent-hover`), e novos tokens semânticos necessários (ex.: `--color-surface-comment:#888888`, `--color-text-code:#BCBCBC`, `--color-text-muted:#888888`, `--color-text-on-surface:#171D1F`). Reusar nomes existentes onde possível para não quebrar login/cadastro.
- `--font-sans: 'Prompt', system-ui…`; adicionar `--font-mono: 'Roboto Mono', monospace`. Importar Prompt + Roboto Mono + Material Icons (link no `index.html`). **Sem hex literais no JSX** (regra do CLAUDE.md) — usar tokens; ícones via classe `material-icons`.

### Imagens
`thumbnailUrl` vem como `/uploads/...`. Helper `assetUrl(path)` deriva a origem da API a partir de `VITE_API_URL` (remove `/v1`). Reusar `api`/axios existentes.

### Services (`src/services/`)
- `post.service.ts`: `getPosts(params)`, `getPost(id)`, `createPost(formData)`, `likePost(id)`, `unlikePost(id)`, `createComment(id, payload)`, `getTags()`. Reusa o `api` (interceptor de token já anexa Bearer).
- `useAuth.ts` (hook leve): lê `getToken()`, busca `getMe()` quando há token, expõe `{ user, isAuthenticated, logout }`. `logout` = `clearToken()` + navigate. Usado pela Sidebar para alternar **Login/Sair** e para “gatear” ações.

### Layout compartilhado (atende “use layouts para reaproveitar”)
- **`templates/AppTemplate.tsx`** — sidebar fixa + slot de conteúdo. Usado por Feed, Detalhe e Publicar.
- **`organisms/Sidebar.tsx`** — logo, botão **Publicar** (link; se deslogado → `/login`), nav (Feed/Perfil/Sobre nós) e item inferior que alterna **Login ↔ Sair** conforme `useAuth`.

### Componentes (Atomic Design, cada um com teste co-localizado)
**Atoms**: `Avatar` (img ou iniciais), `Tag` (pill; variante filtro com `close`), `MaterialIcon` (span de ícone), `PostThumbnail` (img com `onError`→placeholder; sem `thumbnailUrl`→bloco com gradiente + glyph/título — **solução de placeholder**).
**Molecules**: `SearchBox` (busca full-text), `PostStat` (ícone+contador: like/share/comment), `NavItem` (item sidebar c/ estado ativo), `SortTabs` (Recentes…), `FilterChips` (tags + “Limpar tudo”), `CommentItem` (avatar + @user + texto + Responder + toggle de respostas).
**Organisms**: `PostCard` (card do feed), `PostList` (grid 2 col), `PostDetailCard` (card grande — reaproveita subpartes do `PostCard`), `CodeBlock` (“Código:” em Roboto Mono), `CommentsSection` (lista + respostas + form; form só logado, senão “Entre para comentar”), `CreatePostForm` (Novo projeto: Nome, Descrição, Carregar imagem, Tags, Descartar/Publicar — validação manual no padrão de `LoginForm`/`RegisterForm`).

### Gating de ações (regra logado vs. não logado)
Like e comentar checam `isAuthenticated`. Não logado: botão de like e form de comentário redirecionam para `/login` (ou exibem aviso inline “Faça login para curtir/comentar”). Feed e detalhe permanecem **públicos**.

### Páginas & rotas (`src/App.tsx`)
- `pages/FeedPage.tsx` → **`/feed`** (público): busca + filtros + tabs + `PostList`. Estado de `search`/`tags`/`sort` dispara `getPosts`.
- `pages/PostDetailPage.tsx` → **`/posts/:id`** (público): `PostDetailCard` + `CodeBlock` + `CommentsSection`.
- `pages/PublicarPage.tsx` → **`/publicar`** (protegido via `ProtectedRoute` existente): `CreatePostForm` → `createPost` → navega ao detalhe.
- Redirect `"/"` → `/feed`. Mantém `/login`, `/cadastro`.

---

## Arquivos críticos
- Back: `apps/api/src/posts/**` (novo), `apps/api/src/auth/guards/optional-jwt-auth.guard.ts` (novo), `apps/api/src/database/migrations/<ts>-CreatePosts.ts` (novo), `apps/api/src/database/seed.ts` (novo), editar `apps/api/src/app.module.ts`, `apps/api/src/database/data-source.ts`, `apps/api/src/main.ts`, `apps/api/package.json`.
- Front: `apps/web/src/index.css`, `apps/web/index.html`, `apps/web/src/App.tsx`, `apps/web/src/services/post.service.ts` + `useAuth.ts` (novos), `apps/web/src/components/{atoms,molecules,organisms,templates,pages}/**` (novos, padrões reusados de `Button`, `Input`, `FormField`, `AuthTemplate`).

## Reuso
`api`/interceptors (`services/api.ts`), `token-storage.ts`, `extractApiError`, `ProtectedRoute`, atoms `Button`/`Input`/`Label`/`FormField`; no back, `JwtAuthGuard`/`@CurrentUser()`/`JwtStrategy`, padrões de DTO e de migration.

---

## Verificação
1. `pnpm db:up`; subir API (`pnpm dev:api`) — migrations rodam no boot (`migrationsRun`).
2. `cd apps/api && pnpm seed` — popula posts (com e sem thumbnail), comentários e likes.
3. `pnpm dev:web` + `pnpm dev:api`. Manual:
   - `/feed` carrega como **deslogado**; busca filtra (full-text); posts sem thumbnail mostram **placeholder**; like/comentar redirecionam a login.
   - Login → curtir, comentar (com resposta) e criar post (com upload de imagem) funcionam; thumbnail enviado aparece via `/uploads`.
   - Sidebar alterna **Login ↔ Sair**; `/publicar` bloqueia deslogado.
   - Detalhe (`/posts/:id`) reusa o mesmo layout/sidebar do feed.
4. Testes: `pnpm test:web` e `pnpm test:api` (componentes co-localizados; service/e2e de posts cobrindo search, like, comentário e optional-auth).