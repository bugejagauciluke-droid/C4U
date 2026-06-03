"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Watch, CheckCircle2, Loader2, Upload, ExternalLink,
  Smartphone, ArrowLeft, AlertCircle, Info, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

const DEVICES = [
  {
    id: "apple",
    name: "Apple Watch",
    subtitle: "via Apple Health export",
    color: "from-slate-700 to-slate-900",
    icon: "🍎",
    methods: ["export"],
    exportSteps: [
      { step: 1, text: "Open the Health app on your iPhone" },
      { step: 2, text: "Tap your profile picture (top right)" },
      { step: 3, text: "Scroll down → tap Export All Health Data" },
      { step: 4, text: "Share/save the .zip file — then upload it below" },
    ],
    exportNote: "The zip contains export.xml — C4U automatically extracts sleep, heart rate, HRV, steps and SpO2.",
    fileHint: "Upload the export.xml file (from inside the zip) or the full .zip",
    fileType: "apple",
    fileAccept: ".xml,.zip",
    terraSupported: true,
  },
  {
    id: "samsung",
    name: "Samsung Galaxy Watch",
    subtitle: "via Samsung Health export",
    color: "from-indigo-600 to-blue-800",
    icon: "🔵",
    methods: ["export"],
    exportSteps: [
      { step: 1, text: "Open Samsung Health on your phone" },
      { step: 2, text: "Tap ☰ (menu) → Settings" },
      { step: 3, text: "Scroll to Help → Download Personal Data" },
      { step: 4, text: "Request the download — you'll get an email with CSV files" },
      { step: 5, text: "Upload the heart rate, sleep and step CSV files below" },
    ],
    exportNote: "Upload each CSV separately — C4U detects the type automatically.",
    fileHint: "com.samsung.health.heart_rate.csv / sleep / step_daily_trend",
    fileType: "samsung",
    fileAccept: ".csv",
    terraSupported: true,
  },
  {
    id: "fitbit",
    name: "Fitbit / Google Pixel Watch",
    subtitle: "via Terra OAuth (automatic sync)",
    color: "from-teal-500 to-emerald-700",
    icon: "💪",
    methods: ["terra", "export"],
    exportSteps: [
      { step: 1, text: "Open the Fitbit app" },
      { step: 2, text: "Go to Account → Export Data (or use fitbit.com/settings/data/export)" },
      { step: 3, text: "Select date range and export as CSV" },
      { step: 4, text: "Upload the sleep and activity CSV files" },
    ],
    exportNote: "Fitbit exports detailed data including sleep stages.",
    fileHint: "sleep-YYYY-MM-DD.csv or heartrate-YYYY-MM-DD.csv",
    fileType: "fitbit",
    fileAccept: ".csv",
    terraSupported: true,
  },
  {
    id: "garmin",
    name: "Garmin",
    subtitle: "Best HRV data available",
    color: "from-sky-500 to-blue-700",
    icon: "🏃",
    methods: ["export"],
    exportSteps: [
      { step: 1, text: "Open Garmin Connect app or connect.garmin.com" },
      { step: 2, text: "Account Settings → Export Your Data" },
      { step: 3, text: "Request export — download when ready" },
      { step: 4, text: "Upload the Activities or Health Snapshot CSV" },
    ],
    exportNote: "Garmin provides excellent HRV (Body Battery) data.",
    fileHint: "Health_Snapshot_*.csv or Activities.csv",
    fileType: "garmin",
    fileAccept: ".csv,.fit",
    terraSupported: true,
  },
  {
    id: "generic",
    name: "Any other device",
    subtitle: "Upload CSV with date, sleep, heart rate",
    color: "from-violet-500 to-purple-700",
    icon: "📊",
    methods: ["export"],
    exportSteps: [
      { step: 1, text: "Export data from your device's app" },
      { step: 2, text: "Make sure the file has columns: date, sleep (hours), heart_rate" },
      { step: 3, text: "Upload the CSV below — C4U auto-detects columns" },
    ],
    exportNote: "Supported columns: date, sleep, heart_rate, hrv, steps, mood (1-10).",
    fileHint: "Any .csv with date and health columns",
    fileType: "generic",
    fileAccept: ".csv",
    terraSupported: false,
  },
];

interface UploadResult {
  imported: number;
  platform: string;
  dateRange: { from?: string; to?: string };
}

