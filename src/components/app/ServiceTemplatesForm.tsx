import { ActionForm } from "@/components/app/ActionForm";
import { Card } from "@/components/app/PageHeader";
import { formatDuration } from "@/lib/time";
import { addServiceTemplatesAction } from "@/server/app/actions/catalog";
import type { ServiceTemplate } from "@/content/fr/service-templates";

/** Cases à cocher des prestations types de l'activité ; création en un clic. */
export function ServiceTemplatesForm({ templates }: { templates: ServiceTemplate[] }) {
  return (
    <Card className="mb-6">
      <h2 className="text-[18px] font-semibold text-ink">Démarrez avec des prestations types</h2>
      <p className="mt-1 text-[14px] leading-6 text-ink-muted">Cochez celles que vous proposez : durées et prix indicatifs, modifiables ensuite en un clic.</p>
      <ActionForm action={addServiceTemplatesAction} submitLabel="Ajouter les prestations cochées" pendingLabel="Ajout…" className="mt-4 flex flex-col gap-4">
        <ul className="grid gap-2 sm:grid-cols-2">
          {templates.map((t, index) => (
            <li key={t.key}>
              <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-line bg-card px-3.5 py-2.5 text-[14px] text-ink hover:border-ink/20 has-[:checked]:border-brand has-[:checked]:bg-soft-tint/60">
                <input type="checkbox" name="template" value={t.key} defaultChecked={index < 3} className="size-4 accent-brand" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{t.name}</span>
                  <span className="block text-[12.5px] text-ink-muted">
                    {formatDuration(t.durationMin)} · {t.price} €
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </ActionForm>
    </Card>
  );
}
