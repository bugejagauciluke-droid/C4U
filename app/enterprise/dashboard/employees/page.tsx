"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Copy, CheckCircle2, Mail, Loader2, Link2,
  UserPlus, Trash2, Clock, CheckCircle, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock employee data — in production this comes from your DB via API
const MOCK_EMPLOYEES = [
  { id: "1", email: "sarah.k@company.com",  joinedAt: "2026-04-10", status: "active",   lastActive: "Today"      },
  { id: "2", email: "james.m@company.com",  joinedAt: "2026-04-11", status: "active",   lastActive: "Yesterday"  },
  { id: "3", email: "priya.r@company.com",  joinedAt: "2026-04-15", status: "active",   lastActive: "3 days ago" },
  { id: "4", email: "tom.b@company.com",    joinedAt: "2026-04-20", status: "inactive", lastActive: "3 weeks ago"},
  { id: "5", email: "anna.v@company.com",   joinedAt: "2026-05-01", status: "invited",  lastActive: "—"          },
  { id: "6", email: "david.l@company.com",  joinedAt: "2026-05-02", status: "invited",  lastActive: "—"          },
];

const STATUS_CONFIG = {
  active:   { label: "Active",   dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50"  },
  inactive: { label: "Inactive", dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50"    },
  invited:  { label: "Invited",  dot: "bg-sky-400",     text: "text-sky-700",     bg: "bg-sky-50"      },
};

export default function EmployeesPage() {
  const [employees] = useState(MOCK_EMPLOYEES);
  const [inviteEmails, setInviteEmails] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteLink = typeof window !== "undefined"
    ? `${window.location.origin}/join/DEMO-COMPANY-CODE`
    : "https://c4ucare.netlify.app/join/DEMO-COMPANY-CODE";

  function copyLink() {
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function sendInvites() {
    if (!inviteEmails.trim()) return;
    setSending(true);
    // In production: POST to /api/enterprise/invite
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    setInviteEmails("");
    setTimeout(() => setSent(false), 3000);
  }

  const active = employees.filter(e => e.status === "active").length;
  const invited = employees.filter(e => e.status === "invited").length;
  const inactive = employees.filter(e => e.status === "inactive").length;

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage access to C4U for your team.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active", value: active, color: "text-emerald-600" },
          { label: "Invited (pending)", value: invited, color: "text-sky-600" },
          { label: "Inactive", value: inactive, color: "text-amber-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-border p-5 text-center">
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Invite section */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
        <h2 className="font-semibold flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-teal-500" /> Add employees
        </h2>

        {/* Invite link */}
        <div>
          <p className="text-sm font-medium mb-2">Share your company invite link</p>
          <div className="flex items-center gap-2 bg-slate-50 border border-border rounded-xl px-4 py-2.5">
            <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground flex-1 truncate">{inviteLink}</span>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 shrink-0"
            >
              {copied ? <><CheckCircle2 className="h-3.5 w-3.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">Anyone with this link can join your company workspace. Revoke and regenerate any time.</p>
        </div>

        {/* Email invite */}
        <div>
          <p className="text-sm font-medium mb-2">Or invite by email</p>
          <textarea
            value={inviteEmails}
            onChange={e => setInviteEmails(e.target.value)}
            rows={3}
            placeholder="Enter email addresses, separated by commas or new lines&#10;e.g. alice@company.com, bob@company.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white resize-none"
          />
          <div className="flex justify-end mt-2">
            <Button
              onClick={sendInvites}
              disabled={sending || !inviteEmails.trim()}
              size="sm"
              className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
            >
              {sending ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Sending…</> :
               sent    ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Invites sent!</> :
                         <><Mail className="h-3.5 w-3.5 mr-1.5" /> Send invites</>}
            </Button>
          </div>
        </div>
      </div>

      {/* Employee list */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-slate-50/50 flex items-center justify-between">
          <h2 className="font-semibold text-sm">All employees ({employees.length})</h2>
          <p className="text-xs text-muted-foreground">Emails are visible only to you</p>
        </div>
        <div className="divide-y divide-border">
          {employees.map(emp => {
            const cfg = STATUS_CONFIG[emp.status as keyof typeof STATUS_CONFIG];
            return (
              <div key={emp.id} className="flex items-center gap-4 px-6 py-3.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                  {emp.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{emp.email}</p>
                  <p className="text-xs text-muted-foreground">Joined {emp.joinedAt} · Last active: {emp.lastActive}</p>
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
                <button className="text-muted-foreground/40 hover:text-rose-400 transition-colors p-1">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
