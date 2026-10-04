import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { ActionForm } from "@/components/app/ActionForm";
import { ConfirmButton } from "@/components/app/ConfirmButton";
import { TextArea, TextInput } from "@/components/app/Fields";
import { Card, EmptyState, PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { categoriesEditor as c } from "@/content/fr/app";
import { formatDuration, formatPriceCents } from "@/lib/time";
import { requireEstablishment } from "@/server/auth/guards";
import { listCategories, type ServiceCategory } from "@/server/app/categories";
import { listPractitioners } from "@/server/app/practitioners";
import { listServices, type Service } from "@/server/app/services";
import { createCategoryAction, deleteCategoryAction, moveCategoryAction, moveServiceAction, updateCategoryAction } from "@/server/app/actions/catalog";
import { ServiceTemplatesForm } from "@/components/app/ServiceTemplatesForm";
import { templatesFor } from "@/content/fr/service-templates";

export const metadata: Metadata = { title: "Prestations" };

const iconButton = "!min-h-9 !w-9 !px-0";

export default async function PrestationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { establishment } = await requireEstablishment();
  const params = await searchParams;
  const [services, practitioners, categories] = await Promise.all([listServices(establishment.id, true), listPractitioners(establishment.id), listCategories(establishment.id)]);
  const byId = new Map(practitioners.map((p) => [p.id, p.name]));
  const known = new Set(categories.map((cat) => cat.id));
  const loose = services.filter((s) => s.categoryId === null || !known.has(s.categoryId));

  const serviceRows = (list: Service[]) => (
    <ul className="divide-y divide-line">
      {list.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2 pr-3 md:pr-4">
          <Link href={`/app/prestations/${s.id}`} className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4 transition-colors hover:bg-page md:px-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-[16px] font-semibold text-ink">{s.name}</span>
                {!s.active ? <span className="rounded-full bg-page px-2 py-0.5 text-[11px] font-medium text-ink-muted ring-1 ring-line">Masquée</span> : null}
              </div>
              <div className="mt-0.5 text-[13px] text-ink-muted">
                {formatDuration(s.durationMin)}
                {s.bufferMin ? ` + ${s.bufferMin} min de battement` : ""}
                {" · "}
                {s.practitionerIds.length === 0 ? "tous les praticiens" : s.practitionerIds.map((id) => byId.get(id)).filter(Boolean).join(", ")}
              </div>
            </div>
            <div className="text-[16px] font-semibold text-brand">{s.priceCents > 0 ? formatPriceCents(s.priceCents) : "—"}</div>
          </Link>
          {list.length > 1 ? <MoveButtons first={i === 0} last={i === list.length - 1} up={moveServiceAction.bind(null, s.id, "up")} down={moveServiceAction.bind(null, s.id, "down")} /> : null}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Prestations"
        intro="Ce que vos clientes peuvent réserver, avec la durée et le prix."
        actions={
          <Button href="/app/prestations/nouvelle" size="compact">
            <Plus aria-hidden="true" /> Ajouter une prestation
          </Button>
        }
      />
      {params.bienvenue ? (
        <StatusMessage tone="success" className="mb-6">
          Votre établissement est créé. Ajoutez maintenant vos prestations, puis votre équipe et vos horaires.
        </StatusMessage>
      ) : null}
      {params.types ? (
        <StatusMessage tone="success" className="mb-6">
          Prestations ajoutées. Ouvrez chacune pour ajuster la durée, le prix ou la description.
        </StatusMessage>
      ) : null}
      {services.length === 0 && categories.length === 0 ? (
        <>
          <ServiceTemplatesForm templates={templatesFor(establishment.businessType)} />
          <EmptyState
            title="Ou ajoutez une prestation à la main"
            text="Nom, durée et prix : elle apparaîtra aussitôt sur votre page de réservation."
            action={
              <Button href="/app/prestations/nouvelle" variant="secondary">
                <Plus aria-hidden="true" /> Ajouter une prestation
              </Button>
            }
          />
        </>
      ) : (
        <>
          <Card className="mb-6">
            <div id="rubriques" className="scroll-mt-24">
              <h2 className="heading-3">{c.title}</h2>
              <p className="mt-1 max-w-2xl text-[14px] leading-6 text-ink-muted">{c.help}</p>
              <p className="mt-1 text-[13px] text-ink-muted">{c.examples}</p>
            </div>
            {categories.length === 0 ? (
              <p className="mt-5 rounded-xl bg-page px-4 py-4 text-[14px] text-ink-muted">{c.empty}</p>
            ) : (
              <ul className="mt-5 flex flex-col gap-2">
                {categories.map((cat, i) => (
                  <CategoryRow key={cat.id} category={cat} count={services.filter((s) => s.categoryId === cat.id).length} first={i === 0} last={i === categories.length - 1} />
                ))}
              </ul>
            )}
            <details className="group mt-4">
              <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-button px-1 py-2 text-[15px] font-semibold text-brand [&::-webkit-details-marker]:hidden">
                <Plus aria-hidden="true" className="size-4" /> {c.add}
              </summary>
              <div className="mt-3 rounded-2xl bg-page p-4 ring-1 ring-line md:p-5">
                <ActionForm action={createCategoryAction} submitLabel={c.create}>
                  <CategoryFields idPrefix="new" />
                </ActionForm>
              </div>
            </details>
          </Card>

          <h2 className="heading-3">{c.servicesTitle}</h2>
          <p className="mb-4 mt-1 text-[14px] text-ink-muted">{c.servicesHelp}</p>
          <div className="flex flex-col gap-5">
            {categories.map((cat) => {
              const list = services.filter((s) => s.categoryId === cat.id);
              return (
                <Card key={cat.id} className="!p-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3 md:px-6">
                    <h3 className="text-[16px] font-semibold text-ink">{cat.title}</h3>
                    <Link href={`/app/prestations/nouvelle?rubrique=${cat.id}`} className="inline-flex items-center gap-1 text-[14px] font-medium text-brand underline-offset-4 hover:underline">
                      <Plus aria-hidden="true" className="size-4" /> {c.addHere}
                    </Link>
                  </div>
                  {list.length === 0 ? <p className="px-5 py-4 text-[14px] text-ink-muted md:px-6">{cat.description ? c.infoOnly : c.count(0)}</p> : serviceRows(list)}
                </Card>
              );
            })}
            {loose.length > 0 ? (
              <Card className="!p-0">
                {categories.length > 0 ? (
                  <div className="border-b border-line px-5 py-3 md:px-6">
                    <h3 className="text-[16px] font-semibold text-ink-muted">{c.none}</h3>
                  </div>
                ) : null}
                {serviceRows(loose)}
              </Card>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

function MoveButtons({ first, last, up, down }: { first: boolean; last: boolean; up: () => Promise<void>; down: () => Promise<void> }) {
  return (
    <span className="flex shrink-0 gap-1">
      {first ? (
        <span aria-hidden="true" className="w-9" />
      ) : (
        <ConfirmButton action={up} variant="ghost" className={iconButton}>
          <ChevronUp aria-hidden="true" />
          <span className="sr-only">{c.up}</span>
        </ConfirmButton>
      )}
      {last ? (
        <span aria-hidden="true" className="w-9" />
      ) : (
        <ConfirmButton action={down} variant="ghost" className={iconButton}>
          <ChevronDown aria-hidden="true" />
          <span className="sr-only">{c.down}</span>
        </ConfirmButton>
      )}
    </span>
  );
}

function CategoryFields({ idPrefix, category }: { idPrefix: string; category?: ServiceCategory }) {
  return (
    <>
      <TextInput id={`${idPrefix}-title`} name="title" label={c.titleLabel} placeholder={c.titlePlaceholder} maxLength={120} required defaultValue={category?.title} />
      <TextArea id={`${idPrefix}-description`} name="description" label={c.descriptionLabel} help={c.descriptionHelp} maxLength={1500} rows={3} defaultValue={category?.description ?? ""} />
    </>
  );
}

function CategoryRow({ category, count, first, last }: { category: ServiceCategory; count: number; first: boolean; last: boolean }) {
  const movable = !(first && last);
  return (
    <li className="relative rounded-2xl bg-page ring-1 ring-line">
      <details className="group">
        <summary className={`flex cursor-pointer list-none items-center gap-3 py-3 pl-4 [&::-webkit-details-marker]:hidden ${movable ? "pr-24" : "pr-4"}`}>
          <span className="min-w-0 flex-1">
            <span className="block line-clamp-2 text-[15px] font-semibold leading-5 text-ink">{category.title}</span>
            <span className="block text-[13px] text-ink-muted">
              {count === 0 && category.description ? c.infoOnly : c.count(count)}
              {count > 0 && category.description ? ` · ${c.infoOnly.toLowerCase()}` : ""}
            </span>
          </span>
          <span className="text-[14px] font-medium text-brand">{c.edit}</span>
        </summary>
        <div className="border-t border-line px-4 pb-4 pt-4">
          <ActionForm
            action={updateCategoryAction.bind(null, category.id)}
            submitLabel={c.save}
            aside={
              <ConfirmButton action={deleteCategoryAction.bind(null, category.id)} variant="danger" confirm={c.removeConfirm}>
                {c.remove}
              </ConfirmButton>
            }
          >
            <CategoryFields idPrefix={category.id} category={category} />
          </ActionForm>
        </div>
      </details>
      {/* Hors du résumé : un clic sur les flèches ne déplie pas la rubrique. */}
      {movable ? (
        <div className="absolute right-2 top-[14px]">
          <MoveButtons first={first} last={last} up={moveCategoryAction.bind(null, category.id, "up")} down={moveCategoryAction.bind(null, category.id, "down")} />
        </div>
      ) : null}
    </li>
  );
}
