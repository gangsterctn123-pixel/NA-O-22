import { expect, test } from "@playwright/test";

test.describe("Landing page", () => {
  test("exibe headline, CTAs e aviso de independência", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("A política brasileira");
    await expect(page.getByTestId("price")).toContainText("R$");
    await expect(page.getByTestId("independence-notice")).toContainText("independente");

    const cta = page.getByRole("link", { name: /Começar minha assinatura/ });
    await expect(cta).toHaveAttribute("href", /\/cadastro/);
  });

  test("todos os exemplos de notícia estão marcados como demonstrativos", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#radar [data-demo]").first()).toBeVisible();
  });

  test("FAQ abre e fecha", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /ligação com algum partido/ });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  test("alterna modo escuro", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("theme-toggle").click();
    const html = page.locator("html");
    const isDark = await html.evaluate((el) => el.classList.contains("dark"));
    await page.getByTestId("theme-toggle").click();
    await expect.poll(() => html.evaluate((el) => el.classList.contains("dark"))).toBe(!isDark);
  });

  test("manifest PWA disponível", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.name).toBe("NAÇÃO 22");
    expect(json.display).toBe("standalone");
  });
});

test.describe("CTA fixo no mobile", () => {
  test("aparece após rolar (somente mobile)", async ({ page, isMobile }) => {
    await page.goto("/");
    const bar = page.getByTestId("mobile-sticky-cta");
    if (!isMobile) {
      await expect(bar).toBeHidden();
      return;
    }
    await page.mouse.wheel(0, 1200);
    await expect(bar).toHaveAttribute("aria-hidden", "false");
    await expect(bar.getByRole("link", { name: "Acessar agora" })).toBeVisible();
  });
});
