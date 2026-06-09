# Plano: Página de Cadastro (CodeConnect)

## Context

Já existe uma página de Login totalmente componentizada (Atomic Design + Tailwind) em
[LoginPage.tsx](apps/web/src/components/pages/LoginPage.tsx) /
[LoginForm.tsx](apps/web/src/components/organisms/LoginForm.tsx). A rota `/cadastro` já
está registrada em [App.tsx](apps/web/src/App.tsx) apontando para um placeholder
temporário (`CadastroPlaceholder`), e o LoginForm já tem um link "Crie seu cadastro!"
apontando para `/cadastro`.

O objetivo é implementar a **página de Cadastro** seguindo o
[Figma (node 155:3469)](https://www.figma.com/design/Yqq4GSu46jsaMfNLtQfDdm/CodeConnect?node-id=155-3469),
**reaproveitando ao máximo** os componentes já criados. O Cadastro é estruturalmente
um irmão do Login — mesma `AuthTemplate`, mesmos átomos/moléculas — mudando apenas os
campos do formulário, os textos e a imagem de banner.

## Layout do Figma (referência)

- Título: **Cadastro** · Subtítulo: **Olá! Preencha seus dados.**
- Campos (de cima p/ baixo):
  - **Nome** — placeholder `Nome completo`
  - **Email** — placeholder `Digite seu email`
  - **Senha** — placeholder `******` (input password)
- Checkbox **Lembrar-me** (sozinho, à esquerda — sem link "Esqueci a senha")
- Botão **Cadastrar →**
- Divider **ou entre com outras contas**
- Social logins **Github** / **Gmail**
- Rodapé: **Já tem conta? Faça seu login!** → link para `/login`

Tokens já existem como CSS vars no projeto (`--color-accent` = verde destaque, etc.),
então **nenhum valor hardcoded** do Figma é necessário.

## Reuso (sem alterações)

Todos reutilizados como estão:
- [AuthTemplate.tsx](apps/web/src/components/templates/AuthTemplate.tsx) — banner + título + subtítulo + slot
- [FormField.tsx](apps/web/src/components/molecules/FormField.tsx) — label + input + erro
- [Checkbox.tsx](apps/web/src/components/atoms/Checkbox.tsx)
- [Button.tsx](apps/web/src/components/atoms/Button.tsx)
- [Divider.tsx](apps/web/src/components/molecules/Divider.tsx)
- [SocialLogins.tsx](apps/web/src/components/molecules/SocialLogins.tsx)
- [TextLink.tsx](apps/web/src/components/atoms/TextLink.tsx)

## Alterações

### 1. Banner — baixar asset do Figma
Baixar o asset de imagem do banner (`imgRectangle1726` do `get_design_context`) e salvar
em `apps/web/public/banner-cadastro.png`. Será baixado via `curl` da URL do asset Figma
(válida por 7 dias). Alt text: algo como `Mulher de óculos observando telas de código verde`.

### 2. Novo organism: `RegisterForm.tsx`
`apps/web/src/components/organisms/RegisterForm.tsx` — espelhar o padrão do `LoginForm`:
- State: `name`, `email`, `password`, `remember` + `errors`.
- `validate()`: `name` obrigatório; `email` obrigatório + formato válido (regex simples);
  `password` obrigatório + mínimo 6 caracteres (mesma regra do LoginForm).
- Três `FormField` (Nome / Email / Senha) com `autoComplete` apropriados
  (`name`, `email`, `new-password`).
- `Checkbox` "Lembrar-me" sozinho (sem o `flex justify-between` do login, pois não há
  "Esqueci a senha" no Figma).
- `Button` "Cadastrar →" (`type="submit"`).
- `Divider` "ou entre com outras contas" + `SocialLogins`.
- Rodapé: `Já tem conta? <TextLink to="/login">Faça seu login! →</TextLink>`.
- Props: `onSubmit?(values)`, `onGithubClick?`, `onGmailClick?` (mesma assinatura do LoginForm).

### 3. Nova page: `CadastroPage.tsx`
`apps/web/src/components/pages/CadastroPage.tsx` — espelhar `LoginPage`:
```tsx
<AuthTemplate
  bannerSrc="/banner-cadastro.png"
  bannerAlt="Mulher de óculos observando telas de código verde"
  title="Cadastro"
  subtitle="Olá! Preencha seus dados."
>
  <RegisterForm onSubmit={() => console.log('TODO: connect auth API')} />
</AuthTemplate>
```

### 4. Rota em `App.tsx`
Em [App.tsx](apps/web/src/App.tsx): remover `CadastroPlaceholder` e apontar a rota
`/cadastro` para `<CadastroPage />` (importar do novo arquivo).

### 5. Testes co-localizados (obrigatório pelo CLAUDE.md)
- `RegisterForm.test.tsx` — espelhar [LoginForm.test.tsx](apps/web/src/components/organisms/LoginForm.test.tsx):
  renderiza os 3 campos + checkbox + botão; erros de validação em submit vazio;
  erro de email inválido; erro de senha curta; `onSubmit` chamado com `{ name, email, password, remember }` quando válido.
- `CadastroPage.test.tsx` — espelhar [LoginPage.test.tsx](apps/web/src/components/pages/LoginPage.test.tsx):
  renderiza banner (alt), heading "Cadastro", subtítulo, e os campos do form.

## Verificação

1. `pnpm run test:web` — todos os testes (novos + existentes) passam.
2. `pnpm run lint:web` — sem erros.
3. `pnpm run dev:web` e abrir `/cadastro`: conferir visualmente contra o screenshot do
   Figma (campos Nome/Email/Senha, checkbox, botão Cadastrar, social logins, link de login)
   e validar o fluxo de erros + submit. Confirmar que o link "Faça seu login!" navega para
   `/login` e que "Crie seu cadastro!" no Login navega de volta para `/cadastro`.
