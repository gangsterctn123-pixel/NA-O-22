"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction } from "../actions";
import { signInSchema, type AuthFormState } from "../schemas";
import { Field, FormAlert, PasswordField } from "./form-fields";
import { SubmitButton } from "./submit-button";
import { useClientValidation } from "./use-client-validation";

const initial: AuthFormState = { status: "idle" };

export function SignInForm({ next, disabled }: { next?: string; disabled?: boolean }) {
  const [state, action] = useActionState(signInAction, initial);
  const serverErrors = state.status === "error" ? state.fieldErrors : undefined;
  const { errors, onSubmit, clearField } = useClientValidation(signInSchema, serverErrors);
  const values = state.status === "error" ? state.values : undefined;

  return (
    <form action={action} onSubmit={onSubmit} noValidate className="space-y-4" key={JSON.stringify(values ?? {})}>
      {state.status === "error" && state.message && <FormAlert tone="error">{state.message}</FormAlert>}
      {next && <input type="hidden" name="next" value={next} />}

      <Field
        label="E-mail"
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
      <PasswordField
        label="Senha"
        name="password"
        autoComplete="current-password"
        error={errors.password}
        onChange={() => clearField("password")}
        disabled={disabled}
        required
      />
      <div className="flex justify-end">
        <Link href="/recuperar-senha" className="text-sm font-semibold text-brand-blue hover:underline">
          Esqueci minha senha
        </Link>
      </div>

      <SubmitButton pendingText="Entrando..." disabled={disabled}>
        Entrar
      </SubmitButton>

      <p className="text-center text-sm text-[#555555]">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-brand-blue hover:underline">
          Criar uma conta
        </Link>
      </p>
    </form>
  );
}
