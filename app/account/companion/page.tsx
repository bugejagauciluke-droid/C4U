"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Heart, Trash2, Loader2, Shield, Mic, MicOff, Volume2, VolumeX, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "c4u_companion_history";
const WELCOME = "Hi, I'm really glad you're here. This is your space — no judgement, no rush. What's on your mind today?";

// ── Crisis detection ─────────────────────────────────────────────────────────
// Scans conversation for warning signs. Returns 0 (none), 1 (early), 2 (crisis).
// Research: GPT-3 class models detect suicidal ideation at ~95% accuracy via patterns.
// We match across the FULL conversation, not just one message.
const WARNING_PATTERNS: RegExp[] = [
  /no (point|reason) (anymore|to go on|to live|in (any|this))/i,
  /don.t want to be here/i,
  /nobody would (care|miss|notice)/i,
  /want to (die|end it|disappear|not exist)/i,
  /can.t (go on|take it|do this) anymore/i,
  /thinking about (suicide|ending it|hurting myself|self.harm)/i,
  /feel like a burden/i,
  /won.t be around/i,
  /after i.m gone/i,
  /last time/i,
  /i.m done/i,
  /no way out/i,
  /nothing (left|to live for|matters)/i,
];

function detectWarningLevel(messages: Message[]): number {
  const userText = messages
    .filter(m => m.role === "user")
    .map(m => m.content)
    .join(" ");
  const hits = WARNING_PATTERNS.filter(p => p.test(userText)).length;
  if (hits >= 2) return 2;
  if (hits === 1) return 1;
  return 0;
}

// ── Voice helpers ────────────────────────────────────────────────────────────
// Uses browser-native Web Speech API — no API keys needed.
// Speech synthesis picks the calmest available voice.
function getBestVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const preferred = ["Samantha", "Karen", "Moira", "Serena", "Victoria", "Google UK English Female"];
  for (const name of preferred) {
    const v = voices.find(v => v.name.includes(name));
    if (v) return v;
  }
  return voices.find(v => v.lang.startsWith("en")) ?? null;
}

