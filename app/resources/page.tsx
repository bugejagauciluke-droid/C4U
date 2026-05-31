import Link from "next/link";
import { Phone, MessageSquare, Globe, Clock, Shield, Heart, ExternalLink, AlertTriangle } from "lucide-react";
import { MALTA, UK, IRELAND, ITALY, INTERNATIONAL, type CrisisOrg, type CountryResources } from "@/lib/crisis-resources";

export const metadata = { title: "Crisis Resources — C4U" };

const COUNTRIES = [MALTA, UK, IRELAND, ITALY, INTERNATIONAL];

const TYPE_CONFIG = {
  addiction:     { label: "Addiction & Recovery",  color: "bg-amber-100 text-amber-700",    dot: "bg-amber-400" },
  mental_health: { label: "Mental Health",          color: "bg-violet-100 text-violet-700",  dot: "bg-violet-400" },
  emergency:     { label: "Emergency",              color: "bg-red-100 text-red-700",        dot: "bg-red-500" },
  general:       { label: "General Support",        color: "bg-teal-100 text-teal-700",      dot: "bg-teal-400" },
  domestic:      { label: "Domestic & Family",      color: "bg-rose-100 text-rose-700",      dot: "bg-rose-400" },
};

function OrgCard({ org }: { org: CrisisOrg }) {
  const cfg = TYPE_CONFIG[org.type];
  return (
    <div className={`bg-white rounded-2xl border border-border p-5 ${org.type === "emergency" ? "border-red-200 bg-red-50/30" : ""}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-bold text-gray-900 text-sm leading-tight">{org.name}</h3>
        <div className="flex items-center gap-2 shrink-0">
          {org.free && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">FREE</span>}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
        </div>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed mb-3">{org.description}</p>
      <div className="flex flex-wrap gap-2">
        {org.phone && (
          <a href={`tel:${org.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors">
            <Phone className="h-3 w-3" /> {org.phone}
          </a>
        )}
        {org.text && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
            <MessageSquare className="h-3 w-3" /> {org.text}
          </div>
        )}
        {org.web && (
          <a href={org.web} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors">
            <Globe className="h-3 w-3" /> Website <ExternalLink className="h-2.5 w-2.5" />
          </a>
        )}
      </div>
      <div className="flex items-center gap-1 mt-2">
        <Clock className="h-3 w-3 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground">{org.hours}</span>
      </div>
    </div>
  );
}

function CountrySection({ resources }: { resources: CountryResources }) {
  const emergency = resources.orgs.find(o => o.type === "emergency");
  const addiction = resources.orgs.filter(o => o.type === "addiction");
  const other     = resources.orgs.filter(o => o.type !== "addiction" && o.type !== "emergency");

  return (
    <div className="space-y-4">
      {/* Emergency banner */}
      <div className="bg-red-600 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-200 shrink-0" />
          <div>
            <p className="text-white font-black text-sm">Life at risk? Call emergency services now.</p>
            <p className="text-red-200 text-xs mt-0.5">Overdose · Unconscious · Immediate danger</p>
          </div>
        </div>
        <a href={`tel:${resources.emergency}`}
          className="shrink-0 bg-white text-red-600 font-black text-lg px-5 py-2 rounded-xl hover:bg-red-50 transition-colors">
          {resources.emergency}
        </a>
      </div>

      {/* Addiction */}
      {addiction.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide px-1 mb-2">Addiction & Recovery</p>
          <div className="space-y-3">{addiction.map((o, i) => <OrgCard key={i} org={o} />)}</div>
        </div>
      )}

      {/* Other */}
      {other.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide px-1 mb-2">Mental Health & General Support</p>
          <div className="space-y-3">{other.map((o, i) => <OrgCard key={i} org={o} />)}</div>
        </div>
      )}
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-serene">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center mx-auto shadow-lg">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900">Real Help. Real People.</h1>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
            C4U supports you — but these organisations are trained professionals who specialise in exactly what you're going through.
            All resources listed are <strong>free, confidential, and available now.</strong>
          </p>
        </div>

        {/* Legal positioning */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3">
          <Heart className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-1">C4U's position on professional help</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              C4U provides emotional support, evidence-based exercises, and crisis guidance. We are not a medical service
              and do not replace therapists, doctors, or addiction specialists. If your situation is serious,
              please reach out to the professionals below — they are equipped to help in ways we are not.
            </p>
          </div>
        </div>

        {/* Country tabs */}
        {COUNTRIES.map((country) => (
          <section key={country.code} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-lg font-black text-gray-900">{country.country}</h2>
            </div>
            <CountrySection resources={country} />
          </section>
        ))}

        {/* Disclaimer */}
        <div className="border-t border-border pt-8 text-center space-y-2">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
            Numbers verified May 2025. If you find an out-of-date number please email us.
            C4U is not affiliated with any organisation listed above.
          </p>
          <p className="text-xs text-muted-foreground">
            In any life-threatening emergency, always call <strong>112</strong> (EU) or your local emergency number first.
          </p>
          <Link href="/" className="inline-block mt-4 text-sm text-primary hover:underline">← Back to C4U</Link>
        </div>
      </div>
    </div>
  );
}
