import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardNav } from "@/components/dashboard-nav";
export default async function Layout({ children }: { children: React.ReactNode }) { const session = await auth(); if (!session?.user) redirect("/login"); return <div className="min-h-screen"><DashboardNav email={session.user.email} /><main className="md:pl-60"><div className="mx-auto max-w-7xl p-5 sm:p-8">{children}</div></main></div>; }
