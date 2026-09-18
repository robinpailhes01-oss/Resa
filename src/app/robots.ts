import type { MetadataRoute } from "next";
import { offer } from "@/config/offer";

const indexable = process.env.NODE_ENV === "production" && process.env.RESO_INDEXABLE === "true";

export default function robots(): MetadataRoute.Robots {
  if (!indexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/confirmer-inscription", "/desinscription"],
    },
    sitemap: `${offer.siteUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}
