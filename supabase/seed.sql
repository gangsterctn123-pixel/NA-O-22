-- Dados de base (não são notícias). Nenhum conteúdo jornalístico fictício é inserido aqui.

insert into public.categories (slug, name, scope, position) values
  ('politica', 'Política', 'news', 1),
  ('congresso', 'Congresso', 'news', 2),
  ('economia', 'Economia', 'news', 3),
  ('justica', 'Justiça', 'news', 4),
  ('seguranca-publica', 'Segurança Pública', 'news', 5),
  ('eleicoes', 'Eleições', 'news', 6),
  ('brasil', 'Brasil', 'news', 7),
  ('mundo', 'Mundo', 'news', 8),
  ('historia-politica', 'História Política do Brasil', 'library', 1),
  ('constituicao', 'Constituição Brasileira', 'library', 2),
  ('economia-livre-mercado', 'Economia e Livre Mercado', 'library', 3),
  ('conservadorismo', 'Conservadorismo', 'library', 4),
  ('tres-poderes', 'Funcionamento dos Três Poderes', 'library', 5),
  ('historia-ideias', 'História das Ideias Políticas', 'library', 6),
  ('educacao-civica', 'Educação Cívica', 'library', 7)
on conflict (slug) do nothing;

insert into public.rooms (slug, name, description, position) values
  ('geral', 'Comunidade Geral', 'Apresentações e conversas gerais entre membros.', 1),
  ('noticias-do-dia', 'Notícias do Dia', 'Discussão sobre as notícias publicadas hoje.', 2),
  ('economia-trabalho', 'Economia e Trabalho', 'Mercado, emprego, impostos e empreendedorismo.', 3),
  ('seguranca-publica', 'Segurança Pública', 'Políticas de segurança, legislação penal e defesa.', 4),
  ('politica-nacional', 'Política Nacional', 'Congresso, governo e instituições.', 5),
  ('eleicoes', 'Eleições', 'Calendário eleitoral, regras e debates.', 6),
  ('historia-conservadorismo', 'História e Conservadorismo', 'Ideias, autores e história.', 7),
  ('sugestoes-debates', 'Sugestões e Debates', 'Sugestões para a plataforma e debates abertos.', 8)
on conflict (slug) do nothing;

insert into public.app_settings (key, value) values
  ('public.subscription', '{"price_cents": 499, "currency": "brl", "interval": "month"}'),
  ('public.special_prices', '[590, 790, 990]'),
  ('public.brand', '{"name": "NAÇÃO 22", "slogan": "Informação, Liberdade e Comunidade."}'),
  ('ai.limits', '{"explain_per_hour": 20, "explain_per_day": 60}')
on conflict (key) do nothing;

-- Fontes públicas oficiais sugeridas. Ficam INATIVAS até um administrador
-- verificar termos de uso/licença e registrar em license_note.
insert into public.sources (name, homepage_url, feed_url, kind, is_active, license_note) values
  ('Agência Câmara de Notícias', 'https://www.camara.leg.br/noticias', null, 'rss', false, 'Verificar termos de reprodução antes de ativar.'),
  ('Agência Senado', 'https://www12.senado.leg.br/noticias', null, 'rss', false, 'Verificar termos de reprodução antes de ativar.'),
  ('Agência Brasil (EBC)', 'https://agenciabrasil.ebc.com.br', null, 'rss', false, 'Verificar licença vigente e exigência de crédito antes de ativar.'),
  ('Câmara dos Deputados — Dados Abertos', 'https://dadosabertos.camara.leg.br', 'https://dadosabertos.camara.leg.br/api/v2', 'api', false, 'API oficial para o Radar (proposições, votações).'),
  ('Senado Federal — Dados Abertos', 'https://www12.senado.leg.br/dados-abertos', 'https://legis.senado.leg.br/dadosabertos', 'api', false, 'API oficial para o Radar (matérias, votações).');
