"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "../actions";
import { resetPasswordSchema, type AuthFormState } from "../schemas";
import { FormAlert, PasswordField } from "./form-fields";
import { SubmitButton } from "./submit-button";
import { useClientValidation } from "./use-client-validation";

const initial: AuthFormState = { status: "idle" };

export function ResetPasswordForm() {
  const [state, action] = useActionState(resetPasswordAction, initial);
  const serverErrors = state.status === "error" ? state.fieldErrors : undefined;
  const { errors, onSubmit, clearField } = useClientValidation(resetPasswordSchema, serverErrors);

  return (
    <form action={action} onSubmit={onSubmit} noValidate className="space-y-4">
      {state.status === "error" && state.message && <FormAlert tone="error">{state.message}</FormAlert>}
      <PasswordField
        label="Nova senha"
        name="password"
        autoComplete="new-password"
        hint="Mínimo de 8 caracteres, com letras e números."
        error={errors.password}
        onChange={() => clearField("password")}
        required
      />
      <PasswordField
        label="Confirmar nova senha"
        name="confirmPassword"
        autoComplete="new-password"
        error={errors.confirmPassword}
        onChange={() => clearField("confirmPassword")}
        required
      />
      <SubmitButton pendingText="Salvando...">Salvar nova senha</SubmitButton>
    </form>
  );
}
