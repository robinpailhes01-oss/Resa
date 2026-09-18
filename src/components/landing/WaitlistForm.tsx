"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { offer } from "@/config/offer";
import { businessTypes, teamSizes, waitlist } from "@/content/fr/landing";
import { track } from "@/lib/analytics";
import Link from "next/link";

type FormState =
  | { phase: "idle" }
  | { phase: "submitting" }
  | { phase: "success" }
  | { phase: "error"; kind: "generic" | "rate_limited" };

type InitialState = "ok" | "email" | "limite" | "erreur" | null;

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@.]+(?:\.[^\s@.]+)+$/;

function newKey(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function readAttribution(): Record<string, string> | undefined {
  try {
    const params = new URLSearchParams(window.location.search);
    const out: Record<string, string> = {};
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
      const value = params.get(key);
      if (value) out[key] = value.slice(0, 64);
    }
    return Object.keys(out).length ? out : undefined;
  } catch {
    return undefined;
  }
}

export function WaitlistForm({ initialState }: { initialState: InitialState }) {
  const [state, setState] = useState<FormState>(() =>
    initialState === "ok"
      ? { phase: "success" }
      : initialState === "limite"
        ? { phase: "error", kind: "rate_limited" }
        : initialState === "erreur"
          ? { phase: "error", kind: "generic" }
          : { phase: "idle" },
  );
  const [emailError, setEmailError] = useState<string | null>(initialState === "email" ? waitlist.errors.email : null);
  const [touchedInvalid, setTouchedInvalid] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const keyRef = useRef<string>("");
  const baseId = useId();

  useEffect(() => {
    keyRef.current = newKey();
  }, []);

  const validateEmail = (value: string) => {
    const valid = EMAIL_RE.test(value.trim()) && value.trim().length <= 254;
    setEmailError(valid ? null : waitlist.errors.email);
    return valid;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "");

    if (!validateEmail(email)) {
      setTouchedInvalid(true);
      emailRef.current?.focus();
      track({ name: "waitlist_error", category: "validation" });
      return;
    }

    setState({ phase: "submitting" });
    track({ name: "waitlist_submit", launch_mode: offer.launchMode });

    const payload: Record<string, unknown> = {
      email: email.trim(),
      businessType: String(data.get("businessType") ?? "") || undefined,
      teamSize: String(data.get("teamSize") ?? "") || undefined,
      locale: "fr",
      privacyVersion: offer.privacyVersion,
      source: "landing",
      attribution: readAttribution(),
      idempotencyKey: keyRef.current || newKey(),
      website: String(data.get("website") ?? ""),
    };

    let response: Response;
    try {
      response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Réseau indisponible : la clé d'idempotence est conservée pour le réessai.
      setState({ phase: "error", kind: "generic" });
      track({ name: "waitlist_error", category: "server" });
      return;
    }

    if (response.status === 202) {
      setState({ phase: "success" });
      track({ name: "waitlist_accepted", source: "landing" });
      return;
    }

    // Le serveur a répondu : une nouvelle tentative est une nouvelle demande.
    keyRef.current = newKey();

    if (response.status === 422) {
      setState({ phase: "idle" });
      setEmailError(waitlist.errors.email);
      setTouchedInvalid(true);
      emailRef.current?.focus();
      track({ name: "waitlist_error", category: "validation" });
      return;
    }
    if (response.status === 429) {
      setState({ phase: "error", kind: "rate_limited" });
      track({ name: "waitlist_error", category: "rate_limit" });
      return;
    }
    setState({ phase: "error", kind: "generic" });
    track({ name: "waitlist_error", category: "server" });
  };

  const submitting = state.phase === "submitting";

  if (state.phase === "success") {
    return (
      <div role="status" aria-live="polite">
        <StatusMessage tone="success">{waitlist.success}</StatusMessage>
      </div>
    );
  }

  return (
    <form
      method="post"
      action="/api/waitlist"
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-5"
      aria-describedby={`${baseId}-legal`}
    >
      <input type="hidden" name="privacyVersion" value={offer.privacyVersion} />
      {/* Champ piège exclu du parcours accessible (§13). */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor={`${baseId}-website`}>Ne pas remplir ce champ</label>
        <input id={`${baseId}-website`} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <Input
        ref={emailRef}
        id={`${baseId}-email`}
        name="email"
        type="email"
        label={waitlist.fields.email.label}
        placeholder={waitlist.fields.email.placeholder}
        autoComplete="email"
        inputMode="email"
        maxLength={254}
        required
        error={emailError}
        onBlur={(event) => {
          if (touchedInvalid) validateEmail(event.currentTarget.value);
        }}
        onChange={() => {
          if (touchedInvalid && emailError) setEmailError(null);
        }}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          id={`${baseId}-business`}
          name="businessType"
          label={waitlist.fields.businessType.label}
          placeholder={waitlist.fields.businessType.empty}
          options={businessTypes}
        />
        <Select
          id={`${baseId}-team`}
          name="teamSize"
          label={waitlist.fields.teamSize.label}
          placeholder={waitlist.fields.teamSize.empty}
          options={teamSizes}
        />
      </div>

      <div aria-live="polite" role="status">
        {state.phase === "error" ? (
          <StatusMessage tone="error">
            {state.kind === "rate_limited" ? waitlist.errors.rateLimited : waitlist.errors.generic}
          </StatusMessage>
        ) : null}
      </div>

      <Button type="submit" disabled={submitting} aria-busy={submitting} fullWidth className="sm:w-auto sm:self-start">
        {submitting ? waitlist.submitting : waitlist.submit}
      </Button>

      <p id={`${baseId}-legal`} className="text-small text-ink-muted">
        {waitlist.legal.before}
        <Link href={waitlist.legal.linkHref} className="font-medium text-brand underline underline-offset-4">
          {waitlist.legal.linkLabel}
        </Link>
      </p>
    </form>
  );
}
