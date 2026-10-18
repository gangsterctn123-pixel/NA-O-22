-- ════════════════════════════════════════════════════════════════════
-- NAÇÃO 22 — schema inicial
-- Tabelas, índices, funções auxiliares, triggers, RLS, storage e realtime.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

-- unaccent não é IMMUTABLE; wrapper para usar em colunas geradas/índices
create or replace function public.immutable_unaccent(text)
returns text language sql immutable parallel safe strict
as $$ select extensions.unaccent('extensions.unaccent'::regdictionary, $1) $$;

-- ─── Tipos ──────────────────────────────────────────────────────────
create type public.user_role as enum ('member', 'admin');
create type public.subscription_status as enum
  ('incomplete', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused');
create type public.content_type as enum ('fact', 'analysis', 'opinion');
create type public.publish_status as enum ('draft', 'review', 'scheduled', 'published', 'archived', 'rejected');
create type public.radar_kind as enum ('bill', 'vote', 'decision', 'agenda', 'proposal');
create type public.moderation_status as enum ('visible', 'hidden', 'removed');
create type public.report_reason as enum
  ('spam', 'harassment', 'threat', 'personal_data', 'misinformation', 'hate', 'other');
create type public.report_status as enum ('open', 'resolved', 'dismissed');
create type public.library_access as enum ('free', 'members', 'premium', 'purchase');
create type public.library_kind as enum ('article', 'guide', 'video', 'file');
create type public.notification_type as enum
  ('news', 'briefing', 'reply', 'community', 'follow_update', 'admin');

-- ─── Utilitário updated_at ──────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ════════════════════════════ USUÁRIOS ══════════════════════════════
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  full_name     text not null check (char_length(full_name) between 2 and 80),
  avatar_url    text,
  bio           text check (char_length(bio) <= 280),
  role          public.user_role not null default 'member',
  onboarded_at  timestamptz,
  suspended_until timestamptz,
  terms_accepted_at timestamptz,
  marketing_consent boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

create table public.notification_preferences (
  user_id     uuid primary key references public.profiles (id) on delete cascade,
  news        boolean not null default true,
  briefing    boolean not null default true,
  reply       boolean not null default true,
  community   boolean not null default true,
  follow_update boolean not null default true,
  admin       boolean not null default true,
  push_enabled boolean not null default false,
  updated_at  timestamptz not null default now()
);

-- Cria perfil + preferências ao cadastrar
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, terms_accepted_at)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    case when (new.raw_user_meta_data ->> 'terms_accepted')::boolean then now() end
  );
  insert into public.notification_preferences (user_id) values (new.id);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══════════════════════════ CONFIGURAÇÕES ══════════════════════════
create table public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now()
);

-- ════════════════════════════ ASSINATURAS ═══════════════════════════
-- Escrita EXCLUSIVA via service role (webhook Stripe). Nenhuma política de insert/update.
create table public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.profiles (id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text unique,
  stripe_price_id        text,
  status                 public.subscription_status not null default 'incomplete',
  price_cents            integer not null check (price_cents >= 0),
  currency               text not null default 'brl',
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  canceled_at            timestamptz,
  is_demo                boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions (user_id, status);
create trigger subscriptions_updated before update on public.subscriptions
  for each row execute function public.set_updated_at();

create table public.payments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references public.profiles (id) on delete set null,
  subscription_id   uuid references public.subscriptions (id) on delete set null,
  stripe_invoice_id text unique,
  stripe_payment_intent_id text unique,
  kind              text not null check (kind in ('subscription', 'purchase')),
  amount_cents      integer not null,
  currency          text not null default 'brl',
  status            text not null,
  paid_at           timestamptz,
  created_at        timestamptz not null default now()
);
create index payments_created_idx on public.payments (created_at desc);

create table public.stripe_events (
  id           text primary key,          -- evt_...
  type         text not null,
  processed_at timestamptz not null default now()
);

-- ═════════════════════ FUNÇÕES DE PERMISSÃO ═════════════════════════
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

create or replace function public.has_active_subscription(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = uid
      and status in ('active', 'trialing')
      and (current_period_end is null or current_period_end > now())
  ) or exists (select 1 from public.profiles where id = uid and role = 'admin')
$$;

create or replace function public.is_suspended(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = uid and suspended_until > now())
$$;

