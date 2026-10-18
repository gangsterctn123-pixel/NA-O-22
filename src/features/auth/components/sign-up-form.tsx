"use client";

import Link from "next/link";
import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { signUpAction } from "../actions";
import { signUpSchema, type AuthFormState } from "../schemas";
import { Field, FormAlert, PasswordField } from "./form-fields";
import { SubmitButton } from "./submit-button";
import { useClientValidation } from "./use-client-validation";

const initial: AuthFormState = { status: "idle" };

export function SignUpForm({ disabled }: { disabled?: boolean }) {
  const [state, action] = useActionState(signUpAction, initial);
  const serverErrors = state.status === "error" ? state.fieldErrors : undefined;
  const { errors, onSubmit, clearField } = useClientValidation(signUpSchema, serverErrors);
  const values = state.status === "error" ? state.values : undefined;

  if (state.status === "success") {
    return (
      <div className="space-y-5 text-center" data-testid="signup-success">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
          <MailCheck className="size-7" aria-hidden />
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-black">Confirme seu e-mail</h2>
          <p className="mt-2 text-[#555555]">
            {state.message} Enviamos para <strong className="text-black">{state.email}</strong>.
          </p>
        </div>
        <FormAlert tone="info">Não recebeu? Confira a pasta de spam ou aguarde alguns minutos antes de tentar de novo.</FormAlert>
        <Link href="/entrar" className="inline-block font-semibold text-brand-blue hover:underline">
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form action={action} onSubmit={onSubmit} noValidate className="space-y-4" key={JSON.stringify(values ?? {})}>
      {state.status === "error" && state.message && <FormAlert tone="error">{state.message}</FormAlert>}

      <Field
        label="Nome completo"
        name="fullName"
        autoComplete="name"
        placeholder="Seu nome e sobrenome"
        defaultValue={values?.fullName}
        error={errors.fullName}
        onChange={() => clearField("fullName")}
        disabled={disabled}
        required
      />
      <Field
        label="Nome de usuário"
        name="username"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="ex.: joao_silva"
        hint="3 a 20 caracteres: letras minúsculas, números ou _."
        defaultValue={values?.username}
        error={errors.username}
        onChange={() => clearField("username")}
        disabled={disabled}
        required
      />
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
        autoComplete="new-password"
        hint="Mínimo de 8 caracteres, com letras e números."
        error={errors.password}
        onChange={() => clearField("password")}
        disabled={disabled}
        required
      />
      <PasswordField
        label="Confirmar senha"
        name="confirmPassword"
        autoComplete="new-password"
        error={errors.confirmPassword}
        onChange={() => clearField("confirmPassword")}
        disabled={disabled}
        required
      />

      <div className="space-y-1.5">
        <label className="flex items-start gap-3 text-sm text-[#555555]">
          <input
            type="checkbox"
            name="terms"
            className="mt-0.5 size-5 shrink-0 rounded accent-brand-blue"
            aria-invalid={Boolean(errors.terms)}
            onChange={() => clearField("terms")}
            disabled={disabled}
          />
          <span>
            Li e aceito os{" "}
            <Link href="/termos" target="_blank" className="font-semibold text-brand-blue hover:underline">
              Termos de uso
            </Link>{" "}
            e a{" "}
            <Link href="/privacidade" target="_blank" className="font-semibold text-brand-blue hover:underline">
              Política de privacidade
            </Link>
            .
          </span>
        </label>
        {errors.terms && (
          <p role="alert" className="text-sm text-red-700">
            {errors.terms}
          </p>
        )}
      </div>

      <SubmitButton pendingText="Criando conta..." disabled={disabled}>
        Criar minha conta
      </SubmitButton>

      <p className="text-center text-sm text-[#555555]">
        <Link href="/entrar" className="font-semibold text-brand-blue hover:underline">
          Já tenho uma conta — Entrar
        </Link>
      </p>
    </form>
  );
}
