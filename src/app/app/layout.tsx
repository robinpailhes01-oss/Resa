import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { ErrorReporter } from "@/components/tracking/ErrorReporter";
import { getUserEstablishment, requireUser } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Mon espace", robots: { index: false, follow: false } };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/app");
  const establishment = await getUserEstablishment(user.id);
  return (
    <AppShell establishment={establishment}>
      <ErrorReporter />
      {children}
    </AppShell>
  );
}
