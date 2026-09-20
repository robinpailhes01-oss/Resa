"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useFieldError } from "./FormContext";

const control =
  "block w-full min-h-12 rounded-field border border-control bg-card px-4 text-[16px] leading-6 text-ink placeholder:text-ink-muted/70 focus:border-brand focus:outline-none focus-visible:outline-3 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:bg-page";

export function Field({
  id,
  label,
  help,
  error,
  children,
}: {
  id: string;
  label: string;
  help?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[15px] font-semibold text-ink">
        {label}
      </label>
      {children}
      {help ? <p className="text-small text-ink-muted">{help}</p> : null}
      {error ? (
        <p className="text-small font-medium text-error">{error}</p>
      ) : null}
    </div>
  );
}

export function TextInput({
  id,
  label,
  help,
  error: errorProp,
  className,
  ...rest
}: ComponentProps<"input"> & {
  id: string;
  label: string;
  help?: ReactNode;
  error?: string;
}) {
  const contextError = useFieldError(rest.name);
  const error = errorProp ?? contextError;
  return (
    <Field id={id} label={label} help={help} error={error}>
      <input
        id={id}
        className={cn(control, error && "border-error", className)}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
    </Field>
  );
}

export function TextArea({
  id,
  label,
  help,
  error: errorProp,
  className,
  ...rest
}: ComponentProps<"textarea"> & {
  id: string;
  label: string;
  help?: ReactNode;
  error?: string;
}) {
  const contextError = useFieldError(rest.name);
  const error = errorProp ?? contextError;
  return (
    <Field id={id} label={label} help={help} error={error}>
      <textarea
        id={id}
        className={cn(
          control,
          "min-h-28 py-3",
          error && "border-error",
          className,
        )}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
    </Field>
  );
}

export function SelectInput({
  id,
  label,
  help,
  error: errorProp,
  options,
  placeholder,
  className,
  ...rest
}: ComponentProps<"select"> & {
  id: string;
  label: string;
  help?: ReactNode;
  error?: string;
  placeholder?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  const contextError = useFieldError(rest.name);
  const error = errorProp ?? contextError;
  return (
    <Field id={id} label={label} help={help} error={error}>
      <select
        id={id}
        className={cn(
          control,
          "appearance-none",
          error && "border-error",
          className,
        )}
        aria-invalid={error ? true : undefined}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Checkbox({
  id,
  label,
  help,
  ...rest
}: ComponentProps<"input"> & { id: string; label: string; help?: ReactNode }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input
        id={id}
        type="checkbox"
        className="mt-1 size-5 shrink-0 accent-brand"
        {...rest}
      />
      <span>
        <span className="block text-[15px] font-medium text-ink">{label}</span>
        {help ? (
          <span className="block text-small text-ink-muted">{help}</span>
        ) : null}
      </span>
    </label>
  );
}

export function Toggle({
  id,
  label,
  help,
  ...rest
}: ComponentProps<"input"> & { id: string; label: string; help?: ReactNode }) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-page px-4 py-3"
    >
      <span>
        <span className="block text-[15px] font-semibold text-ink">
          {label}
        </span>
        {help ? (
          <span className="block text-small text-ink-muted">{help}</span>
        ) : null}
      </span>
      <span className="relative inline-flex shrink-0">
        <input id={id} type="checkbox" className="peer sr-only" {...rest} />
        <span className="h-7 w-12 rounded-full bg-line transition-colors peer-checked:bg-brand peer-focus-visible:outline-3 peer-focus-visible:outline-brand peer-focus-visible:outline-offset-2" />
        <span className="absolute left-1 top-1 size-5 rounded-full bg-white shadow-card transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export const Grid2 = ({ children }: { children: ReactNode }) => (
  <div className="grid gap-5 sm:grid-cols-2">{children}</div>
);
