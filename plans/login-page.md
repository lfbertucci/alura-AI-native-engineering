# Login Page — Code Connect

## Context

O app `apps/web` é atualmente um scaffold novo de Vite + React 19 (a demo padrão do Vite em `App.tsx`). Precisamos construir a **página de Login** mostrada no mockup: um card escuro centralizado com o banner verde "code connect" à esquerda e o formulário de login à direita (email/usuário, senha, lembrar-me + esqueci a senha, botão Login verde, login social via GitHub/Gmail e um convite "Crie seu cadastro!").

O CLAUDE.md exige **estilização apenas com Tailwind**, estrutura em **Atomic Design** e um **teste co-localizado para cada componente** — nenhuma dessas ferramentas (Tailwind, Vitest, router) está instalada ainda, então parte do trabalho é estabelecer essa base.

A futura página de **cadastro** vai reutilizar o mesmo layout base com um *banner diferente* e *campos de formulário diferentes*. Não vamos construir o cadastro agora, mas a estrutura deve tornar esse reuso trivial.

### Decisões (confirmadas com o usuário)
- **Testes:** instalar Vitest + React Testing Library + jsdom; escrever testes co-localizados por componente.
- **Roteamento:** instalar `react-router-dom`; adicionar `/login` + uma rota placeholder `/cadastro`.
- **Submit:** validação client-side (campos obrigatórios, formato básico de email) e então um `onSubmit` **stub** (sem rede — backend ainda não tem auth).

## Setup de ferramentas

### Tailwind v4 (plugin Vite)
- Adicionar deps em [apps/web/package.json](apps/web/package.json): `tailwindcss`, `@tailwindcss/vite`.
- Registrar o plugin em [apps/web/vite.config.ts](apps/web/vite.config.ts) junto com `react()`.
- Substituir o uso de [apps/web/src/index.css](apps/web/src/index.css) e [apps/web/src/App.css](apps/web/src/App.css): `index.css` passa a ser `@import "tailwindcss";` mais um bloco `@theme` definindo os tokens de design (bg escuro, surface do card, surface do input, verde accent brilhante, cores de texto). Remover as variáveis CSS da demo antiga. Remover o import de `App.css`.

