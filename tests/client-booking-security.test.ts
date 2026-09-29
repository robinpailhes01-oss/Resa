import { describe, expect, it, vi } from "vitest";
import type { Db } from "@/server/db";
import { upsertClient } from "@/server/app/clients";

const input = { firstName: "Intrus", lastName: "Autre", email: "client@example.com", phone: "0600000000", notes: "À ignorer" };
const existing = {
  id: "client-1", establishment_id: "salon-1", first_name: "Camille", last_name: "Client",
  email: input.email, phone: "0700000000", notes: "Note privée", created_at: new Date("2026-01-01"),
};

describe("coordonnées des clients lors d'une réservation", () => {
  it.each([
    { phone: existing.phone, first_name: existing.first_name },
    { phone: null, first_name: "" },
  ])("ne modifie jamais une fiche existante, même incomplète (%j)", async (fields) => {
    const row = { ...existing, ...fields };
    const tx = vi.fn().mockResolvedValueOnce([row]);
    const client = await upsertClient("salon-1", input, tx as unknown as Db);
    expect(client).toMatchObject({ id: row.id, firstName: row.first_name, lastName: row.last_name, phone: row.phone, notes: row.notes });
    // Aucun UPDATE ni INSERT après la recherche : la réservation ne peut pas
    // altérer la fiche en fournissant simplement l'email d'une autre personne.
    expect(tx).toHaveBeenCalledTimes(1);
    expect(tx.mock.calls[0].slice(1)).toEqual(["salon-1", input.email]);
  });

  it("crée toujours un nouveau client lorsque cet email est absent du salon", async () => {
    const tx = vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([{
      ...existing, establishment_id: "salon-2", first_name: input.firstName, last_name: input.lastName, phone: input.phone,
    }]);
    const client = await upsertClient("salon-2", input, tx as unknown as Db);
    expect(tx.mock.calls[0].slice(1)).toEqual(["salon-2", input.email]);
    expect(tx.mock.calls[1].slice(1)).toEqual(["salon-2", input.firstName, input.lastName, input.email, input.phone, input.notes]);
    expect(client).toMatchObject({ establishmentId: "salon-2", firstName: input.firstName, phone: input.phone });
  });
});