-- ═══════════════════════════ EDITORIAL ══════════════════════════════
create table public.categories (
  id       smallint generated always as identity primary key,
  slug     text not null unique,
  name     text not null,
  scope    text not null check (scope in ('news', 'library')),
  position smallint not null default 0
);

create table public.sources (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  homepage_url text not null,
  feed_url    text,
  kind        text not null check (kind in ('rss', 'api', 'manual')),
  default_category_id smallint references public.categories (id),
  is_active   boolean not null default false,
  -- registro de que a fonte foi verificada como pública/autorizada
  license_note text,
  last_fetched_at timestamptz,
  created_at  timestamptz not null default now()
);

create table public.ingested_items (
  id           uuid primary key default gen_random_uuid(),
  source_id    uuid not null references public.sources (id) on delete cascade,
  external_url text not null unique,
  title        text not null,
  raw_excerpt  text,
  published_at timestamptz,
  content_hash text not null,
  cluster_id   uuid,
  status       text not null default 'new'
               check (status in ('new', 'duplicate', 'irrelevant', 'processed', 'failed')),
  error        text,
  created_at   timestamptz not null default now()
);
create index ingested_items_status_idx on public.ingested_items (status, created_at);
create index ingested_items_title_trgm on public.ingested_items using gin (title extensions.gin_trgm_ops);
create unique index ingested_items_hash_uidx on public.ingested_items (content_hash);

create table public.articles (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null check (char_length(title) between 5 and 200),
  summary           text not null check (char_length(summary) <= 600),
  body              text not null default '',
  historical_context text,
  content_type      public.content_type not null default 'fact',
  category_id       smallint not null references public.categories (id),
  cover_url         text,
  cover_credit      text,
  reading_minutes   smallint not null default 1 check (reading_minutes > 0),
  status            public.publish_status not null default 'draft',
  is_premium        boolean not null default false,
  is_important      boolean not null default false,
  is_demo           boolean not null default false,
  ai_generated      boolean not null default false,
  ai_model          text,
  requires_legal_review boolean not null default false,
  ingested_item_id  uuid references public.ingested_items (id) on delete set null,
  author_id         uuid references public.profiles (id) on delete set null,
  reviewed_by       uuid references public.profiles (id) on delete set null,
  reviewed_at       timestamptz,
  scheduled_for     timestamptz,
  published_at      timestamptz,
  search            tsvector generated always as (
                      setweight(to_tsvector('portuguese', public.immutable_unaccent(coalesce(title, ''))), 'A') ||
                      setweight(to_tsvector('portuguese', public.immutable_unaccent(coalesce(summary, ''))), 'B') ||
                      setweight(to_tsvector('portuguese', public.immutable_unaccent(coalesce(body, ''))), 'C')
                    ) stored,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- publicado exige revisão humana
  constraint articles_published_reviewed check (status <> 'published' or reviewed_by is not null),
  constraint articles_scheduled_has_date check (status <> 'scheduled' or scheduled_for is not null),
  constraint articles_legal_not_scheduled check (not (requires_legal_review and status = 'scheduled'))
);
create index articles_feed_idx on public.articles (status, published_at desc, id);
create index articles_category_feed_idx on public.articles (category_id, status, published_at desc);
create index articles_search_idx on public.articles using gin (search);
create index articles_scheduled_idx on public.articles (scheduled_for) where status = 'scheduled';
create trigger articles_updated before update on public.articles
  for each row execute function public.set_updated_at();

create table public.article_sources (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid not null references public.articles (id) on delete cascade,
  source_name text not null,
  url         text not null check (url ~ '^https?://'),
  is_primary  boolean not null default false,
  accessed_at timestamptz not null default now()
);
create index article_sources_article_idx on public.article_sources (article_id);

