# Configurar o Supabase (autenticação)

O código já está pronto. Faltam apenas estes passos no painel do Supabase e da Vercel.

## 1. Criar o projeto

1. Acesse https://supabase.com → **New project** (região sugerida: *South America (São Paulo)*).
2. Guarde a senha do banco em local seguro (não vai para o código).

## 2. Criar as tabelas (migrations)

Opção A — pelo painel: **SQL Editor → New query**, cole e execute, **nesta ordem**:

1. `supabase/migrations/20261018000000_initial_schema.sql`
2. `supabase/migrations/20261019000000_auth_username.sql`
3. `supabase/seed.sql` (categorias, salas e configurações; não contém notícias)

Opção B — pela CLI:

```bash
npx supabase login
npx supabase link --project-ref <ref-do-projeto>
npx supabase db push
psql "<connection-string>" -f supabase/seed.sql
```

## 3. Configurar a autenticação

Em **Authentication → URL Configuration**:

| Campo | Valor |
|---|---|
| Site URL | `https://SEU-DOMINIO` (ex.: `https://nacao22.vercel.app`) |
| Redirect URLs | `https://SEU-DOMINIO/auth/confirm` e `http://localhost:3000/auth/confirm` |

Em **Authentication → Sign In / Providers → Email**:

- **Confirm email**: ligado (recomendado). O usuário recebe um link e só entra após confirmar.
  Se desligar, o cadastro já entra direto no app.
- **Secure password change**: ligado.
- Tamanho mínimo de senha: 8 (o app já exige letras + números).

### E-mails (recomendado para produção)

O servidor de e-mail padrão do Supabase tem limite baixo de envios por hora e serve só para testes.
Para produção configure um SMTP próprio em **Project Settings → Auth → SMTP Settings**
(ex.: Resend, Amazon SES, Brevo) e personalize os textos em **Authentication → Email Templates**.

Opcional — links que funcionam em outro dispositivo/navegador: troque o link dos templates
**Confirm signup** e **Reset password** por:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}
```

(Com o template padrão, o link precisa ser aberto no mesmo navegador em que a conta foi criada.)

## 4. Variáveis de ambiente

Em **Project Settings → API** copie:

| Variável | Onde achar | Pública? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) | anon / publishable key | sim (protegida por RLS) |
| `NEXT_PUBLIC_SITE_URL` | seu domínio | sim |

**Nunca** coloque a `service_role` / `secret key` em variáveis `NEXT_PUBLIC_*` nem no código.
A autenticação não precisa dela.

- Local: crie `.env.local` (não versionado) com os valores acima.
- Vercel: **Settings → Environment Variables** → adicione as três e faça **Redeploy**
  (variáveis `NEXT_PUBLIC_*` são aplicadas no build).

## 5. Promover um administrador

Depois de criar sua conta pelo app, no SQL Editor:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'seu@email.com');
```

## Como testar

1. Abra `/cadastro`, crie uma conta e confirme pelo e-mail.
2. Você é levado ao `/inicio`. Feche e reabra o navegador: continua logado.
3. Em **Perfil → Sair**, depois entre de novo em `/entrar`.
4. Em `/entrar` → **Esqueci minha senha**, receba o link e defina uma nova senha.