### Vitest + RTL
- Adicionar dev deps: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`.
- Adicionar `"test": "vitest run"` (e opcionalmente `"test:watch": "vitest"`) em [apps/web/package.json](apps/web/package.json) para o script raiz `test:web` funcionar.
- Configurar o ambiente de teste em `vite.config.ts` (`test: { environment: 'jsdom', globals: true, setupFiles }`) — adicionar a referência de tipos do Vitest. Criar `src/test/setup.ts` importando `@testing-library/jest-dom`.

### Roteamento
- Adicionar `react-router-dom`. Reescrever [apps/web/src/App.tsx](apps/web/src/App.tsx) para um `BrowserRouter` com rotas: `/login` → `LoginPage`, `/cadastro` → placeholder simples, `/` → redirect para `/login`. Remover a marcação/assets da demo do Vite.

## Estrutura de componentes (Atomic Design)

Tudo em `apps/web/src/components/`. Cada `.tsx` recebe um `.test.tsx` co-localizado. Estilização apenas com classes utilitárias do Tailwind.

### atoms/
- **Button** — `variant="primary"` (verde brilhante, largura total), suporta `type`, `disabled`, ícone opcional ao final (o `→`). Usado no submit do Login.
- **Input** — input de texto/senha estilizado; encaminha `type`, `value`, `onChange`, `placeholder`, `name`, `id`, `aria-invalid`.
- **Label** — `htmlFor` + children.
- **Checkbox** — checkbox controlado com label ("Lembrar-me"); check verde.
- **TextLink** — wrapper de âncora/`Link` estilizado (Esqueci a senha, Crie seu cadastro). Aceita `to` (router) ou `href`.
- **SocialButton** — botão baseado em imagem (`src`, `alt`, `label`) renderizando o logo GitHub/Gmail de `/public` com legenda embaixo; `onClick` stub.

### molecules/
- **FormField** — compõe `Label` + `Input` + texto de erro opcional (`role="alert"`). Props: `id`, `label`, `type`, `value`, `onChange`, `error`. É a unidade de reuso para os campos de login e cadastro.
- **Divider** — linha horizontal com texto centralizado ("ou entre com outras contas").
- **SocialLogins** — linha de `SocialButton`s (GitHub + Gmail) abaixo do divider.

### organisms/
- **LoginForm** — dono do estado do formulário + validação. Renderiza dois `FormField`s (Email ou usuário, Senha), uma linha com `Checkbox` ("Lembrar-me") e `TextLink` ("Esqueci a senha"), o `Button` primário, `Divider`, `SocialLogins` e o convite "Ainda não tem conta? / Crie seu cadastro!". No submit: validar campos obrigatórios + email/usuário não-vazio + tamanho da senha, setar erros por campo e chamar um `onSubmit({ identifier, password, remember })` stub.

### templates/
- **AuthTemplate** — o layout base reutilizável. Props: `bannerSrc`, `bannerAlt`, `children` (o slot do formulário) e `title` + `subtitle` opcional. Renderiza o fundo escuro full-screen, o card arredondado centralizado, a imagem do banner à esquerda (escondida/empilhada em telas pequenas) e a coluna direita com title/subtitle + `children`. **É o que o cadastro vai reutilizar** com um banner diferente + um formulário diferente passado como children.

### pages/
- **LoginPage** — renderiza `AuthTemplate` com `bannerSrc="/banner-login.png"`, `title="Login"`, `subtitle="Boas-vindas! Faça seu login."` e `<LoginForm />` como children.

## Assets
Usar os assets existentes em `public/` diretamente via caminhos relativos à raiz (já em `apps/web/public/`):
- `/banner-login.png` — banner à esquerda.
- `/github.png`, `/gmail.png` — logos sociais.

## Tokens de design (do mockup)
Definir no bloco `@theme`; valores aproximados:
- `--color-bg`: quase-preto `#0a0c10` (fundo da página).
- `--color-surface`: card `#1d2027`.
- `--color-input`: cinza do input preenchido `#6b6f76`.
- `--color-accent`: verde menta brilhante `#7ef09e` (botão, links, checkbox).
- `--color-text` / `--color-text-muted`: branco / cinza para títulos e corpo.
Card com cantos arredondados + sombra sutil; layout responsivo (banner empilha acima do form abaixo de ~`md`).

## Testes (co-localizados, por componente)
Cada teste cobre: renderiza corretamente, interação principal e variações de props relevantes. Casos representativos:
- **Button**: renderiza label, dispara `onClick`, respeita `disabled`.
- **Input/Checkbox**: value/checked controlado reflete props, handler de change dispara.
- **FormField**: mostra label, renderiza texto de erro com `role="alert"` quando `error` setado.
- **SocialButton / SocialLogins**: renderiza logos com `alt` correto, click dispara.
- **LoginForm**: mostra erros de validação em submit vazio; chama `onSubmit` com os valores quando válido.
- **AuthTemplate**: renderiza banner (`alt`), title/subtitle e o slot children.
- **LoginPage**: renderiza form + banner de login.

## Verificação
1. `pnpm install` (raiz) para puxar as novas deps.
2. `pnpm run dev:web` → acessar `/` (redireciona para `/login`); confirmar que a página bate com o mockup: banner à esquerda, form à direita, botão verde, logos sociais, link de cadastro. Verificar empilhamento responsivo em larguras estreitas.
3. `pnpm run test:web` → todos os testes co-localizados passam.
4. `pnpm run lint:web` e `pnpm run build:web` → sem erros (TS strict + ESLint limpo).