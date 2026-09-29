import { describe, expect, it, vi } from "vitest";
import { findPlaces, resolveGoogleLink } from "@/server/google/places";

describe("sécurité des liens importés depuis Google", () => {
  it.each([
    "http://127.0.0.1:8080/private", "https://127.0.0.1/private",
    "https://[::1]/", "https://169.254.169.254/", "https://localhost/",
    "https://attacker.invalid/", "https://www.google.com.attacker.invalid/maps",
    "https://www.google.com@attacker.invalid/", "https://user:password@www.google.com/maps",
    "https://www.google.com:8443/maps", "http://www.google.com/maps",
  ])("refuse %s avant tout appel réseau", async (url) => {
    const fetchMock = vi.fn<typeof fetch>();
    await expect(findPlaces(url, fetchMock)).rejects.toThrow("Lien Google non reconnu");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["http://127.0.0.1:8080/", "https://attacker.invalid/", "//169.254.169.254/", "http://www.google.com/maps"])(
    "bloque une redirection vers %s avant de la suivre", async (location) => {
      const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 302, headers: { location } }));
      await expect(resolveGoogleLink("https://maps.app.goo.gl/example", fetchMock)).rejects.toThrow("destination non autorisée");
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][1]?.redirect).toBe("manual");
    },
  );

  it("conserve les liens courts et les redirections relatives Google", async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: "https://www.google.fr/maps" } }))
      .mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: "/maps/place/Salon" } }))
      .mockResolvedValueOnce(new Response(null));
    await expect(resolveGoogleLink("maps.app.goo.gl/example", fetchMock)).resolves.toBe("https://www.google.fr/maps/place/Salon");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("valide aussi la destination du paramètre de consentement", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => new Response(null));
    const base = "https://consent.google.com/?continue=";
    await expect(resolveGoogleLink(base + encodeURIComponent("https://attacker.invalid/google.com/maps"), fetchMock)).rejects.toThrow("destination non autorisée");
    await expect(resolveGoogleLink(base + encodeURIComponent("https://www.google.com/maps/place/Salon"), fetchMock)).resolves.toBe("https://www.google.com/maps/place/Salon");
  });

  it("interrompt les boucles de redirection", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => new Response(null, { status: 302, headers: { location: "/loop" } }));
    await expect(resolveGoogleLink("https://www.google.com/loop", fetchMock)).rejects.toThrow("trop de redirections");
    expect(fetchMock).toHaveBeenCalledTimes(6);
  });
});
