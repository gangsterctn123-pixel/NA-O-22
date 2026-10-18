import { expect, test } from "@playwright/test";

// Sem Supabase configurado: páginas renderizam, validam no cliente e protegem rotas.

test("\"Acessar agora\" e \"Assinar\" levam ao cadastro", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) {
    await page.mouse.wheel(0, 1200);
    await page.getByTestId("mobile-sticky-cta").getByRole("link", { name: "Acessar agora" }).click();
  } else {
    await page.getByRole("link", { name: "Assinar agora" }).click();
  }
  await expect(page).toHaveURL(/\/cadastro$/);
  await expect(page.getByRole("heading", { name: "Crie sua conta" })).toBeVisible();
});

test("cadastro tem todos os campos e link para entrar", async ({ page }) => {
  await page.goto("/cadastro");
  for (const label of ["Nome completo", "Nome de usuário", "E-mail", "Confirmar senha"]) {
    await expect(page.getByLabel(label)).toBeVisible();
  }
  await expect(page.getByLabel("Senha", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Criar minha conta" })).toBeVisible();
  await page.getByRole("link", { name: "Já tenho uma conta — Entrar" }).click();
  await expect(page).toHaveURL(/\/entrar$/);
  await expect(page.getByRole("link", { name: "Esqueci minha senha" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Criar uma conta" })).toBeVisible();
});

test("áreas privadas exigem login", async ({ page }) => {
  for (const path of ["/inicio", "/perfil", "/comunidade"]) {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`/entrar\\?next=${encodeURIComponent(path)}`));
  }
});

test("sem Supabase configurado, avisa que o acesso está indisponível", async ({ page }) => {
  await page.goto("/entrar");
  await expect(page.getByTestId("auth-unavailable")).toBeVisible();
});
