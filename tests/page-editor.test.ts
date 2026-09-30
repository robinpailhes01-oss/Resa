import { describe, expect, it } from "vitest";
import { detectImageType } from "@/lib/image-type";
import { parsePlaceReviews } from "@/lib/google-places";

describe("type réel des photos envoyées", () => {
  it("reconnaît JPEG, PNG et WebP par leurs premiers octets", () => {
    expect(detectImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]))).toBe("image/jpeg");
    expect(detectImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe("image/png");
    expect(detectImageType(new TextEncoder().encode("RIFF\u0000\u0000\u0000\u0000WEBPVP8 "))).toBe("image/webp");
  });

  it("refuse le reste, même avec un nom trompeur", () => {
    expect(detectImageType(new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'>"))).toBeNull();
    expect(detectImageType(new TextEncoder().encode("GIF89a"))).toBeNull();
    expect(detectImageType(new Uint8Array([]))).toBeNull();
  });
});

describe("avis Google", () => {
  it("garde le texte d'origine, l'auteur et la date ; ignore les avis incomplets", () => {
    const reviews = parsePlaceReviews({
      reviews: [
        {
          name: "places/abc/reviews/1",
          rating: 5,
          text: { text: "Translated" },
          originalText: { text: "  Super accueil, je recommande !  " },
          relativePublishTimeDescription: "il y a 2 semaines",
          publishTime: "2026-09-10T10:00:00Z",
          authorAttribution: { displayName: "Léa M.", uri: "https://www.google.com/maps/contrib/1", photoUri: "https://lh3.googleusercontent.com/a/x" },
        },
        { name: "places/abc/reviews/2", rating: 4, authorAttribution: { displayName: "Sans texte" } },
        { name: "places/abc/reviews/3", rating: 9, authorAttribution: { displayName: "Note invalide" } },
        { rating: 5, authorAttribution: { displayName: "Sans identifiant" } },
        { name: "places/abc/reviews/5", rating: 3, authorAttribution: { displayName: "X", uri: "javascript:alert(1)" } },
      ],
    });
    expect(reviews).toHaveLength(3);
    expect(reviews[0]).toMatchObject({
      externalId: "places/abc/reviews/1",
      authorName: "Léa M.",
      rating: 5,
      text: "Super accueil, je recommande !",
      relativeTime: "il y a 2 semaines",
      authorPhotoUrl: "https://lh3.googleusercontent.com/a/x",
    });
    expect(reviews[0].publishedAt?.toISOString()).toBe("2026-09-10T10:00:00.000Z");
    expect(reviews[1].text).toBe("");
    expect(reviews[2].authorUrl).toBeNull();
  });
});
