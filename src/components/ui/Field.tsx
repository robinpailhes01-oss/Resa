import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const controlBase =
  "block w-full min-h-12 rounded-field border bg-card px-4 text-[16px] leading-6 text-ink placeholder:text-ink-muted/70 transition-colors duration-150 focus:border-brand focus:outline-none focus-visible:outline-3 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:bg-page";

type FieldShellProps = {
  id: string;
  label: string;
  help?: ReactNode;
  error?: string | null;
  children: (aria: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": true | undefined;
  }) => ReactNode;
};

export function FieldShell({ id, label, help, error, children }: FieldShellProps) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[15px] font-semibold text-ink">
        {label}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {help ? (
        <p id={helpId} className="text-small text-ink-muted">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="flex items-start gap-1.5 text-small font-medium text-error">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-0.5 size-4 shrink-0" fill="currentColor">
            <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-.9 4.5h1.8v5h-1.8v-5Zm.9 8.3a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Z" />
          </svg>
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

type InputProps = Omit<ComponentProps<"input">, "id" | "className"> & {
  id: string;
  label: string;
  help?: ReactNode;
  error?: string | null;
  className?: string;
};

export function Input({ id, label, help, error, className, ...rest }: InputProps) {
  return (
    <FieldShell id={id} label={label} help={help} error={error}>
      {(aria) => (
        <input
          {...aria}
          className={cn(controlBase, error ? "border-error" : "border-control", className)}
          {...rest}
        />
      )}
    </FieldShell>
  );
}

type SelectProps = Omit<ComponentProps<"select">, "id" | "className"> & {
  id: string;
  label: string;
  help?: ReactNode;
  error?: string | null;
  placeholder: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  className?: string;
};

export function Select({ id, label, help, error, placeholder, options, className, ...rest }: SelectProps) {
  return (
    <FieldShell id={id} label={label} help={help} error={error}>
      {(aria) => (
        <div className="relative">
          <select
            {...aria}
            className={cn(controlBase, "appearance-none pr-11", error ? "border-error" : "border-control", className)}
            {...rest}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-ink-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </FieldShell>
  );
}
