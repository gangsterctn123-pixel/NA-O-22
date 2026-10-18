# NAÇÃO 22

> **Informação, Liberdade e Comunidade.**
> Plataforma digital independente de notícias políticas, análises e comunidade.
> Não possui vínculo oficial com partidos, candidatos ou organizações políticas.

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · componentes no padrão shadcn/ui · Lucide ·
Supabase (Auth, Postgres, Storage, Realtime) · Stripe · Vercel.

Arquitetura, modelagem do banco e plano de fases: **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

## Status

| Fase | Escopo | Status |
|---|---|---|
| 1 | Arquitetura, identidade visual, landing page | ✅ |
| 2 | Autenticação, banco, perfis | ⏳ próxima |
| 3–8 | Feed, briefing/radar/IA, comunidade, biblioteca, assinaturas, notificações/PWA | planejadas |

## Requisitos

- Node.js 22+ e npm 10+
- (Fase 2+) [Supabase CLI](https://supabase.com/docs/guides/cli) e Docker para banco local
- (Fase 7+) [Stripe CLI](https://docs.stripe.com/stripe-cli) para testar webhooks

## Instalação

```bash
npm install
cp .env.example .env.local   # na Fase 1 nada é obrigatório
npm run dev                  # http://localhost:3000
```

### Banco de dados (Supabase)

```bash
supabase init                 # só na primeira vez, se não houver supabase/config.toml
supabase start
supabase db reset             # aplica supabase/migrations/* e supabase/seed.sql
npm run db:types              # gera src/types/database.ts
```

Para promover um administrador (nunca pela interface):

```sql
update public.profiles set role = 'admin' where id = '<uuid-do-usuario>';
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` / `npm start` | build e servidor de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | checagem de tipos |
| `npm test` | testes unitários (Vitest) |
| `npm run test:e2e` | testes ponta a ponta (Playwright, desktop + mobile) |

Se o Chromium já estiver instalado em outro caminho: `PLAYWRIGHT_CHROMIUM_PATH=/caminho/chrome npm run test:e2e`.

## Modo demonstração

`NEXT_PUBLIC_DEMO_MODE=true` (padrão em desenvolvimento):

- exibe avisos de que nenhuma cobrança real será feita;
- (Fase 7) checkout simulado, gravando assinaturas com `is_demo = true` por rota de servidor;
- todo conteúdo de exemplo aparece com o selo **"Exemplo demonstrativo"** (`<DemoBadge />`). Nenhum exemplo
  imita uma notícia real: títulos, pessoas, números de projetos e datas são genéricos.

## Deploy (GitHub → Vercel)

1. Suba o repositório para o GitHub.
2. Na Vercel: **Add New → Project → Import** o repositório (Next.js é detectado sozinho).
3. Cadastre as variáveis de `.env.example` em *Settings → Environment Variables*
   (as secretas nunca com prefixo `NEXT_PUBLIC_`).
4. Cada push em `main` gera deploy de produção; cada PR gera um preview.
   O workflow `.github/workflows/ci.yml` roda lint, tipos, Vitest e Playwright.

## Segurança e LGPD

- Nenhuma credencial é versionada; `.env*.local` está no `.gitignore`.
- RLS habilitado em todas as tabelas; o status da assinatura só é gravado pelo webhook da Stripe (service role).
- Cabeçalhos de segurança em `next.config.ts`.
- Os textos de `/termos` e `/privacidade` são **minutas** e precisam de revisão jurídica.