export default function ConnectPage() {
  const [activeDevice, setActiveDevice] = useState<string | null>(null);
  const [uploading, setUploading]       = useState(false);
  const [result, setResult]             = useState<UploadResult | null>(null);
  const [error, setError]               = useState("");
  const [terralLoading, setTerraLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const device = DEVICES.find(d => d.id === activeDevice);

  async function connectTerra() {
    setTerraLoading(true);
    setError("");
    try {
      const res = await fetch("/api/wearable/terra", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // redirect to Terra OAuth widget
      } else if (data.setup) {
        setError(data.setup);
      } else {
        setError(data.error ?? "Failed to start connection");
      }
    } catch {
      setError("Network error — please try again");
    }
    setTerraLoading(false);
  }

  async function uploadFile() {
    if (!selectedFile || !device) return;
    setUploading(true);
    setError("");
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", device.fileType);

      const res = await fetch("/api/wearable/import", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload failed");
      } else {
        setResult(data);
        setSelectedFile(null);
      }
    } catch {
      setError("Network error — please try again");
    }
    setUploading(false);
  }

  return (
    <div className="min-h-full bg-serene">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/account/wearable" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center">
              <Watch className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Connect Your Watch</h1>
              <p className="text-sm text-gray-500">Link health data for personalised insights</p>
            </div>
          </div>
        </div>

        {/* Terra automatic sync banner */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-2xl p-5 text-white">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-teal-200 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-sm mb-1">Automatic sync — all devices at once</p>
              <p className="text-teal-100 text-xs leading-relaxed mb-3">
                Connect once via Terra and your data syncs automatically every day.
                Supports Apple Watch, Samsung, Fitbit, Garmin, Polar, Oura, Whoop and 50+ more.
              </p>
              <Button onClick={connectTerra} disabled={terralLoading}
                className="bg-white text-teal-700 hover:bg-teal-50 font-bold text-sm px-4 py-2 h-auto">
                {terralLoading
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Connecting…</>
                  : <><Smartphone className="h-3.5 w-3.5 mr-2" />Connect automatically</>
                }
              </Button>
              {error && error.includes("TERRA") && (
                <p className="text-teal-200 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {error}
                </p>
              )}
            </div>
          </div>
          <p className="text-teal-200 text-[10px] mt-3">
            Powered by Terra API · Your data stays private · You can disconnect any time
          </p>
        </div>

        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-semibold uppercase tracking-wide">Or import manually</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Device selector */}
        {!activeDevice && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 px-1">Choose your device to get step-by-step instructions:</p>
            {DEVICES.map(d => (
              <button key={d.id} onClick={() => setActiveDevice(d.id)}
                className="w-full flex items-center gap-4 bg-white rounded-2xl border border-border p-4 hover:border-primary/40 hover:shadow-sm transition-all text-left group">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${d.color} flex items-center justify-center text-2xl shrink-0 shadow-sm`}>
                  {d.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{d.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  {d.terraSupported && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">Auto sync</span>
                  )}
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Device-specific instructions */}
        {activeDevice && device && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => { setActiveDevice(null); setResult(null); setError(""); setSelectedFile(null); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${device.color} flex items-center justify-center text-lg`}>{device.icon}</div>
                <p className="font-bold text-gray-900">{device.name}</p>
              </div>
            </div>

            {/* Export steps */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-semibold text-sm text-gray-700 mb-4">How to export your data</h3>
              <div className="space-y-3">
                {device.exportSteps.map(s => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{s.step}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-snug">{s.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-2 bg-slate-50 rounded-xl p-3">
                <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">{device.exportNote}</p>
              </div>
            </div>

            {/* Upload area */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">Upload your file</h3>
              <p className="text-xs text-muted-foreground mb-4">{device.fileHint}</p>

              <label className="flex flex-col items-center gap-3 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/40 hover:bg-muted/20 transition-all">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    {selectedFile ? selectedFile.name : "Tap to choose file"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{device.fileAccept} files accepted</p>
                </div>
                <input type="file" accept={device.fileAccept} className="hidden"
                  onChange={e => { setSelectedFile(e.target.files?.[0] ?? null); setResult(null); setError(""); }} />
              </label>

              {selectedFile && (
                <Button onClick={uploadFile} disabled={uploading} className="w-full mt-3" variant="gradient">
                  {uploading
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processing your data…</>
                    : <><CheckCircle2 className="h-4 w-4 mr-2" />Import {selectedFile.name}</>
                  }
                </Button>
              )}

              {error && (
                <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl p-3 mt-3">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-700">{error}</p>
                </div>
              )}

              {result && (
                <div className="flex items-start gap-3 bg-teal-50 border border-teal-200 rounded-xl p-4 mt-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-teal-800">
                      {result.imported} days imported successfully!
                    </p>
                    {result.dateRange.from && (
                      <p className="text-xs text-teal-600 mt-0.5">
                        {result.dateRange.from} → {result.dateRange.to}
                      </p>
                    )}
                    <Link href="/account/wearable">
                      <p className="text-xs text-teal-700 font-semibold mt-2 hover:underline">
                        View your insights →
                      </p>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Multiple file note for Samsung */}
            {activeDevice === "samsung" && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-2">
                <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-800 leading-relaxed">
                  <strong>Samsung tip:</strong> Upload each CSV file separately — heart rate, sleep stages, and steps.
                  C4U merges them automatically into a complete picture.
                </p>
              </div>
            )}

            {/* Apple zip note */}
            {activeDevice === "apple" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-2">
                <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 space-y-1">
                  <p><strong>Apple Health tip:</strong> The export is a .zip file.</p>
                  <p>1. On iPhone: AirDrop or email the zip to your computer</p>
                  <p>2. Unzip it — find <code className="bg-slate-200 px-1 rounded">apple_health_export/export.xml</code></p>
                  <p>3. Upload the <strong>export.xml</strong> file here</p>
                  <p className="text-slate-500">The xml can be large (100MB+) — this is normal and may take 30–60 seconds to process.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* What C4U does with the data */}
        <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
          <h3 className="font-semibold text-sm text-gray-700">What C4U does with your health data</h3>
          <div className="space-y-2">
            {[
              { icon: "😴", text: "Detects if you're sleeping enough for your age group and flags patterns" },
              { icon: "❤️", text: "Reads resting heart rate trends — elevated over days = chronic stress signal" },
              { icon: "📊", text: "HRV (heart rate variability) is the gold standard stress marker — C4U interprets it age-adjusted" },
              { icon: "🔗", text: "Connects your sleep data to your diary mood scores — finds direct correlations" },
              { icon: "🎯", text: "Tells you exactly what to change tonight to improve tomorrow's data" },
              { icon: "📈", text: "Tracks your progress week-over-week as you build better habits" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-base shrink-0">{item.icon}</span>
                <p className="text-xs text-gray-700 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <p className="text-[11px] text-muted-foreground text-center leading-relaxed px-4">
          Your health data is stored securely in your account and never shared with third parties.
          C4U uses it only to generate your personal insights. You can delete it any time in account settings.
        </p>

      </div>
    </div>
  );
}
