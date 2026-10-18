# NAÇÃO 22 — Arquitetura

> "Informação, Liberdade e Comunidade."
> Plataforma independente. Não possui vínculo oficial com partidos, candidatos ou organizações políticas.

## 1. Visão de alto nível

```
                ┌──────────────────────────── Vercel ────────────────────────────┐
 Navegador/PWA  │  Next.js (App Router)                                          │
 ─────────────► │  • RSC + Server Actions (leitura/escrita com sessão do usuário) │
  service worker│  • Route Handlers  /api/*  (webhooks Stripe, IA, push, cron)    │
                │  • proxy.ts (sessão Supabase, proteção de /app e /admin)        │
                └───────┬───────────────┬──────────────────┬──────────────────────┘
                        │               │                  │
            Supabase    ▼               ▼                  ▼
        ┌────────────────────┐   ┌────────────┐    ┌────────────────┐
        │ Auth · Postgres+RLS│   │  Stripe    │    │ Provedor de IA │
        │ Storage · Realtime │   │ (checkout, │    │ (resumos,      │
        └────────────────────┘   │  webhooks) │    │  "Entenda...") │
                                 └────────────┘    └────────────────┘
        Vercel Cron ──► /api/cron/ingest ──► fontes RSS/APIs públicas (Agência Câmara,
                                             Agência Senado, Dados Abertos etc.)
```

Princípios:

1. **O banco é a fonte da verdade de permissões.** Toda tabela tem RLS. A UI apenas reflete.
2. **Acesso premium só via webhook do Stripe** (assinado e idempotente) → `subscriptions`. O cliente nunca escreve status de assinatura.
3. **IA nunca publica sozinha.** O pipeline grava em `articles.status = 'review'`; só um administrador muda para `published`/`scheduled`.
4. **Nada inventado.** Todo conteúdo factual exige ao menos uma fonte (`article_sources`), radar exige `official_url` quando disponível, e dados de exemplo carregam `is_demo = true` + selo visual "Demonstrativo".
5. **Fato × análise × opinião** são um campo obrigatório (`content_type`) e aparecem como selo no card.

## 2. Níveis de acesso

| Nível | Como é determinado | Acesso |
|---|---|---|
| Visitante | sem sessão | landing, prévias públicas, termos |
| Membro | `profiles.role = 'member'` | feed básico, perfil, notificações; premium se `has_active_subscription()` |
| Assinante | membro + assinatura `active`/`trialing` | feed completo, briefings exclusivos, comunidade, biblioteca premium, IA |
| Administrador | `profiles.role = 'admin'` (definido só via SQL/service role) | `/admin` completo |

## 3. Estrutura de pastas

```
nacao22/
├─ docs/                      # arquitetura, decisões, LGPD
├─ public/                    # ícones, sw.js, offline.html
├─ supabase/
│  ├─ migrations/             # SQL versionado (schema, RLS, índices, storage)
│  └─ seed.sql                # categorias, salas, configurações (sem notícias falsas)
├─ src/
│  ├─ app/
│  │  ├─ (marketing)/         # landing, termos, privacidade, suporte   ← Fase 1
│  │  ├─ (auth)/              # entrar, cadastro, recuperar senha       ← Fase 2
│  │  ├─ (app)/               # área logada com bottom-nav / sidebar
│  │  │  ├─ inicio/           # dashboard + "Seu Resumo do Dia"
│  │  │  ├─ noticias/         # feed, [slug]
│  │  │  ├─ radar/
│  │  │  ├─ comunidade/       # [sala]/[post]
│  │  │  ├─ biblioteca/       # + especiais
│  │  │  ├─ notificacoes/
│  │  │  ├─ assinatura/
│  │  │  └─ perfil/           # configurações, exclusão de conta
│  │  ├─ admin/               # dashboard, editorial, comunidade, financeiro, config
│  │  ├─ api/                 # stripe/webhook, ai/explain, cron/ingest, push
│  │  ├─ manifest.ts          # PWA
│  │  └─ layout.tsx
│  ├─ components/
│  │  ├─ ui/                  # primitivos estilo shadcn/ui
│  │  ├─ brand/               # logo, símbolo
│  │  ├─ landing/             # seções da landing
│  │  └─ layout/              # header, footer, nav, theme
│  ├─ features/               # módulos de domínio (news, radar, community, ...)
│  │  └─ <modulo>/{actions,queries,schemas,components}.ts(x)
│  ├─ lib/
│  │  ├─ supabase/            # clients browser/server/admin
│  │  ├─ stripe/  ai/  rate-limit/  logger/
│  │  ├─ config/              # site, env validado com zod
│  │  └─ utils.ts
│  └─ types/database.ts       # gerado por `supabase gen types`
└─ tests/{unit,e2e}
```

Cada módulo em `features/` expõe **schemas zod** (validação compartilhada client/server), **queries** (leitura RSC), **actions** (Server Actions com checagem de sessão + rate limit) e **componentes**.

## 4. Modelagem do banco

