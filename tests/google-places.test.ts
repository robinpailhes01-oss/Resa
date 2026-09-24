import { describe, expect, it } from "vitest";
import { guessBusinessType, mapGoogleOpeningHours, parseHoursJson, parsePlaceCandidates } from "@/lib/google-places";

describe("mapGoogleOpeningHours", () => {
  it("convertit les périodes Google en plages par jour", () => {
    const hours = mapGoogleOpeningHours([
      { open: { day: 1, hour: 9, minute: 0 }, close: { day: 1, hour: 12, minute: 30 } },
      { open: { day: 1, hour: 14, minute: 0 }, close: { day: 1, hour: 19, minute: 0 } },
      { open: { day: 6, hour: 10, minute: 0 }, close: { day: 6, hour: 18, minute: 0 } },
    ]);
    expect(hours).toEqual({ 1: [[540, 750], [840, 1140]], 6: [[600, 1080]] });
  });

  it("coupe à minuit une plage qui déborde sur le lendemain et gère 24 h/24", () => {
    expect(mapGoogleOpeningHours([{ open: { day: 5, hour: 20, minute: 0 }, close: { day: 6, hour: 2, minute: 0 } }])).toEqual({ 5: [[1200, 1440]] });
    const allDay = mapGoogleOpeningHours([{ open: { day: 0, hour: 0, minute: 0 } }]);
    expect(allDay?.[3]).toEqual([[0, 1440]]);
    expect(mapGoogleOpeningHours([])).toBeNull();
  });
});

describe("parsePlaceCandidates", () => {
  it("extrait adresse, téléphone, type et horaires", () => {
    const [place] = parsePlaceCandidates({
      places: [
        {
          id: "abc",
          displayName: { text: "Maison Alba" },
          formattedAddress: "12 rue de la Loge, 34000 Montpellier, France",
          addressComponents: [
            { longText: "12", types: ["street_number"] },
            { longText: "Rue de la Loge", types: ["route"] },
            { longText: "Montpellier", types: ["locality"] },
            { longText: "34000", types: ["postal_code"] },
          ],
          nationalPhoneNumber: "04 67 00 00 00",
          primaryType: "nail_salon",
          regularOpeningHours: { periods: [{ open: { day: 2, hour: 9, minute: 0 }, close: { day: 2, hour: 18, minute: 0 } }] },
        },
        { displayName: { text: "Sans identifiant" } },
      ],
    });
    expect(place).toMatchObject({ placeId: "abc", name: "Maison Alba", addressLine: "12 Rue de la Loge", city: "Montpellier", postalCode: "34000", phone: "04 67 00 00 00", businessType: "onglerie" });
    expect(place.hours).toEqual({ 2: [[540, 1080]] });
    expect(parsePlaceCandidates({ places: [{ displayName: { text: "x" } }] })).toHaveLength(0);
  });

  it("devine l'activité Reso", () => {
    expect(guessBusinessType("hair_salon")).toBe("coiffure_barbier");
    expect(guessBusinessType("spa")).toBe("spa_soins");
    expect(guessBusinessType(undefined)).toBe("institut");
    expect(guessBusinessType("restaurant")).toBe("autre");
  });
});

describe("parseHoursJson", () => {
  it("accepte des horaires valides et rejette le reste", () => {
    expect(parseHoursJson(JSON.stringify({ 1: [[540, 1140]], 2: [] }))).toEqual({ 1: [[540, 1140]] });
    expect(parseHoursJson("")).toBeNull();
    expect(parseHoursJson("{bad")).toBeNull();
    expect(parseHoursJson(JSON.stringify({ 9: [[0, 60]] }))).toBeNull();
    expect(parseHoursJson(JSON.stringify({ 1: [[600, 540]] }))).toBeNull();
    expect(parseHoursJson(JSON.stringify({ 1: [[0, 2000]] }))).toBeNull();
  });
});

describe("photos et présentation", () => {
  it("extrait les noms de photos valides et le résumé", async () => {
    const { parsePlaceCandidates, parsePhotoNames, isPhotoName } = await import("@/lib/google-places");
    const [place] = parsePlaceCandidates({
      places: [
        {
          id: "p1",
          displayName: { text: "Salon" },
          editorialSummary: { text: "  Un salon chaleureux au centre-ville.  " },
          photos: [{ name: "places/p1/photos/abc_DEF-123" }, { name: "https://evil" }, {}],
        },
      ],
    });
    expect(place.description).toBe("Un salon chaleureux au centre-ville.");
    expect(place.photoNames).toEqual(["places/p1/photos/abc_DEF-123"]);
    expect(isPhotoName("places/p1/photos/x")).toBe(true);
    expect(isPhotoName(`places/ChIJabc/photos/${"A".repeat(900)}-_.~`)).toBe(true);
    expect(isPhotoName("places/p1/photos/x/../y")).toBe(false);
    expect(parsePhotoNames(JSON.stringify(["places/a/photos/b", "nope"]))).toEqual(["places/a/photos/b"]);
    expect(parsePhotoNames("{")).toEqual([]);
  });
});

describe("note, avis et métadonnées", () => {
  it("lit la note, le nombre d'avis et le lien Maps", async () => {
    const { parsePlaceCandidates, parseGoogleMeta, googleWriteReviewUrl } = await import("@/lib/google-places");
    const [place] = parsePlaceCandidates({ places: [{ id: "p1", displayName: { text: "Salon" }, rating: 4.86, userRatingCount: 36, googleMapsUri: "https://maps.google.com/?cid=1" }] });
    expect(place.rating).toBe(4.9);
    expect(place.ratingCount).toBe(36);
    expect(place.mapsUrl).toBe("https://maps.google.com/?cid=1");
    expect(parseGoogleMeta(JSON.stringify({ rating: 4.9, ratingCount: 36, mapsUrl: "https://maps.google.com/?cid=1" }))).toEqual({ rating: 4.9, ratingCount: 36, mapsUrl: "https://maps.google.com/?cid=1" });
    expect(parseGoogleMeta(JSON.stringify({ rating: 7, ratingCount: -1, mapsUrl: "https://evil.example" }))).toEqual({ rating: null, ratingCount: null, mapsUrl: null });
    expect(googleWriteReviewUrl("ChIJ")).toBe("https://search.google.com/local/writereview?placeid=ChIJ");
  });
});
