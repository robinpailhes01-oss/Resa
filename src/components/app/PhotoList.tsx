import { Trash2 } from "lucide-react";
import { ActionForm } from "@/components/app/ActionForm";
import { Card } from "@/components/app/PageHeader";
import { deletePhotoAction } from "@/server/app/actions/establishment";
import type { EstablishmentPhoto } from "@/server/app/photos";

/** Photos affichées sur la page de réservation (importées de la fiche Google). */
export function PhotoList({ photos }: { photos: EstablishmentPhoto[] }) {
  return (
    <Card className="mb-6">
      <h2 className="text-[18px]">Photos de la page de réservation</h2>
      <p className="mt-1 text-[14px] leading-6 text-ink-muted">
        {photos.length === 0
          ? "Aucune photo pour l’instant. Les photos sont importées automatiquement depuis votre fiche Google lors de la création de l’établissement ; l’ajout manuel arrive bientôt."
          : "Importées depuis votre fiche Google. Retirez celles que vous ne souhaitez pas afficher."}
      </p>
      {photos.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.id} className="group relative overflow-hidden rounded-xl ring-1 ring-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <ActionForm action={deletePhotoAction} submitLabel="Retirer" pendingLabel="…" variant="secondary" className="absolute bottom-2 right-2">
                <input type="hidden" name="photoId" value={photo.id} />
                <span className="sr-only">
                  <Trash2 aria-hidden="true" />
                </span>
              </ActionForm>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
