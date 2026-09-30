"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { pageEditor } from "@/content/fr/app";

const t = pageEditor.photos;
const MAX_SIDE = 1600;

/** Redimensionne et compresse la photo dans le navigateur (JPEG, 1 600 px au plus) avant l'envoi. */
async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const quality of [0.82, 0.7, 0.55]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size <= 900_000) return blob;
  }
  throw new Error("trop lourde");
}

export function PhotoUploader({
  action,
  remaining,
  multiple = true,
  label = t.add,
  inputId = "photo-upload",
}: {
  action: (fd: FormData) => Promise<{ ok: true } | { error: string }>;
  remaining: number;
  multiple?: boolean;
  label?: string;
  inputId?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [progress, setProgress] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [, startTransition] = useTransition();

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files).slice(0, Math.max(0, remaining));
    setMessage(null);
    let added = 0;
    let lastError: string | null = remaining <= 0 || files.length > remaining ? t.errors.limit : null;
    for (const [i, file] of list.entries()) {
      setProgress(t.adding(i + 1, list.length));
      try {
        const blob = await compress(file);
        const fd = new FormData();
        fd.set("photo", new File([blob], "photo.jpg", { type: "image/jpeg" }));
        const result = await action(fd);
        if ("error" in result) lastError = result.error;
        else added += 1;
      } catch {
        lastError = t.errors.read;
      }
    }
    setProgress(null);
    if (input.current) input.current.value = "";
    setMessage(lastError && added === 0 ? { tone: "error", text: lastError } : { tone: "success", text: `${t.done(added)}${lastError ? ` ${lastError}` : ""}` });
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col gap-3">
      <input ref={input} type="file" accept="image/*" multiple={multiple} className="sr-only" id={inputId} onChange={(e) => onFiles(e.target.files)} />
      <div>
        <Button type="button" size="compact" disabled={Boolean(progress) || remaining <= 0} aria-busy={Boolean(progress)} onClick={() => input.current?.click()}>
          <ImagePlus aria-hidden="true" /> {progress ?? label}
        </Button>
      </div>
      <div aria-live="polite">{message ? <StatusMessage tone={message.tone}>{message.text}</StatusMessage> : null}</div>
    </div>
  );
}
