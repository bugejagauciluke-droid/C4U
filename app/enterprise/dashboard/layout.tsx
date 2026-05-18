import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { EnterpriseNav } from "./enterprise-nav";

export default async function EnterpriseDashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = (user.privateMetadata ?? {}) as Record<string, unknown>;

  // Must be an enterprise admin to access this dashboard
  if (!meta.enterpriseAdmin) {
    redirect("/enterprise");
  }

  const companyName = (meta.companyName as string) ?? "Your Company";
  const companyId = (meta.companyId as string) ?? "";

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <EnterpriseNav companyName={companyName} />
      <div className="flex-1 min-w-0 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