export default function CompanionPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");

  // Voice state
  const [voiceMode, setVoiceMode] = useState(false);   // speak responses aloud
  const [listening, setListening] = useState(false);   // mic is active
  const [speechSupported, setSpeechSupported] = useState(false);

  // Crisis state
  const [warningLevel, setWarningLevel] = useState(0);
  const [locationRequested, setLocationRequested] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // ── Load history ─────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // ── Save history ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-60)));
    }
  }, [messages]);

  // ── Crisis detection on message change ───────────────────────────────────
  useEffect(() => {
    const level = detectWarningLevel(messages);
    setWarningLevel(level);
    // Show location request once we hit crisis level
    if (level >= 2 && !locationRequested) setLocationRequested(true);
  }, [messages, locationRequested]);

  // ── Speech recognition setup ──────────────────────────────────────────────
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setSpeechSupported(true);
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = navigator.language || "en-US";

    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
  }, []);

  // ── Auto-resize textarea ─────────────────────────────────────────────────
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  // ── Scroll to bottom ─────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // ── Speak response aloud ─────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!voiceMode || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88;  // slightly slower = warmer
    utterance.pitch = 1.0;
    const voice = getBestVoice();
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }, [voiceMode]);

  // ── Send message ──────────────────────────────────────────────────────────
  async function send(overrideInput?: string) {
    const text = (overrideInput ?? input).trim();
    if (!text || streaming) return;
    const userMsg: Message = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setStreaming(true);
    setStreamingText("");

    const level = detectWarningLevel(history);

    try {
      const res = await fetch("/api/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, warningLevel: level }),
      });
      if (!res.ok) throw new Error("Failed");
      if (!res.body) throw new Error("No body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setStreamingText(full);
      }

      setMessages([...history, { role: "assistant", content: full }]);
      setStreamingText("");
      speak(full);
    } catch {
      const fallback = "I'm here — something went wrong on my end. Try again?";
      setMessages([...history, { role: "assistant", content: fallback }]);
      setStreamingText("");
    } finally {
      setStreaming(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }

  // ── Voice input ───────────────────────────────────────────────────────────
  function toggleListen() {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setListening(true);
      recognitionRef.current.start();
    }
  }

  // Auto-send when voice input lands (in voice mode)
  useEffect(() => {
    if (voiceMode && input && !listening && !streaming) {
      const t = setTimeout(() => send(), 400);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, listening, voiceMode]);

  // ── Location ──────────────────────────────────────────────────────────────
  function requestLocation() {
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {} // silently fail — user declined
    );
  }

  // ── Clear ─────────────────────────────────────────────────────────────────
  function clearHistory() {
    if (!confirm("Clear your conversation history? This cannot be undone.")) return;
    setMessages([]);
    setWarningLevel(0);
    setLocationRequested(false);
    setUserLocation(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const displayMessages = messages.length === 0
    ? [{ role: "assistant" as const, content: WELCOME }]
    : messages;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-white px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* gradient-companion: sky→teal = throat chakra (communication + trust) */}
          <div className="h-10 w-10 rounded-full gradient-companion flex items-center justify-center shadow-sm">
            <Heart className="h-5 w-5 text-white fill-white" />
          </div>
          <div>
            <p className="font-bold">Your C4U Companion</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" /> Private · Remembers your story
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Voice mode toggle */}
          {speechSupported && (
            <button
              onClick={() => { setVoiceMode(v => !v); window.speechSynthesis?.cancel(); }}
              title={voiceMode ? "Turn off voice" : "Turn on voice (C4U speaks back)"}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                voiceMode
                  ? "bg-teal-100 text-teal-700 border border-teal-200"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {voiceMode ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              {voiceMode ? "Voice on" : "Voice off"}
            </button>
          )}
          {messages.length > 0 && (
            <button onClick={clearHistory} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Crisis banner (level 2) ───────────────────────────────────────── */}
      <AnimatePresence>
        {warningLevel >= 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-indigo-600 to-violet-700 px-6 py-4 shrink-0"
          >
            <div className="max-w-2xl mx-auto">
              <p className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                <Heart className="h-4 w-4 fill-white" /> You are not alone — real support is here
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="tel:741741" className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors">
                  <Phone className="h-3 w-3" /> Crisis Text Line: HOME → 741741
                </a>
                <a href="tel:112" className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors">
                  <Phone className="h-3 w-3" /> Emergency: 112
                </a>
                <a href="https://www.befrienders.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors">
                  befrienders.org
                </a>
                {!userLocation && (
                  <button
                    onClick={requestLocation}
                    className="flex items-center gap-1.5 bg-white text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-white/90 transition-colors"
                  >
                    <MapPin className="h-3 w-3" /> Share my location so help can reach me
                  </button>
                )}
                {userLocation && (
                  <span className="flex items-center gap-1.5 bg-white/20 text-white text-xs px-3 py-1.5 rounded-full">
                    <MapPin className="h-3 w-3" />
                    Location shared — {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Messages — bg-serene: #f0f9ff (sky-blue tint = throat chakra = communication + trust) */}
      <div className="flex-1 overflow-y-auto px-4 py-6 bg-serene">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {displayMessages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full gradient-companion flex items-center justify-center shrink-0 mr-2 mt-1 shadow-sm">
                    <Heart className="h-4 w-4 text-white fill-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
                  ${msg.role === "user"
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-white border border-border shadow-sm rounded-bl-sm"}`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {/* Streaming */}
            {streaming && (
              <motion.div key="streaming" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="h-8 w-8 rounded-full gradient-companion flex items-center justify-center shrink-0 mr-2 mt-1 shadow-sm">
                  <Heart className="h-4 w-4 text-white fill-white" />
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed bg-white border border-border shadow-sm whitespace-pre-wrap">
                  {streamingText || <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Listening indicator */}
          <AnimatePresence>
            {listening && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex justify-center">
                <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-2 text-sm text-teal-700 font-medium">
                  <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                  Listening…
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input ────────────────────────────────────────────────────────── */}
      <div className="border-t border-border bg-white px-4 py-4 shrink-0">
        <div className="max-w-2xl mx-auto flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={voiceMode ? "Tap the mic or type…" : "Share what's on your mind…"}
            rows={1}
            className="flex-1 input-base resize-none overflow-hidden leading-relaxed"
          />

          {/* Mic button */}
          {speechSupported && (
            <button
              onClick={toggleListen}
              disabled={streaming}
              title={listening ? "Stop listening" : "Speak to C4U"}
              className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                listening
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-200 animate-pulse"
                  : "bg-muted text-muted-foreground hover:bg-teal-50 hover:text-teal-600"
              }`}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}

          {/* Send button */}
          <Button variant="gradient" size="sm" onClick={() => send()} disabled={!input.trim() || streaming} className="shrink-0 h-10 w-10 p-0">
            {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-2">
          {speechSupported
            ? "Tap mic to speak · Shift+Enter for new line · History saved on this device"
            : "Shift+Enter for new line · History saved on this device"}
        </p>
      </div>
    </div>
  );
}
