# Correções Lighthouse `/cadastro` — Acessibilidade + SEO

## Contexto

O Lighthouse foi rodado contra o **build de produção** (`localhost:4173`, Vite `preview`) da página `/cadastro`. O objetivo é corrigir o que ele apontou.

Primeiro, a boa notícia: **performance e best-practices já estão em 100** (score 1.0). A otimização de banner do plano `03` funcionou — o LCP caiu de 3.0s para **0.4s** e todas as métricas (FCP, LCP, TBT, CLS, SI) pontuam 1. Os audits de segurança de best-practices que aparecem (CSP, HSTS, COOP, clickjacking, trusted-types) são **informativos com peso 0** — não afetam o score e não fazem sentido perseguir num SPA servido em localhost.

O que **realmente baixou as notas** são 4 audits, em duas categorias:

| Categoria | Score | Audit que falhou | Peso |
|---|---|---|---|
| Accessibility | **0.90** | `color-contrast` | 7 |
| | | `landmark-one-main` | 3 |
| SEO | **0.83** | `meta-description` | 1 |
| | | `robots-txt` (14 erros) | 1 |

Todos os arquivos afetados são **compartilhados entre `/login` e `/cadastro`** (index.html, AuthTemplate, Divider) — então estas correções consertam as duas páginas de uma vez.

## Correções

### 1. Contraste de cor — `color-contrast` (a11y, peso 7)

O Lighthouse aponta o `<span>` "ou entre com outras contas" (label do `Divider`): cor `--color-text-subtle` (`#6b7280`) sobre `--color-surface` (`#1c1f26`) = **3.41:1**, abaixo do mínimo WCAG AA de 4.5:1 para texto pequeno.

**Correção:** em [Divider.tsx:10](../apps/web/src/components/molecules/Divider.tsx#L10) trocar `text-text-subtle` → `text-text-muted`. O token `--color-text-muted` (`#9ca3af`) dá ~6.97:1 sobre surface (já é usado nos labels "Github"/"Gmail" e no parágrafo "Já tem conta?", que **passaram** no audit).

- `--color-text-subtle` também é usado em [Input.tsx:10](../apps/web/src/components/atoms/Input.tsx#L10) como `placeholder:text-text-subtle` — **não mexer**: placeholders não são avaliados pela regra de contraste e o Lighthouse não os sinalizou. Por isso a correção é local no Divider, não no token global (que mudaria o visual dos placeholders).

### 2. Landmark `<main>` — `landmark-one-main` (a11y, peso 3)

O documento não tem nenhum landmark `<main>`. **Correção:** em [AuthTemplate.tsx:13](../apps/web/src/components/templates/AuthTemplate.tsx#L13) trocar o `<div>` raiz (`className="min-h-screen ..."`) por `<main>`. Isso dá exatamente um landmark main à tela, sem alterar layout (as classes Tailwind continuam idênticas).

### 3. Meta description — `meta-description` (SEO, peso 1)

Não há `<meta name="description">`. **Correção:** adicionar em [index.html](../apps/web/index.html), dentro do `<head>`:
```html
<meta name="description" content="Crie sua conta ou faça login na plataforma." />
```

### 4. robots.txt — `robots-txt` (SEO, peso 1, "14 errors found")

Não existe `apps/web/public/robots.txt`, então o servidor SPA devolve o `index.html` para `/robots.txt` — o Lighthouse tenta parsear HTML como robots.txt e gera 14 erros de sintaxe. **Correção:** criar `apps/web/public/robots.txt`:
```
User-agent: *
Allow: /
```

### 5. (Opcional, não pontuado mas correto)

Não baixam nota, mas são consertos triviais e corretos enquanto edito o `index.html`:
- `<title>web</title>` → algo descritivo (ex.: `Carreira Native AI`). O audit `document-title` já passa, mas o título é um placeholder.
- `<html lang="en">` → `<html lang="pt-BR">`: o conteúdo é todo em português. `html-has-lang`/`html-lang-valid` passam com qualquer valor válido, mas `pt-BR` é o correto.

## Arquivos afetados

- [apps/web/index.html](../apps/web/index.html) — meta description, title, lang
- `apps/web/public/robots.txt` — **novo**
- [apps/web/src/components/molecules/Divider.tsx](../apps/web/src/components/molecules/Divider.tsx) — `text-subtle` → `text-muted`
- [apps/web/src/components/templates/AuthTemplate.tsx](../apps/web/src/components/templates/AuthTemplate.tsx) — `<div>` raiz → `<main>`

## Verificação

1. `pnpm test:web` — os testes do AuthTemplate/Divider continuam verdes. Nota: o teste axe de [AuthTemplate.test.tsx](../apps/web/src/components/templates/AuthTemplate.test.tsx) **não** pega o `color-contrast` (a regra é desativada no jsdom por falta de layout/canvas), por isso a falha só aparece no Lighthouse real. Vale adicionar uma asserção de que existe um `role="main"` no container renderizado.
2. `pnpm lint:web` — sem novos erros.
3. `pnpm build:web && pnpm --filter web preview` e abrir `/login` e `/cadastro`: confirmar que o label do divisor ficou mais claro e o layout não mudou.
4. **Re-rodar o Lighthouse contra o `preview` (`localhost:4173`)**, não o dev server. Esperado:
   - Accessibility: 0.90 → **1.0** (color-contrast + landmark resolvidos)
   - SEO: 0.83 → **1.0** (meta-description + robots.txt resolvidos)
   - Performance e Best Practices: permanecem **1.0**