create table public.saved_articles (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  article_id uuid not null references public.articles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

-- Cache das análises "Entenda a Notícia" (por artigo, não por usuário)
create table public.ai_explanations (
  id         uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  kind       text not null check (kind in
               ('simple', 'history', 'terms', 'perspectives', 'consequences', 'reading', 'before_sharing')),
  content    jsonb not null,
  model      text not null,
  created_at timestamptz not null default now(),
  unique (article_id, kind)
);

create table public.ai_requests (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  kind       text not null,
  created_at timestamptz not null default now()
);
create index ai_requests_user_time_idx on public.ai_requests (user_id, created_at desc);

-- ═══════════════════════════ BRIEFING ═══════════════════════════════
create table public.briefings (
  id           uuid primary key default gen_random_uuid(),
  briefing_date date not null unique,
  title        text not null,
  intro        text,
  status       public.publish_status not null default 'draft',
  is_premium   boolean not null default false,
  is_demo      boolean not null default false,
  approved_by  uuid references public.profiles (id) on delete set null,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint briefings_published_approved check (status <> 'published' or approved_by is not null)
);
create index briefings_date_idx on public.briefings (status, briefing_date desc);
create trigger briefings_updated before update on public.briefings
  for each row execute function public.set_updated_at();

create table public.briefing_items (
  id            uuid primary key default gen_random_uuid(),
  briefing_id   uuid not null references public.briefings (id) on delete cascade,
  position      smallint not null check (position between 1 and 5),
  headline      text not null,
  summary       text not null,
  why_it_matters text not null,
  article_id    uuid references public.articles (id) on delete set null,
  -- [{ "name": "...", "url": "https://..." }] — ao menos uma fonte
  sources       jsonb not null check (jsonb_typeof(sources) = 'array' and jsonb_array_length(sources) > 0),
  unique (briefing_id, position)
);

-- ═══════════════════════════ RADAR ══════════════════════════════════
create table public.radar_items (
  id              uuid primary key default gen_random_uuid(),
  kind            public.radar_kind not null,
  reference_code  text,                  -- ex.: "PL 1234/2025"
  title           text not null,
  summary         text,
  status_label    text,                  -- situação oficial, como publicada pela fonte
  responsible_body text not null,        -- Câmara, Senado, Presidência, STF...
  official_url    text check (official_url ~ '^https?://'),
  external_source text,                  -- 'camara_api' | 'senado_api' | 'manual'
  external_id     text,
  occurred_at     timestamptz,
  last_synced_at  timestamptz,
  is_demo         boolean not null default false,
  published       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (external_source, external_id)
);
create index radar_items_feed_idx on public.radar_items (published, occurred_at desc);
create index radar_items_kind_idx on public.radar_items (kind, occurred_at desc);
create trigger radar_items_updated before update on public.radar_items
  for each row execute function public.set_updated_at();

create table public.radar_events (
  id            uuid primary key default gen_random_uuid(),
  radar_item_id uuid not null references public.radar_items (id) on delete cascade,
  occurred_at   timestamptz not null,
  description   text not null,
  official_url  text check (official_url ~ '^https?://'),
  created_at    timestamptz not null default now()
);
create index radar_events_item_idx on public.radar_events (radar_item_id, occurred_at desc);

create table public.follows (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('radar_item', 'category', 'article')),
  target_id   text not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, target_type, target_id)
);
create index follows_target_idx on public.follows (target_type, target_id);

-- ═══════════════════════════ COMUNIDADE ═════════════════════════════
create table public.rooms (
  id          smallint generated always as identity primary key,
  slug        text not null unique,
  name        text not null,
  description text,
  position    smallint not null default 0,
  is_locked   boolean not null default false   -- só admins publicam
);

create table public.posts (
  id            uuid primary key default gen_random_uuid(),
  room_id       smallint not null references public.rooms (id),
  author_id     uuid references public.profiles (id) on delete set null,
  body          text not null check (char_length(body) between 1 and 5000),
  link_url      text check (link_url ~ '^https?://'),
  image_path    text,
  status        public.moderation_status not null default 'visible',
  like_count    integer not null default 0,
  comment_count integer not null default 0,
  edited_at     timestamptz,
  created_at    timestamptz not null default now()
);
create index posts_room_feed_idx on public.posts (room_id, status, created_at desc, id);
create index posts_author_idx on public.posts (author_id, created_at desc);

create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  parent_id  uuid references public.comments (id) on delete cascade,
  author_id  uuid references public.profiles (id) on delete set null,
  body       text not null check (char_length(body) between 1 and 2000),
  status     public.moderation_status not null default 'visible',
  like_count integer not null default 0,
  edited_at  timestamptz,
  created_at timestamptz not null default now()
);
create index comments_post_idx on public.comments (post_id, created_at);
create index comments_parent_idx on public.comments (parent_id);

