import type { MetadataRoute } from "next";
import { offer } from "@/config/offer";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = offer.siteUrl.replace(/\/$/, "");
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/confidentialite`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
