/**
 * Page de réservation éditable : photos envoyées (stockées en base, limite),
 * avis Google (le masquage survit à l'actualisation). Ignoré sans TEST_DATABASE_URL.
 */
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4]);

describe.skipIf(!url)("page de réservation : photos et avis", () => {
  const sql = postgres(url ?? "postgres://invalid", { max: 1, prepare: false, onnotice: () => {} });
  let userId = "";
  let establishmentId = "";
  const stamp = Date.now();

  beforeAll(async () => {
    const [u] = await sql`insert into users (email, password_hash, full_name) values (${`page+${stamp}@example.com`}, 'x', 'Page') returning id`;
    userId = u.id;
    const [e] = await sql`insert into establishments (owner_user_id, name, slug) values (${userId}, 'Page', ${`page-${stamp}`}) returning id`;
    establishmentId = e.id;
  });

  afterAll(async () => {
    if (establishmentId) await sql`delete from establishments where id = ${establishmentId}`;
    if (userId) await sql`delete from users where id = ${userId}`;
    await sql.end();
  });

  it("stocke la photo, la sert par son identifiant, la met en couverture et respecte la limite", async () => {
    const photos = await import("@/server/app/photos");
    await photos.addPhotos(establishmentId, ["https://lh3.googleusercontent.com/p/1"], "google");
    const id = await photos.addUploadedPhoto(establishmentId, JPEG, "image/jpeg");
    const image = await photos.getPhotoImage(id);
    expect(image?.contentType).toBe("image/jpeg");
    expect(new Uint8Array(image!.bytes)).toEqual(JPEG);
    let list = await photos.listPhotos(establishmentId);
    expect(list.map((p) => p.url)).toEqual(["https://lh3.googleusercontent.com/p/1", `/photos/${id}`]);

    await photos.movePhotoFirst(establishmentId, id);
    list = await photos.listPhotos(establishmentId);
    expect(list[0].id).toBe(id);

    for (let i = list.length; i < photos.MAX_PHOTOS; i += 1) await photos.addUploadedPhoto(establishmentId, JPEG, "image/jpeg");
    await expect(photos.addUploadedPhoto(establishmentId, JPEG, "image/jpeg")).rejects.toBeInstanceOf(photos.PhotoLimitError);
  });

  it("importe les avis, masque un avis, et le masquage survit à l'actualisation", async () => {
    const reviews = await import("@/server/app/reviews");
    const sample = [
      { externalId: "places/x/reviews/1", authorName: "Léa", authorUrl: null, authorPhotoUrl: null, rating: 5, text: "Parfait", relativeTime: "il y a 1 mois", publishedAt: new Date("2026-08-01") },
      { externalId: "places/x/reviews/2", authorName: "Tom", authorUrl: null, authorPhotoUrl: null, rating: 3, text: "Correct", relativeTime: null, publishedAt: new Date("2026-07-01") },
      { externalId: "places/x/reviews/3", authorName: "Ana", authorUrl: null, authorPhotoUrl: null, rating: 4, text: "", relativeTime: null, publishedAt: null },
    ];
    await reviews.saveGoogleReviews(establishmentId, sample);
    const all = await reviews.listReviews(establishmentId);
    expect(all).toHaveLength(3);
    const tom = all.find((r) => r.authorName === "Tom")!;
    await reviews.setReviewHidden(establishmentId, tom.id, true);

    await reviews.saveGoogleReviews(establishmentId, sample);
    expect((await reviews.listReviews(establishmentId)).find((r) => r.id === tom.id)?.hidden).toBe(true);
    // Page publique : ni l'avis masqué, ni l'avis sans texte.
    expect((await reviews.listReviews(establishmentId, { visibleOnly: true })).map((r) => r.authorName)).toEqual(["Léa"]);
  });
});