Arquivo completo: [`supabase/migrations/20261018000000_initial_schema.sql`](../supabase/migrations/20261018000000_initial_schema.sql).

```
auth.users 1─1 profiles ─┬─ subscriptions ── payments
                         ├─ notification_preferences, push_subscriptions, notifications
                         ├─ saved_articles ─┐
                         ├─ follows (radar_item | category | article)
                         ├─ posts ── comments (parent_id → respostas)
                         │    └─ post_likes / comment_likes
                         ├─ reports, user_blocks, moderation_actions
                         └─ purchases ── library_items

sources ── ingested_items ──(pipeline IA)──► articles ─┬─ article_sources
                                                      ├─ ai_explanations (cache "Entenda a Notícia")
categories ──────────────────────────────────────────┘
briefings ── briefing_items (1..5) ──► articles
radar_items ── radar_events (histórico)
rooms ── posts
app_settings (preço, flags) · audit_logs · stripe_events (idempotência) · ai_requests (rate limit)
```

Destaques:

- `profiles.role` não é atualizável pelo usuário (privilégio de coluna + RLS).
- Funções `is_admin()`, `has_active_subscription(uid)` e `is_suspended(uid)` são `security definer` e usadas nas políticas.
- Busca textual em português: coluna `search tsvector` gerada + índice GIN em `articles` e `library_items`.
- Paginação por cursor: índices `(status, published_at desc, id)`.
- Contadores de curtidas/comentários mantidos por trigger.
- Anti-spam no banco: trigger limita publicações/comentários por janela de tempo; bloqueios filtram conteúdo.
- `price_cents` dos especiais com `check (price_cents in (590, 790, 990))` — editável via migration se a política mudar.
- Realtime habilitado em `posts`, `comments`, `notifications`.
- Storage: `avatars` (público), `community` (membros), `library` (privado, URL assinada só para quem tem acesso).

## 5. Pipeline de notícias com IA

```
Cron (Vercel, a cada 30 min) → /api/cron/ingest (Authorization: Bearer CRON_SECRET)
 1. Coleta: RSS/API das fontes ativas e autorizadas (sources.is_active)
 2. Normaliza + hash de conteúdo (sha256 de título+url canônica)
 3. Deduplica: unique(external_url) + similaridade de título (pg_trgm) → cluster_id
 4. Relevância: palavras-chave + categoria da fonte → descarta irrelevantes
 5. IA gera resumo ORIGINAL a partir do texto da fonte, classifica categoria e content_type.
    Prompt exige: não criar fatos/declarações; citar somente a fonte fornecida;
    marcar alegações como "não verificado" quando a fonte não confirma.
 6. Grava article(status='review', ai_generated=true) + article_sources
 7. Admin revisa em /admin/editorial → aprova, agenda ou descarta
 8. Publicação (ou cron de agendados) → notificação para quem segue a categoria
```

Conteúdo com acusações a pessoas é marcado `requires_legal_review` e nunca entra em agendamento automático.

## 6. Segurança, LGPD e escala

- **RLS em 100% das tabelas**; service role apenas em route handlers server-only.
- **Validação** com zod em toda entrada; **rate limiting** por IP/usuário (Upstash se configurado, memória como fallback) em auth, IA, posts e checkout.
- **Logs** estruturados (JSON) sem dados pessoais; `audit_logs` para ações administrativas.
- **Webhook Stripe**: verificação de assinatura + tabela `stripe_events` para idempotência.
- **LGPD**: consentimento explícito no cadastro, política de privacidade, exportação de dados e exclusão de conta (cascade + anonimização de posts), retenção mínima, dados sensíveis (opinião política) tratados como sensíveis: perfis e atividade da comunidade não são públicos.
- **Escala (~5.000 usuários)**: RSC com cache por rota/tag, índices para todos os filtros, paginação por cursor, imagens otimizadas, Realtime só onde necessário. Capacidade real deve ser confirmada com teste de carga (k6) antes de qualquer promessa.

## 7. Plano de implementação

| Fase | Entrega | Status |
|---|---|---|
| 1 | Arquitetura, identidade visual (logo, tema claro/escuro), landing page, manifest base, CI | **concluída** |
| 2 | Supabase Auth (cadastro, login, recuperação, confirmação), perfis, onboarding, `proxy.ts`, migrations aplicadas | próxima |
| 3 | Shell do app (bottom-nav/sidebar), dashboard, feed com filtros, busca, favoritos, scroll infinito, artigo | |
| 4 | Pipeline de ingestão, revisão editorial, briefing diário, radar (APIs da Câmara/Senado), "Entenda a Notícia" | |
| 5 | Comunidade (salas, posts, comentários, curtidas, imagens, realtime), denúncias, bloqueios, moderação | |
| 6 | Biblioteca, especiais com compra avulsa, entrega de arquivos privados | |
| 7 | Stripe Checkout + Billing Portal, webhooks, controle de acesso, modo demonstração | |
| 8 | Central de notificações, push PWA, service worker, offline, testes E2E completos, deploy | |
