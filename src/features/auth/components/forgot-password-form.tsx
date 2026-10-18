"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction } from "../actions";
import { forgotPasswordSchema, type AuthFormState } from "../schemas";
import { Field, FormAlert } from "./form-fields";
import { SubmitButton } from "./submit-button";
import { useClientValidation } from "./use-client-validation";

const initial: AuthFormState = { status: "idle" };

export function ForgotPasswordForm({ disabled }: { disabled?: boolean }) {
  const [state, action] = useActionState(forgotPasswordAction, initial);
  const serverErrors = state.status === "error" ? state.fieldErrors : undefined;
  const { errors, onSubmit, clearField } = useClientValidation(forgotPasswordSchema, serverErrors);
  const values = state.status === "error" ? state.values : undefined;

  if (state.status === "success") {
    return (
      <div className="space-y-5" data-testid="forgot-success">
        <FormAlert tone="success">{state.message}</FormAlert>
        <p className="text-sm text-[#555555]">O link é válido por tempo limitado. Confira também a pasta de spam.</p>
        <Link href="/entrar" className="inline-block font-semibold text-brand-blue hover:underline">
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <form action={action} onSubmit={onSubmit} noValidate className="space-y-4" key={JSON.stringify(values ?? {})}>
      {state.status === "error" && state.message && <FormAlert tone="error">{state.message}</FormAlert>}
      <Field
        label="E-mail da sua conta"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        placeholder="voce@email.com"
        defaultValue={values?.email}
        error={errors.email}
        onChange={() => clearField("email")}
        disabled={disabled}
        required
      />
      <SubmitButton pendingText="Enviando..." disabled={disabled}>
        Enviar link de recuperação
      </SubmitButton>
      <p className="text-center text-sm text-[#555555]">
        Lembrou a senha?{" "}
        <Link href="/entrar" className="font-semibold text-brand-blue hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
