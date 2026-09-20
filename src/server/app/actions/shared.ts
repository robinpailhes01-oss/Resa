import "server-only";
import type { z } from "zod";
import type { FormState } from "@/components/app/ActionForm";

export const GENERIC_ERROR = "Une erreur est survenue. Réessayez dans quelques instants.";

/** Convertit les erreurs Zod en messages par champ. */
export function fieldErrors(error: z.ZodError): FormState {
  const out: Record<string, string> = {};
  for (const issue of error.issues) out[String(issue.path[0] ?? "form")] ??= issue.message;
  return { fieldErrors: out };
}

export const str = (fd: FormData, key: string): string => String(fd.get(key) ?? "").trim();
export const optStr = (fd: FormData, key: string): string | null => str(fd, key) || null;
export const bool = (fd: FormData, key: string): boolean => fd.get(key) === "on" || fd.get(key) === "true";
export const int = (fd: FormData, key: string, fallback = 0): number => {
  const n = Number.parseInt(str(fd, key), 10);
  return Number.isFinite(n) ? n : fallback;
};
export const priceToCents = (value: string): number => {
  const n = Number.parseFloat(value.replace(",", ".").replace(/\s/g, ""));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : 0;
};
