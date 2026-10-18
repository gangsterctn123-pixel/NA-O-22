/** Traduz erros do Supabase Auth para mensagens claras, sem revelar se um e-mail existe. */
export function authErrorMessage(error: { code?: string; message?: string; status?: number } | null | undefined): string {
  if (!error) return "Não foi possível concluir a operação. Tente novamente.";
  const code = error.code ?? "";
  const msg = (error.message ?? "").toLowerCase();

  if (code === "invalid_credentials" || msg.includes("invalid login credentials"))
    return "E-mail ou senha incorretos.";
  if (code === "email_not_confirmed" || msg.includes("email not confirmed"))
    return "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada e o spam.";
  if (code === "weak_password" || msg.includes("weak password") || msg.includes("password should"))
    return "Senha fraca. Use pelo menos 8 caracteres, com letras e números.";
  if (code === "same_password") return "A nova senha deve ser diferente da atual.";
  if (code.startsWith("over_") || error.status === 429 || msg.includes("rate limit"))
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
  if (code === "signup_disabled") return "Novos cadastros estão temporariamente desativados.";
  if (code === "session_not_found" || code === "session_expired" || code === "otp_expired")
    return "Seu link expirou ou já foi usado. Solicite um novo.";
  if (code === "email_address_invalid") return "Este endereço de e-mail não é aceito. Use outro e-mail.";
  return "Não foi possível concluir a operação. Tente novamente em instantes.";
}
