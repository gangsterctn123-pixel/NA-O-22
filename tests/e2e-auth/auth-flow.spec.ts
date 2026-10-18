import { expect, test, type Page } from "@playwright/test";

// Executado contra o Supabase simulado (ver playwright.auth.config.ts).
const unique = () => Math.random().toString(36).slice(2, 8);

async function signUp(page: Page, opts: { username: string; email: string; password: string }) {
  await page.goto("/cadastro");
  await page.getByLabel("Nome completo").fill("Maria Teste");
  await page.getByLabel("Nome de usuário").fill(opts.username);
  await page.getByLabel("E-mail").fill(opts.email);
  await page.getByLabel("Senha", { exact: true }).fill(opts.password);
  await page.getByLabel("Confirmar senha").fill(opts.password);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Criar minha conta" }).click();
}

test("cadastro → feed → logout → login → sessão persistente", async ({ page, context }) => {
  const id = unique();
  const creds = { username: `maria_${id}`, email: `maria.${id}@teste.dev`, password: "senhaSegura1" };

  await signUp(page, creds);
  await expect(page).toHaveURL(/\/inicio$/);
  await expect(page.getByTestId("home-greeting")).toHaveText("Maria");
  await expect(page.getByText("Nenhuma notícia publicada ainda")).toBeVisible();

  // sessão persiste em nova aba (cookies)
  const other = await context.newPage();
  await other.goto("/perfil");
  await expect(other.getByTestId("profile-name")).toHaveText("Maria Teste");
  await expect(other.getByRole("main").getByText(`@${creds.username}`)).toBeVisible();

  // usuário logado não vê login/cadastro
  await other.goto("/entrar");
  await expect(other).toHaveURL(/\/inicio$/);
  await other.close();

  // logout
  await page.goto("/perfil");
  await page.getByRole("main").getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/entrar\?saiu=1/);
  await expect(page.getByText("Você saiu da sua conta.")).toBeVisible();

  // área privada volta a exigir login, preservando o destino
  await page.goto("/biblioteca");
  await expect(page).toHaveURL(/\/entrar\?next=%2Fbiblioteca/);

  // senha errada
  await page.getByLabel("E-mail").fill(creds.email);
  await page.getByLabel("Senha", { exact: true }).fill("errada123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("E-mail ou senha incorretos.")).toBeVisible();

  // login correto volta para o destino original
  await page.getByLabel("Senha", { exact: true }).fill(creds.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/biblioteca$/);
});

test("nome de usuário já usado é recusado", async ({ page }) => {
  const id = unique();
  await signUp(page, { username: `dup_${id}`, email: `a.${id}@teste.dev`, password: "senhaSegura1" });
  await expect(page).toHaveURL(/\/inicio$/);
  await page.context().clearCookies();

  await signUp(page, { username: `dup_${id}`, email: `b.${id}@teste.dev`, password: "senhaSegura1" });
  await expect(page.getByText("Este nome de usuário já está em uso.")).toBeVisible();
  // campos preenchidos são mantidos
  await expect(page.getByLabel("E-mail")).toHaveValue(`b.${id}@teste.dev`);
});

test("recuperação de senha mostra confirmação sem revelar se a conta existe", async ({ page }) => {
  await page.goto("/entrar");
  await page.getByRole("link", { name: "Esqueci minha senha" }).click();
  await expect(page).toHaveURL(/\/recuperar-senha$/);
  await page.getByLabel("E-mail da sua conta").fill("qualquer@teste.dev");
  await page.getByRole("button", { name: "Enviar link de recuperação" }).click();
  await expect(page.getByTestId("forgot-success")).toContainText("Se houver uma conta com este e-mail");
});

test("alterar senha logado e entrar com a nova", async ({ page }) => {
  const id = unique();
  const email = `troca.${id}@teste.dev`;
  await signUp(page, { username: `troca_${id}`, email, password: "senhaAntiga1" });
  await expect(page).toHaveURL(/\/inicio$/);

  await page.goto("/redefinir-senha");
  await page.getByLabel("Nova senha", { exact: true }).fill("senhaNova22");
  await page.getByLabel("Confirmar nova senha").fill("senhaNova22");
  await page.getByRole("button", { name: "Salvar nova senha" }).click();
  await expect(page).toHaveURL(/\/inicio\?senha=atualizada/);
  await expect(page.getByText("Sua senha foi atualizada.")).toBeVisible();

  await page.context().clearCookies();
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill("senhaNova22");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/inicio$/);
});

test("link de e-mail inválido volta ao login com aviso", async ({ page }) => {
  await page.goto("/auth/confirm?token_hash=invalido&type=signup");
  await expect(page).toHaveURL(/\/entrar\?erro=link/);
  await expect(page.getByText("O link é inválido ou expirou.")).toBeVisible();
});

test("validação imediata dos campos do cadastro", async ({ page }) => {
  await page.goto("/cadastro");
  await page.getByLabel("Nome completo").fill("Maria");
  await page.getByLabel("Nome de usuário").fill("Ma");
  await page.getByLabel("E-mail").fill("email-invalido");
  await page.getByLabel("Senha", { exact: true }).fill("123");
  await page.getByLabel("Confirmar senha").fill("456");
  await page.getByRole("button", { name: "Criar minha conta" }).click();

  await expect(page.getByText("Informe nome e sobrenome.")).toBeVisible();
  await expect(page.getByText("Use de 3 a 20 caracteres", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();
  await expect(page.getByText("A senha deve ter pelo menos 8 caracteres.")).toBeVisible();
  await expect(page.getByText("As senhas não coincidem.")).toBeVisible();
  await expect(page.getByText("É necessário aceitar os Termos", { exact: false })).toBeVisible();
  await expect(page).toHaveURL(/\/cadastro$/);
});
