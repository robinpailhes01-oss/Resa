import { isAuthorizedInternal } from "@/server/http";
import { prospectsCsv } from "@/server/prospection";

export const runtime = "nodejs";

/**
 * Export CSV des prospects (à ouvrir dans un tableur). Autorisé par l'en-tête
 * habituel ou, pour un téléchargement depuis un navigateur, par `?token=<INTERNAL_TASKS_SECRET>`.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim();
  const secret = process.env.INTERNAL_TASKS_SECRET?.trim();
  const byToken = Boolean(token && secret && token === secret);
  if (!isAuthorizedInternal(request) && !byToken) return new Response("forbidden", { status: 403 });
  const csv = await prospectsCsv();
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="prospects-reso-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
