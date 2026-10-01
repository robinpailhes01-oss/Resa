import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/app/PageHeader";
import { ServiceForm } from "@/components/app/ServiceForm";
import { requireEstablishment } from "@/server/auth/guards";
import { createServiceAction } from "@/server/app/actions/catalog";
import { listPractitioners } from "@/server/app/practitioners";
import { listCategories } from "@/server/app/categories";

export const metadata: Metadata = { title: "Nouvelle prestation" };

export default async function NouvellePrestationPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { establishment } = await requireEstablishment();
  const { rubrique } = await searchParams;
  const [practitioners, categories] = await Promise.all([listPractitioners(establishment.id), listCategories(establishment.id)]);
  const defaultCategoryId = categories.find((c) => c.id === rubrique)?.id ?? null;
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Nouvelle prestation" />
      <Card>
        <ServiceForm action={createServiceAction} practitioners={practitioners} categories={categories} defaultCategoryId={defaultCategoryId} submitLabel="Ajouter la prestation" />
      </Card>
    </div>
  );
}
