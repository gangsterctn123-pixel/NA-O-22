"use client";

import { useState } from "react";
import type { z } from "zod";
import { toFieldErrors, type FieldErrors } from "../schemas";

/**
 * Valida no navegador antes de enviar (feedback imediato). O servidor valida de novo:
 * a validação do cliente é só conveniência.
 */
export function useClientValidation(schema: z.ZodType, serverErrors?: FieldErrors) {
  // chaves presentes com `undefined` escondem o erro do servidor de um campo já editado
  const [overrides, setOverrides] = useState<FieldErrors | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const result = schema.safeParse(Object.fromEntries(new FormData(form)));
    if (!result.success) {
      event.preventDefault();
      setOverrides(toFieldErrors(result.error));
      setTimeout(() => form.querySelector<HTMLInputElement>("[aria-invalid=true]")?.focus(), 0);
    } else {
      setOverrides(null);
    }
  }

  function clearField(name: string) {
    setOverrides((prev) => ({ ...(prev ?? {}), [name]: undefined }));
  }

  const errors: FieldErrors = overrides && Object.values(overrides).some(Boolean)
    ? overrides
    : { ...(serverErrors ?? {}), ...(overrides ?? {}) };

  return { errors, onSubmit, clearField, resetOverrides: () => setOverrides(null) };
}
