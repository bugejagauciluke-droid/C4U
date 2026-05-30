"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PenSquare, Settings, Heart, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", Icon: LayoutDashboard },
  { href: "/dashboard/admin", label: "Live Data", Icon: ShieldCheck },
  { href: "/dashboard/site", label: "Site Editor", Icon: PenSquare },
  { href: "/dashboard/settings", label: "Settings", Icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-white">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full gradient-c4u-soft flex items-center justify-center">
              <Heart className="h-3.5 w-3.5 text-white fill-white" />
            </div>
            <span className="font-bold gradient-text">C4U Admin</span>
          </div>
        </div>
        <nav className="p-3 space-y-0.5 flex-1">
          {NAV.map((item) => {
            const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={cn("flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                  active ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                <item.Icon className="h-4 w-4" />{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-muted transition-colors">
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 bg-muted/20">{children}</div>
    </div>
  );
}
