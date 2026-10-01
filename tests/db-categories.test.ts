/**
 * Rubriques de la page de réservation contre la base de test : création, ordre,
 * rattachement des prestations (jamais à la rubrique d'un autre établissement),
 * suppression sans perdre les prestations. Ignoré sans TEST_DATABASE_URL.
 */
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

describe.skipIf(!url)("rubriques de prestations", () => {
  const sql = postgres(url ?? "postgres://invalid", { max: 1, prepare: false, onnotice: () => {} });
  const stamp = Date.now();
  let userId = "";
  const establishments: string[] = [];

  beforeAll(async () => {
    const [u] = await sql`insert into users (email, password_hash, full_name) values (${`rubriques+${stamp}@example.com`}, 'x', 'Rubriques') returning id`;
    userId = u.id;
    for (const n of [1, 2]) {
      const [e] = await sql`insert into establishments (owner_user_id, name, slug) values (${userId}, ${`Rubriques ${n}`}, ${`rubriques-${n}-${stamp}`}) returning id`;
      establishments.push(e.id);
    }
  });

  afterAll(async () => {
    for (const id of establishments) await sql`delete from establishments where id = ${id}`;
    if (userId) await sql`delete from users where id = ${userId}`;
    await sql.end();
  });

  it("crée, réordonne, range les prestations et les garde à la suppression", async () => {
    const categories = await import("@/server/app/categories");
    const services = await import("@/server/app/services");
    const [mine, other] = establishments;
    const info = await categories.createCategory(mine, { title: "🚨 Merci de lire", description: "Arrivez 5 minutes avant." });
    const ongles = await categories.createCategory(mine, { title: "💅 Ongles", description: null });
    const foreign = await categories.createCategory(other, { title: "Ailleurs", description: null });
    expect((await categories.listCategories(mine)).map((c) => c.title)).toEqual(["🚨 Merci de lire", "💅 Ongles"]);

    await categories.moveCategory(mine, ongles.id, "up");
    expect((await categories.listCategories(mine)).map((c) => c.id)).toEqual([ongles.id, info.id]);

    const base = { description: null, durationMin: 30, bufferMin: 0, priceCents: 2000, active: true, practitionerIds: [] };
    const pose = await services.createService(mine, { ...base, name: "Pose", categoryId: ongles.id });
    const depose = await services.createService(mine, { ...base, name: "Dépose", categoryId: ongles.id });
    const libre = await services.createService(mine, { ...base, name: "Libre" });
    const piege = await services.createService(mine, { ...base, name: "Piège", categoryId: foreign.id });
    expect(piege.categoryId).toBeNull();
    expect(libre.categoryId).toBeNull();

    // La mise à jour sans rubrique dans le formulaire ne la change pas ; avec, elle la change.
    await services.updateService(mine, pose.id, { ...base, name: "Pose gel" });
    expect((await services.getService(mine, pose.id))?.categoryId).toBe(ongles.id);
    await services.updateService(mine, libre.id, { ...base, name: "Libre", categoryId: foreign.id });
    expect((await services.getService(mine, libre.id))?.categoryId).toBeNull();

    // L'ordre change au sein de la rubrique, sans toucher aux autres prestations.
    await services.moveService(mine, depose.id, "up");
    const ordered = (await services.listServices(mine)).map((s) => s.name);
    expect(ordered.indexOf("Dépose")).toBeLessThan(ordered.indexOf("Pose gel"));
    await services.moveService(mine, depose.id, "up");
    expect((await services.listServices(mine)).map((s) => s.name)).toEqual(ordered);

    // Un autre établissement ne peut ni modifier ni supprimer la rubrique.
    expect(await categories.updateCategory(other, ongles.id, { title: "Volé", description: null })).toBe(false);
    await categories.deleteCategory(other, ongles.id);
    expect((await categories.listCategories(mine)).map((c) => c.title)).toContain("💅 Ongles");

    await categories.deleteCategory(mine, ongles.id);
    expect((await services.getService(mine, pose.id))?.categoryId).toBeNull();
    expect((await services.listServices(mine)).length).toBe(4);
  });
});
