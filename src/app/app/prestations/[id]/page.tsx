import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/app/ConfirmButton";
import { Card, PageHeader } from "@/components/app/PageHeader";
import { ServiceForm } from "@/components/app/ServiceForm";
import { requireEstablishment } from "@/server/auth/guards";
import { deleteServiceAction, updateServiceAction } from "@/server/app/actions/catalog";
import { listPractitioners } from "@/server/app/practitioners";
import { getService } from "@/server/app/services";
import { PhotoUploader } from "@/components/app/PhotoUploader";
import { pageEditor } from "@/content/fr/app";
import { removeServicePhotoAction, uploadServicePhotoAction } from "@/server/app/actions/page";

export const metadata: Metadata = { title: "Prestation" };

export default async function PrestationPage({ params }: { params: Promise<{ id: string }> }) {
  const { establishment } = await requireEstablishment();
  const { id } = await params;
  const [service, practitioners] = await Promise.all([getService(establishment.id, id), listPractitioners(establishment.id)]);
  if (!service) notFound();
  const remove = deleteServiceAction.bind(null, service.id);
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={service.name}
        actions={
          <ConfirmButton action={remove} variant="danger" confirm="Supprimer cette prestation ? Si des rendez-vous y sont liés, elle sera simplement masquée.">
            Supprimer
          </ConfirmButton>
        }
      />
      <Card className="mb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {service.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={service.photoUrl} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover ring-1 ring-line sm:w-48" />
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-page text-center text-[13px] text-ink-muted ring-1 ring-line sm:w-48">
              {pageEditor.servicePhoto.empty}
            </div>
          )}
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-[18px]">{pageEditor.servicePhoto.title}</h2>
              <p className="mt-1 text-[14px] leading-6 text-ink-muted">{pageEditor.servicePhoto.help}</p>
            </div>
            <div className="flex flex-wrap items-start gap-2">
              <PhotoUploader
                action={uploadServicePhotoAction.bind(null, service.id)}
                remaining={1}
                multiple={false}
                inputId="service-photo"
                label={service.photoUrl ? pageEditor.servicePhoto.replace : pageEditor.servicePhoto.add}
              />
              {service.photoUrl ? (
                <ConfirmButton action={removeServicePhotoAction.bind(null, service.id)} variant="danger" confirm={pageEditor.servicePhoto.removeConfirm}>
                  {pageEditor.servicePhoto.remove}
                </ConfirmButton>
              ) : null}
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <ServiceForm action={updateServiceAction} service={service} practitioners={practitioners} submitLabel="Enregistrer" />
      </Card>
    </div>
  );
}
