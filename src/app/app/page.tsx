import { redirect } from "next/navigation";
import { getUserEstablishment, requireUser } from "@/server/auth/guards";

export default async function AppIndexPage() {
  const user = await requireUser("/app");
  const establishment = await getUserEstablishment(user.id);
  redirect(establishment ? "/app/agenda" : "/app/bienvenue");
}
