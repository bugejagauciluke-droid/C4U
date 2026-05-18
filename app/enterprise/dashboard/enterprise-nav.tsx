"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, BarChart3, Settings, FileText,
  Building2, ChevronRight
} from "lucide-react";

const NAV = [
  { href: "/enterprise/dashboard",           label: "Overview",      Icon: LayoutDashboard },
  { href: "/enterprise/dashboard/employees", label: "Employees",     Icon: Users           },
  { href: "/enterprise/dashboard/insights",  label: "Insights",      Icon: BarChart3       },
  { href: "/enterprise/dashboard/reports",   label: "Reports",       Icon: FileText        },
  { href: "/enterprise/dashboard/settings",  label: "Settings",      Icon: Settings        },
];

export function EnterpriseNav({ companyName }: { companyName: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-white">
      {/* Company badge */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg gradient-c4u-soft flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">{companyName}</p>
            <p className="text-xs text-muted-foreground">Admin dashboard</p>
          </div>
        </div>
      </div>
      <nav className="p-3 space-y-0.5 flex-1">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== "/enterprise/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group
                ${active ? "bg-teal-50 text-teal-700" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-4 w-4" />{label}
              </span>
              {active && <ChevronRight className="h-3.5 w-3.5 text-teal-500" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <Link href="/enterprise" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-muted transition-colors">
          ← C4U for Teams
        </Link>
      </div>
    </aside>
  );
}
