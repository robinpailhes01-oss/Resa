"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/components/app/ActionForm";
import { requireEstablishment } from "@/server/auth/guards";
import { PRACTITIONER_LIMIT, countActivePractitioners, createPractitioner, deletePractitioner, updatePractitioner } from "../practitioners";
import { createService, deleteService, updateService } from "../services";
import { GENERIC_ERROR, bool, fieldErrors, int, priceToCents, str } from "./shared";
import { templatesFor } from "@/content/fr/service-templates";

const serviceSchema = z.object({
  name: z.string().trim().min(2, "Indiquez le nom de la prestation.").max(80),
  description: z.string().trim().max(400).transform((v) => v || null),
  durationMin: z.number().int().min(5, "Durée minimale : 5 minutes.").max(720),
  bufferMin: z.number().int().min(0).max(240),
  priceCents: z.number().int().min(0),
  active: z.boolean(),
  practitionerIds: z.array(z.string().uuid()).max(20),
});

function readService(fd: FormData) {
  return serviceSchema.safeParse({
    name: fd.get("name"),
    description: fd.get("description") ?? "",
    durationMin: int(fd, "durationMin", 60),
    bufferMin: int(fd, "bufferMin", 0),
    priceCents: priceToCents(str(fd, "price")),
    active: fd.has("active") ? bool(fd, "active") : true,
    practitionerIds: fd.getAll("practitionerIds").map(String),
  });
}

export async function createServiceAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { establishment } = await requireEstablishment();
  const parsed = readService(fd);
  if (!parsed.success) return fieldErrors(parsed.error);
  try {
    await createService(establishment.id, parsed.data);
  } catch (error) {
    console.error("[app] création prestation", error instanceof Error ? error.message : error);
    return { error: GENERIC_ERROR };
  }
  revalidatePath("/app/prestations");
  redirect("/app/prestations");
}

export async function updateServiceAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { establishment } = await requireEstablishment();
  const id = str(fd, "id");
  const parsed = readService(fd);
  if (!parsed.success) return fieldErrors(parsed.error);
  try {
    await updateService(establishment.id, id, parsed.data);
  } catch (error) {
    console.error("[app] mise à jour prestation", error instanceof Error ? error.message : error);
    return { error: GENERIC_ERROR };
  }
  revalidatePath("/app/prestations");
  redirect("/app/prestations");
}

export async function deleteServiceAction(id: string): Promise<void> {
  const { establishment } = await requireEstablishment();
  await deleteService(establishment.id, id);
  revalidatePath("/app/prestations");
  redirect("/app/prestations");
}

const practitionerSchema = z.object({
  name: z.string().trim().min(2, "Indiquez le prénom.").max(80),
  roleTitle: z.string().trim().max(80).transform((v) => v || null),
  color: z.enum(["soft", "accent", "success"]),
  active: z.boolean(),
});

export async function createPractitionerAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { establishment } = await requireEstablishment();
  const parsed = practitionerSchema.safeParse({ name: fd.get("name"), roleTitle: fd.get("roleTitle") ?? "", color: fd.get("color") ?? "soft", active: true });
  if (!parsed.success) return fieldErrors(parsed.error);
  if ((await countActivePractitioners(establishment.id)) >= PRACTITIONER_LIMIT) {
    return { error: `Votre offre comprend jusqu’à ${PRACTITIONER_LIMIT} praticiens actifs.` };
  }
  try {
    await createPractitioner(establishment.id, parsed.data);
  } catch (error) {
    console.error("[app] création praticien", error instanceof Error ? error.message : error);
    return { error: GENERIC_ERROR };
  }
  revalidatePath("/app/equipe");
  redirect("/app/equipe");
}

export async function updatePractitionerAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { establishment } = await requireEstablishment();
  const id = str(fd, "id");
  const parsed = practitionerSchema.safeParse({ name: fd.get("name"), roleTitle: fd.get("roleTitle") ?? "", color: fd.get("color") ?? "soft", active: bool(fd, "active") });
  if (!parsed.success) return fieldErrors(parsed.error);
  if (parsed.data.active) {
    const active = await countActivePractitioners(establishment.id);
    const current = await import("../practitioners").then((m) => m.getPractitioner(establishment.id, id));
    if (current && !current.active && active >= PRACTITIONER_LIMIT) {
      return { error: `Votre offre comprend jusqu’à ${PRACTITIONER_LIMIT} praticiens actifs.` };
    }
  }
  try {
    await updatePractitioner(establishment.id, id, parsed.data);
  } catch (error) {
    console.error("[app] mise à jour praticien", error instanceof Error ? error.message : error);
    return { error: GENERIC_ERROR };
  }
  revalidatePath("/app/equipe");
  redirect("/app/equipe");
}

export async function deletePractitionerAction(id: string): Promise<void> {
  const { establishment } = await requireEstablishment();
  await deletePractitioner(establishment.id, id);
  revalidatePath("/app/equipe");
  redirect("/app/equipe");
}


/** Crée d'un coup les prestations types cochées à l'onboarding (durées et prix modifiables ensuite). */
export async function addServiceTemplatesAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { establishment } = await requireEstablishment();
  const keys = new Set(fd.getAll("template").map(String));
  const chosen = templatesFor(establishment.businessType).filter((t) => keys.has(t.key));
  if (chosen.length === 0) return { error: "Cochez au moins une prestation." };
  try {
    for (const t of chosen) {
      await createService(establishment.id, {
        name: t.name,
        description: t.description ?? null,
        durationMin: t.durationMin,
        bufferMin: 0,
        priceCents: Math.round(t.price * 100),
        active: true,
        practitionerIds: [],
      });
    }
  } catch (error) {
    console.error("[app] prestations types", error instanceof Error ? error.message : error);
    return { error: GENERIC_ERROR };
  }
  revalidatePath("/app/prestations");
  redirect("/app/prestations?types=ok");
}
