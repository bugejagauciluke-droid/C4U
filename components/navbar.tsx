"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, HandHeart, LayoutDashboard, Sparkles, Menu, X, User, Building2 } from "lucide-react";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV = [
  { href: "/support",    label: "Get Support", Icon: HandHeart,       highlight: true  },
  { href: "/premium",    label: "Premium",     Icon: Sparkles,        highlight: false },
  { href: "/enterprise", label: "For Teams",   Icon: Building2,       highlight: false },
  { href: "/dashboard",  label: "Dashboard",   Icon: LayoutDashboard, highlight: false },
];

export function Navbar({ appName = "C4U" }: { appName?: string }) {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl" onClick={() => setMenuOpen(false)}>
          <span className="h-8 w-8 rounded-full gradient-c4u-soft flex items-center justify-center shadow-sm">
            <Heart className="h-4 w-4 text-white fill-white" />
          </span>
          <span className="gradient-text">{appName}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                item.highlight
                  ? "gradient-c4u-soft text-white shadow-sm hover:opacity-90"
                  : pathname.startsWith(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}>
              <item.Icon className="h-4 w-4" />{item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2">
          {isSignedIn ? (
            <>
              <Link href="/account">
                <Button variant="soft" size="sm"><User className="h-4 w-4" /> My account</Button>
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton mode="modal" fallbackRedirectUrl="/onboarding">
                <Button variant="outline" size="sm">Sign in</Button>
              </SignInButton>
              <Link href="/support">
                <Button variant="soft" size="sm">I need support now</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile right */}
        <div className="flex md:hidden items-center gap-2">
          {isSignedIn && <UserButton />}
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-xl hover:bg-muted transition-colors">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 space-y-1">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                item.highlight
                  ? "gradient-c4u-soft text-white"
                  : pathname.startsWith(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}>
              <item.Icon className="h-4 w-4" />{item.label}
            </Link>
          ))}
          {isSignedIn ? (
            <Link href="/account" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
              <User className="h-4 w-4" /> My account
            </Link>
          ) : (
            <div className="pt-2">
              <SignInButton mode="modal">
                <Button variant="gradient" size="sm" className="w-full" onClick={() => setMenuOpen(false)}>
                  Sign in
                </Button>
              </SignInButton>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
