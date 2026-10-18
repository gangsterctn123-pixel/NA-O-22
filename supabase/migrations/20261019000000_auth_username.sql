-- ════════════════════════════════════════════════════════════════════
-- Autenticação: nome de usuário único no perfil + verificação de disponibilidade
-- ════════════════════════════════════════════════════════════════════

alter table public.profiles add column if not exists username text;

-- Perfis já existentes (se houver) recebem um nome derivado e único
update public.profiles p
set username = left(regexp_replace(lower(split_part(u.email, '@', 1)), '[^a-z0-9_]', '', 'g'), 14)
               || '_' || substr(md5(p.id::text), 1, 5)
from auth.users u
where u.id = p.id and p.username is null;

alter table public.profiles
  alter column username set not null,
  add constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,20}$');

create unique index if not exists profiles_username_uidx on public.profiles (username);

-- Gatilho de cadastro passa a gravar o username enviado no signUp (options.data.username).
-- Se vier ausente/inválido, gera um a partir do e-mail.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  wanted text := lower(trim(coalesce(new.raw_user_meta_data ->> 'username', '')));
  fallback text := left(regexp_replace(lower(split_part(new.email, '@', 1)), '[^a-z0-9_]', '', 'g'), 14)
                   || '_' || substr(md5(new.id::text), 1, 5);
begin
  if wanted !~ '^[a-z0-9_]{3,20}$' then
    wanted := fallback;
  end if;

  insert into public.profiles (id, full_name, username, terms_accepted_at)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)), 80),
    wanted,
    case when (new.raw_user_meta_data ->> 'terms_accepted')::boolean then now() end
  );
  insert into public.notification_preferences (user_id) values (new.id);
  return new;
end $$;

-- Disponibilidade de username para o formulário de cadastro (visitante não lê profiles).
-- Retorna apenas true/false; não expõe nenhum dado do perfil.
create or replace function public.is_username_available(p_username text)
returns boolean language sql stable security definer set search_path = public as $$
  select lower(trim(p_username)) ~ '^[a-z0-9_]{3,20}$'
     and not exists (select 1 from public.profiles where username = lower(trim(p_username)))
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;

-- Usuário pode trocar o próprio username (formato e unicidade garantidos pelas constraints)
grant update (username) on public.profiles to authenticated;