create table public.post_likes (
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.comment_likes (
  comment_id uuid not null references public.comments (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create table public.user_blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id) on delete set null,
  target_type text not null check (target_type in ('post', 'comment', 'profile')),
  target_id   uuid not null,
  reason      public.report_reason not null,
  details     text check (char_length(details) <= 1000),
  status      public.report_status not null default 'open',
  resolved_by uuid references public.profiles (id) on delete set null,
  resolved_at timestamptz,
  created_at  timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);
create index reports_open_idx on public.reports (status, created_at);

create table public.moderation_actions (
  id             uuid primary key default gen_random_uuid(),
  moderator_id   uuid references public.profiles (id) on delete set null,
  target_user_id uuid references public.profiles (id) on delete cascade,
  target_type    text,
  target_id      uuid,
  action         text not null check (action in ('hide', 'remove', 'restore', 'suspend', 'unsuspend', 'warn')),
  reason         text,
  until          timestamptz,
  created_at     timestamptz not null default now()
);

-- Contadores
create or replace function public.bump_post_likes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then update posts set like_count = like_count + 1 where id = new.post_id;
  else update posts set like_count = greatest(like_count - 1, 0) where id = old.post_id; end if;
  return null;
end $$;
create trigger post_likes_count after insert or delete on public.post_likes
  for each row execute function public.bump_post_likes();

create or replace function public.bump_comment_likes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then update comments set like_count = like_count + 1 where id = new.comment_id;
  else update comments set like_count = greatest(like_count - 1, 0) where id = old.comment_id; end if;
  return null;
end $$;
create trigger comment_likes_count after insert or delete on public.comment_likes
  for each row execute function public.bump_comment_likes();

create or replace function public.bump_comment_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then update posts set comment_count = comment_count + 1 where id = new.post_id;
  else update posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id; end if;
  return null;
end $$;
create trigger comments_count after insert or delete on public.comments
  for each row execute function public.bump_comment_count();

-- Anti-spam: limites por janela de tempo (ajustáveis)
create or replace function public.enforce_community_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare recent int;
begin
  if public.is_suspended(new.author_id) then
    raise exception 'Conta suspensa temporariamente' using errcode = 'P0001';
  end if;
  if tg_table_name = 'posts' then
    select count(*) into recent from posts
      where author_id = new.author_id and created_at > now() - interval '10 minutes';
    if recent >= 5 then raise exception 'Limite de publicações atingido. Tente novamente em alguns minutos.' using errcode = 'P0001'; end if;
  else
    select count(*) into recent from comments
      where author_id = new.author_id and created_at > now() - interval '5 minutes';
    if recent >= 15 then raise exception 'Limite de comentários atingido. Tente novamente em alguns minutos.' using errcode = 'P0001'; end if;
  end if;
  return new;
end $$;
create trigger posts_rate_limit before insert on public.posts
  for each row execute function public.enforce_community_rate_limit();
create trigger comments_rate_limit before insert on public.comments
  for each row execute function public.enforce_community_rate_limit();

-- Usuário comum só altera o conteúdo (não status/contadores) dos próprios itens
create or replace function public.guard_community_update()
returns trigger language plpgsql as $$
begin
  -- atualizações vindas de outros triggers (contadores, auto-ocultar) passam direto
  if pg_trigger_depth() > 1 then return new; end if;
  if not public.is_admin() then
    new.status := old.status;
    new.like_count := old.like_count;
    new.author_id := old.author_id;
    if tg_table_name = 'posts' then
      new.comment_count := old.comment_count;
      new.room_id := old.room_id;
    end if;
    new.edited_at := now();
  end if;
  return new;
end $$;
create trigger posts_guard before update on public.posts
  for each row execute function public.guard_community_update();
create trigger comments_guard before update on public.comments
  for each row execute function public.guard_community_update();

-- Auto-ocultar após 5 denúncias distintas (aguarda revisão de moderador)
create or replace function public.auto_hide_reported()
returns trigger language plpgsql security definer set search_path = public as $$
declare n int;
begin
  select count(*) into n from reports
    where target_type = new.target_type and target_id = new.target_id and status = 'open';
  if n >= 5 then
    if new.target_type = 'post' then update posts set status = 'hidden' where id = new.target_id and status = 'visible';
    elsif new.target_type = 'comment' then update comments set status = 'hidden' where id = new.target_id and status = 'visible';
    end if;
  end if;
  return null;
end $$;
create trigger reports_auto_hide after insert on public.reports
  for each row execute function public.auto_hide_reported();

-- ═════════════════════════ BIBLIOTECA ═══════════════════════════════
create table public.library_items (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  description text not null,
  kind        public.library_kind not null,
  category_id smallint not null references public.categories (id),
  body        text,
  media_url   text,          -- vídeo incorporado (YouTube/Vimeo)
  file_path   text,          -- bucket privado "library"
  cover_url   text,
  access      public.library_access not null default 'members',
  is_special  boolean not null default false,
  price_cents integer check (price_cents in (590, 790, 990)),
  stripe_price_id text,
  status      public.publish_status not null default 'draft',
  is_demo     boolean not null default false,
  published_at timestamptz,
  search      tsvector generated always as (
                to_tsvector('portuguese', public.immutable_unaccent(coalesce(title, '') || ' ' || coalesce(description, '')))
              ) stored,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint library_purchase_has_price check (access <> 'purchase' or price_cents is not null)
);
create index library_items_feed_idx on public.library_items (status, category_id, published_at desc);
create index library_items_search_idx on public.library_items using gin (search);
create trigger library_items_updated before update on public.library_items
  for each row execute function public.set_updated_at();

-- Compras avulsas: escrita apenas via webhook (service role)
create table public.purchases (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles (id) on delete cascade,
  library_item_id  uuid not null references public.library_items (id) on delete restrict,
  stripe_checkout_session_id text unique,
  amount_cents     integer not null,
  status           text not null check (status in ('pending', 'paid', 'refunded')),
  is_demo          boolean not null default false,
  purchased_at     timestamptz,
  created_at       timestamptz not null default now(),
  unique (user_id, library_item_id)
);

create or replace function public.can_access_library_item(item_id uuid, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select case li.access
    when 'free'     then true
    when 'members'  then uid is not null
    when 'premium'  then public.has_active_subscription(uid)
    when 'purchase' then exists (select 1 from purchases p
                                 where p.user_id = uid and p.library_item_id = li.id and p.status = 'paid')
                         or exists (select 1 from profiles where id = uid and role = 'admin')
  end
  from library_items li where li.id = item_id
$$;

-- ═══════════════════════ NOTIFICAÇÕES ═══════════════════════════════
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  type       public.notification_type not null,
  title      text not null,
  body       text,
  link       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (user_id) where read_at is null;

create table public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

-- Notifica autor do post/comentário pai ao receber resposta (respeita preferências e bloqueios)
create or replace function public.notify_reply()
returns trigger language plpgsql security definer set search_path = public as $$
declare target uuid; room_slug text;
begin
  if new.parent_id is not null then
    select author_id into target from comments where id = new.parent_id;
  else
    select author_id into target from posts where id = new.post_id;
  end if;
  if target is null or target = new.author_id then return null; end if;
  if exists (select 1 from user_blocks where blocker_id = target and blocked_id = new.author_id) then return null; end if;
  if not coalesce((select reply from notification_preferences where user_id = target), true) then return null; end if;
  select r.slug into room_slug from posts p join rooms r on r.id = p.room_id where p.id = new.post_id;
  insert into notifications (user_id, type, title, body, link)
  values (target, 'reply', 'Nova resposta', left(new.body, 140), '/comunidade/' || room_slug || '/' || new.post_id);
  return null;
end $$;
create trigger comments_notify after insert on public.comments
  for each row execute function public.notify_reply();

-- ═════════════════════════ AUDITORIA ════════════════════════════════
create table public.audit_logs (
  id         bigint generated always as identity primary key,
  actor_id   uuid references public.profiles (id) on delete set null,
  action     text not null,
  entity     text not null,
  entity_id  text,
  metadata   jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index audit_logs_time_idx on public.audit_logs (created_at desc);

-- ════════════════════════ ROW LEVEL SECURITY ════════════════════════
alter table public.profiles                 enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.app_settings             enable row level security;
alter table public.subscriptions            enable row level security;
alter table public.payments                 enable row level security;
alter table public.stripe_events            enable row level security;
alter table public.categories               enable row level security;
alter table public.sources                  enable row level security;
alter table public.ingested_items           enable row level security;
alter table public.articles                 enable row level security;
alter table public.article_sources          enable row level security;
alter table public.saved_articles           enable row level security;
alter table public.ai_explanations          enable row level security;
alter table public.ai_requests              enable row level security;
alter table public.briefings                enable row level security;
alter table public.briefing_items           enable row level security;
alter table public.radar_items              enable row level security;
alter table public.radar_events             enable row level security;
alter table public.follows                  enable row level security;
alter table public.rooms                    enable row level security;
alter table public.posts                    enable row level security;
alter table public.comments                 enable row level security;
alter table public.post_likes               enable row level security;
alter table public.comment_likes            enable row level security;
alter table public.user_blocks              enable row level security;
alter table public.reports                  enable row level security;
alter table public.moderation_actions       enable row level security;
alter table public.library_items            enable row level security;
alter table public.purchases                enable row level security;
alter table public.notifications            enable row level security;
alter table public.push_subscriptions       enable row level security;
alter table public.audit_logs               enable row level security;

-- Perfis: membros veem perfis (comunidade é privada); cada um edita só campos permitidos do próprio
create policy profiles_select on public.profiles for select to authenticated using (true);
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_all on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url, bio, onboarded_at, marketing_consent) on public.profiles to authenticated;
-- admin altera role/suspensão via service role (server action com checagem is_admin + audit_log)

create policy prefs_own on public.notification_preferences for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Configurações: leitura pública de chaves não sensíveis; escrita só admin
create policy settings_read on public.app_settings for select using (key like 'public.%' or public.is_admin());
create policy settings_admin on public.app_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Assinaturas/pagamentos: leitura própria; sem escrita para clientes
create policy subs_read_own on public.subscriptions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy payments_read_own on public.payments for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
-- stripe_events: nenhuma política → acesso só via service role

create policy categories_read on public.categories for select using (true);
create policy categories_admin on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy sources_admin on public.sources for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy ingested_admin on public.ingested_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Artigos: visitantes veem publicados não-premium (prévia); assinantes veem todos os publicados
create policy articles_read_public on public.articles for select
  using (status = 'published' and published_at <= now()
         and (not is_premium or public.has_active_subscription()));
create policy articles_admin on public.articles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy article_sources_read on public.article_sources for select
  using (exists (select 1 from public.articles a where a.id = article_id));  -- herda RLS de articles
create policy article_sources_admin on public.article_sources for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy saved_own on public.saved_articles for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy ai_expl_read on public.ai_explanations for select to authenticated
  using (public.has_active_subscription());
create policy ai_expl_admin on public.ai_explanations for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy ai_requests_own on public.ai_requests for select to authenticated using (user_id = auth.uid());

create policy briefings_read on public.briefings for select
  using (status = 'published' and (not is_premium or public.has_active_subscription()));
create policy briefings_admin on public.briefings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy briefing_items_read on public.briefing_items for select
  using (exists (select 1 from public.briefings b where b.id = briefing_id));
create policy briefing_items_admin on public.briefing_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy radar_read on public.radar_items for select using (published);
create policy radar_admin on public.radar_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy radar_events_read on public.radar_events for select
  using (exists (select 1 from public.radar_items r where r.id = radar_item_id));
create policy radar_events_admin on public.radar_events for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy follows_own on public.follows for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Comunidade: privada para assinantes
create policy rooms_read on public.rooms for select to authenticated using (true);
create policy rooms_admin on public.rooms for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy posts_read on public.posts for select to authenticated
  using (
    public.has_active_subscription()
    and (status = 'visible' or author_id = auth.uid() or public.is_admin())
    and not exists (select 1 from public.user_blocks b
                    where b.blocker_id = auth.uid() and b.blocked_id = posts.author_id)
  );
create policy posts_insert on public.posts for insert to authenticated
  with check (
    author_id = auth.uid() and public.has_active_subscription() and not public.is_suspended()
    and (not (select is_locked from public.rooms where id = room_id) or public.is_admin())
  );
create policy posts_update_own on public.posts for update to authenticated
  using (author_id = auth.uid() or public.is_admin()) with check (author_id = auth.uid() or public.is_admin());
create policy posts_delete_own on public.posts for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

create policy comments_read on public.comments for select to authenticated
  using (
    public.has_active_subscription()
    and (status = 'visible' or author_id = auth.uid() or public.is_admin())
    and not exists (select 1 from public.user_blocks b
                    where b.blocker_id = auth.uid() and b.blocked_id = comments.author_id)
  );
create policy comments_insert on public.comments for insert to authenticated
  with check (author_id = auth.uid() and public.has_active_subscription() and not public.is_suspended()
              and exists (select 1 from public.posts p where p.id = post_id and p.status = 'visible'));
create policy comments_update_own on public.comments for update to authenticated
  using (author_id = auth.uid() or public.is_admin()) with check (author_id = auth.uid() or public.is_admin());
create policy comments_delete_own on public.comments for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

create policy post_likes_read on public.post_likes for select to authenticated using (true);
create policy post_likes_own on public.post_likes for insert to authenticated
  with check (user_id = auth.uid() and public.has_active_subscription());
create policy post_likes_del on public.post_likes for delete to authenticated using (user_id = auth.uid());
create policy comment_likes_read on public.comment_likes for select to authenticated using (true);
create policy comment_likes_own on public.comment_likes for insert to authenticated
  with check (user_id = auth.uid() and public.has_active_subscription());
create policy comment_likes_del on public.comment_likes for delete to authenticated using (user_id = auth.uid());

create policy blocks_own on public.user_blocks for all to authenticated
  using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

create policy reports_insert on public.reports for insert to authenticated
  with check (reporter_id = auth.uid());
create policy reports_read on public.reports for select to authenticated
  using (reporter_id = auth.uid() or public.is_admin());
create policy reports_admin on public.reports for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy moderation_admin on public.moderation_actions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Biblioteca: catálogo visível (metadados); conteúdo protegido é entregue pelo servidor
-- após can_access_library_item(). "body" de itens pagos não deve ser selecionado no cliente:
-- usar a view library_catalog abaixo.
create policy library_read on public.library_items for select
  using (status = 'published' and public.can_access_library_item(id));
create policy library_admin on public.library_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create view public.library_catalog with (security_invoker = false) as
  select id, slug, title, description, kind, category_id, cover_url, access, is_special,
         price_cents, is_demo, published_at,
         public.can_access_library_item(id) as unlocked
  from public.library_items where status = 'published';
grant select on public.library_catalog to anon, authenticated;

create policy purchases_read_own on public.purchases for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy notifications_own_read on public.notifications for select to authenticated
  using (user_id = auth.uid());
create policy notifications_own_update on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_own_delete on public.notifications for delete to authenticated
  using (user_id = auth.uid());
revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;

create policy push_own on public.push_subscriptions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy audit_admin_read on public.audit_logs for select to authenticated using (public.is_admin());

-- ═════════════════════════ STORAGE ══════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('avatars',   'avatars',   true,  2097152,  array['image/jpeg', 'image/png', 'image/webp']),
  ('community', 'community', false, 5242880,  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('library',   'library',   false, 52428800, null),
  ('covers',    'covers',    true,  5242880,  array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Convenção de caminho: <user_id>/<arquivo>
create policy avatars_read on storage.objects for select using (bucket_id = 'avatars');
create policy avatars_write on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_update on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_delete on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy community_read on storage.objects for select to authenticated
  using (bucket_id = 'community' and public.has_active_subscription());
create policy community_write on storage.objects for insert to authenticated
  with check (bucket_id = 'community' and (storage.foldername(name))[1] = auth.uid()::text
              and public.has_active_subscription() and not public.is_suspended());
create policy community_delete on storage.objects for delete to authenticated
  using (bucket_id = 'community' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- library: sem leitura direta; servidor gera signed URL após checar acesso
create policy library_admin_storage on storage.objects for all to authenticated
  using (bucket_id = 'library' and public.is_admin()) with check (bucket_id = 'library' and public.is_admin());

create policy covers_read on storage.objects for select using (bucket_id = 'covers');
create policy covers_admin on storage.objects for all to authenticated
  using (bucket_id = 'covers' and public.is_admin()) with check (bucket_id = 'covers' and public.is_admin());

-- ═════════════════════════ REALTIME ═════════════════════════════════
alter publication supabase_realtime add table public.posts, public.comments, public.notifications;
