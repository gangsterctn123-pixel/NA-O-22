import { render, screen } from "@testing-library/react";
import { NewsRadarPreview } from "@/components/landing/news-radar-preview";
import { CommunityPreview } from "@/components/landing/community-preview";
import { Pricing } from "@/components/landing/pricing";
import { getFaq } from "@/components/landing/faq";
import { LogoMark } from "@/components/brand/logo";

describe("conteúdo demonstrativo", () => {
  it("toda prévia de notícia está sinalizada como exemplo", () => {
    const { container } = render(<NewsRadarPreview />);
    const articles = container.querySelectorAll("h3");
    const demoBadges = container.querySelectorAll("[data-demo]");
    // 3 notícias + 1 selo no radar
    expect(demoBadges.length).toBeGreaterThanOrEqual(articles.length);
  });

  it("prévia da comunidade está sinalizada como exemplo", () => {
    const { container } = render(<CommunityPreview />);
    expect(container.querySelector("[data-demo]")).not.toBeNull();
  });
});

describe("Pricing", () => {
  it("exibe o preço configurado", () => {
    render(<Pricing priceCents={499} demoMode={false} />);
    expect(screen.getByTestId("price")).toHaveTextContent("R$ 4,99");
  });

  it("avisa quando está em modo demonstração", () => {
    render(<Pricing priceCents={799} demoMode />);
    expect(screen.getByTestId("price")).toHaveTextContent("R$ 7,99");
    expect(screen.getByText(/nenhuma cobrança real/i)).toBeInTheDocument();
  });
});

describe("FAQ", () => {
  it("informa independência e reflete o preço", () => {
    const faq = getFaq(499);
    expect(faq.some((f) => /independente/i.test(f.a))).toBe(true);
    expect(faq.some((f) => f.a.includes("R$ 4,99"))).toBe(true);
  });
});

describe("LogoMark", () => {
  it("é acessível", () => {
    render(<LogoMark />);
    expect(screen.getByRole("img", { name: "NAÇÃO 22" })).toBeInTheDocument();
  });
});
