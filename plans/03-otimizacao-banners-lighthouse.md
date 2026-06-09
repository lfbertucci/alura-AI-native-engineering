# Correção de performance (Lighthouse) da página /cadastro + troca do banner de login

## Contexto

O Lighthouse rodado contra `http://localhost:5173/cadastro` apontou **LCP de 3.0s (score 0.33)** — a pior métrica do relatório. As demais (CLS 0, TBT 0, FCP 1.1s) estão boas.

A causa raiz é o elemento de LCP da página: o banner. O peso total da página é **~3.1 MB**, dominado por `apps/web/public/banner-cadastro.png` = **1.41 MB**, exibido em apenas ~345px de largura no desktop (`md:w-[45%]` de um card `max-w-3xl`) e `h-48` no mobile. É uma imagem **massivamente superdimensionada e sem compressão**. O `<img>` em `apps/web/src/components/templates/AuthTemplate.tsx` (linhas 15–19) também não tem `width`/`height`, `fetchpriority` nem formato moderno.

> ⚠️ **Caveat de medição:** o Lighthouse rodou contra o **dev server** do Vite (`localhost:5173`), não contra um build de produção. Boa parte dos 3.1 MB e dos 26 scripts é overhead de dev (`@vite/client` 210KB, módulos não-bundlados) que desaparece no `vite build`. O peso da imagem, porém, é real em dev **e** produção — é o que vale corrigir. A re-medição deve ser feita contra o build de produção.

Pedido adicional do usuário: **antes** de otimizar, baixar o banner do protótipo Figma e usá-lo para **substituir o banner de login** atual. Depois, otimizar os **dois** banners (login + cadastro).

## Banner do Figma a baixar

- Arquivo: `Yqq4GSu46jsaMfNLtQfDdm`, node do banner: **`155:3804`** ("Group 2087", 407×628) — frame que compõe a foto + o logo "code connect" sobreposto na base.
- É a imagem da mulher de óculos diante de telas de código verde (o mesmo tema descrito no `bannerAlt` do cadastro).

## Abordagem recomendada

Re-encode manual para **WebP** redimensionado (sem novas dependências de runtime; conversão via `npx --yes sharp-cli`). Aplicar aos dois banners.

### Passos

1. **Baixar o novo banner de login do Figma**
   - `get_screenshot` no node `155:3804` com `maxDimension` ~1256 (≈2× a altura de 628px, para nitidez em telas retina), salvando o PNG composto (foto + logo) em um arquivo temporário.

2. **Otimizar os dois banners para WebP** (`npx --yes sharp-cli`)
   - Tamanho de exibição real ≈ 345×636 no desktop; com DPR 2× → redimensionar para **~700px de largura** (altura proporcional), qualidade **~80**.
   - Gerar:
     - `apps/web/public/banner-login.webp` ← novo banner do Figma
     - `apps/web/public/banner-cadastro.webp` ← a partir do `banner-cadastro.png` existente (1.41 MB)
   - Meta: cada banner abaixo de ~100 KB (redução de ~90%+).
   - Remover os `.png` antigos (`banner-login.png`, `banner-cadastro.png`) após confirmar os `.webp`.

3. **Atualizar referências de código**
   - `apps/web/src/components/templates/AuthTemplate.tsx` (linhas 15–19): no `<img>` do banner, adicionar:
     - `width={700}` e `height={1224}` (ou proporção real do asset gerado) para reservar espaço e evitar CLS;
     - `fetchPriority="high"` (é o elemento de LCP) e `decoding="async"`;
     - manter as classes Tailwind `object-cover` existentes.
   - `apps/web/src/components/pages/LoginPage.tsx` (linha 7): `bannerSrc="/banner-login.webp"`.
   - `apps/web/src/components/pages/CadastroPage.tsx` (linha 7): `bannerSrc="/banner-cadastro.webp"`.

4. **Tests** — `apps/web/src/components/templates/AuthTemplate.test.tsx` passa `bannerSrc` como prop literal e o jsdom não carrega imagens, então não dependem do arquivo físico. Atualizar as strings `"/banner-login.png"` → `"/banner-login.webp"` apenas por consistência (opcional, não funcional).

## Arquivos afetados

- `apps/web/public/banner-login.webp` (novo, vindo do Figma) — substitui `banner-login.png`
- `apps/web/public/banner-cadastro.webp` (novo, otimizado) — substitui `banner-cadastro.png`
- `apps/web/src/components/templates/AuthTemplate.tsx`
- `apps/web/src/components/pages/LoginPage.tsx`
- `apps/web/src/components/pages/CadastroPage.tsx`
- `apps/web/src/components/templates/AuthTemplate.test.tsx` (opcional)

## Verificação

1. Conferir o peso dos novos `.webp` (`ls -la apps/web/public/`) — devem estar < ~100 KB cada.
2. `pnpm test:web` — testes do AuthTemplate/páginas continuam verdes (inclui o teste de acessibilidade axe).
3. `pnpm lint:web` — sem novos erros.
4. `pnpm build:web && pnpm --filter web preview` e abrir `/login` e `/cadastro`: confirmar que os banners aparecem corretos (login = imagem code-connect com logo) e nítidos.
5. **Re-rodar o Lighthouse contra o build de produção (`preview`)**, não o dev server — esperar LCP cair para a faixa boa (< 2.5s / score ≥ 0.9) com o peso da imagem reduzido em ~90%.