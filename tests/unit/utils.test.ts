import { formatBRL, readingMinutes } from "@/lib/utils";

describe("formatBRL", () => {
  it("formata centavos em reais", () => {
    expect(formatBRL(499)).toBe("R$ 4,99");
    expect(formatBRL(590)).toBe("R$ 5,90");
    expect(formatBRL(123456)).toBe("R$ 1.234,56");
  });

  it("rejeita valores inválidos", () => {
    expect(() => formatBRL(Number.NaN)).toThrow();
  });
});

describe("readingMinutes", () => {
  it("retorna no mínimo 1 minuto", () => {
    expect(readingMinutes("")).toBe(1);
    expect(readingMinutes("uma frase curta")).toBe(1);
  });

  it("arredonda para cima a ~200 palavras por minuto", () => {
    expect(readingMinutes(Array(401).fill("palavra").join(" "))).toBe(3);
  });
});
