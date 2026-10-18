import { forgotPasswordSchema, resetPasswordSchema, signInSchema, signUpSchema, toFieldErrors } from "@/features/auth/schemas";
import { authErrorMessage } from "@/features/auth/errors";
import { isProtectedPath, safeNextPath } from "@/features/auth/routes";
import { rateLimit } from "@/lib/rate-limit";

const valid = {
  fullName: "João Silva",
  username: "Joao_Silva",
  email: " JOAO@Exemplo.com ",
  password: "senhaForte1",
  confirmPassword: "senhaForte1",
  terms: "on",
};

describe("signUpSchema", () => {
  it("aceita dados válidos e normaliza e-mail e usuário", () => {
    const r = signUpSchema.parse(valid);
    expect(r.email).toBe("joao@exemplo.com");
    expect(r.username).toBe("joao_silva");
  });

  it.each([
    [{ fullName: "João" }, "fullName"],
    [{ username: "ab" }, "username"],
    [{ username: "joão.silva" }, "username"],
    [{ email: "invalido" }, "email"],
    [{ password: "curta1", confirmPassword: "curta1" }, "password"],
    [{ password: "semnumeros", confirmPassword: "semnumeros" }, "password"],
    [{ confirmPassword: "outraSenha1" }, "confirmPassword"],
    [{ terms: undefined }, "terms"],
  ])("rejeita %o no campo %s", (patch, field) => {
    const r = signUpSchema.safeParse({ ...valid, ...patch });
    expect(r.success).toBe(false);
    if (!r.success) expect(toFieldErrors(r.error)[field]).toBeTruthy();
  });
});

describe("demais schemas", () => {
  it("login exige e-mail e senha", () => {
    expect(signInSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
    expect(signInSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
  });
  it("recuperação exige e-mail válido", () => {
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
  it("nova senha precisa coincidir", () => {
    expect(resetPasswordSchema.safeParse({ password: "novaSenha9", confirmPassword: "novaSenha8" }).success).toBe(false);
  });
});

describe("safeNextPath (proteção contra open redirect)", () => {
  it.each([
    [undefined, "/inicio"],
    ["/perfil", "/perfil"],
    ["/noticias?cat=economia", "/noticias?cat=economia"],
    ["//evil.com", "/inicio"],
    ["https://evil.com", "/inicio"],
    ["/\\evil.com", "/inicio"],
    ["javascript:alert(1)", "/inicio"],
  ])("%s → %s", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });
});

describe("isProtectedPath", () => {
  it("protege a área logada e subcaminhos", () => {
    expect(isProtectedPath("/inicio")).toBe(true);
    expect(isProtectedPath("/comunidade/geral")).toBe(true);
    expect(isProtectedPath("/admin")).toBe(true);
  });
  it("não protege páginas públicas", () => {
    for (const p of ["/", "/entrar", "/cadastro", "/termos", "/inicios"]) expect(isProtectedPath(p)).toBe(false);
  });
});

describe("authErrorMessage", () => {
  it("traduz erros comuns", () => {
    expect(authErrorMessage({ code: "invalid_credentials" })).toBe("E-mail ou senha incorretos.");
    expect(authErrorMessage({ message: "Email not confirmed" })).toMatch(/Confirme seu e-mail/);
    expect(authErrorMessage({ status: 429 })).toMatch(/Muitas tentativas/);
    expect(authErrorMessage({ code: "algo_novo" })).toMatch(/Não foi possível/);
  });
});

describe("rateLimit", () => {
  it("bloqueia após o limite e libera na próxima janela", () => {
    const key = `t:${Math.random()}`;
    expect(rateLimit(key, 2, 1000, 0).ok).toBe(true);
    expect(rateLimit(key, 2, 1000, 10).ok).toBe(true);
    expect(rateLimit(key, 2, 1000, 20).ok).toBe(false);
    expect(rateLimit(key, 2, 1000, 1001).ok).toBe(true);
  });
});
