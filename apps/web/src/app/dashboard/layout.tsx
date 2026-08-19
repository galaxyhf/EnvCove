import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { requireUser } from "@/lib/authorization";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login");
  return (
    <div className="min-h-screen">
      <DashboardNav name={user.name} />
      <main className="md:pl-60">
        <div className="mx-auto max-w-7xl p-5 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
