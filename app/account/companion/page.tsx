"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Heart, Trash2, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "c4u_companion_history";
const WELCOME = "Hi, I'm so glad you're here. This is your space — no judgment, no rush. What's on your mind today?";

export default function CompanionPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  async function send() {
    if (!input.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setStreaming(true);
    setStreamingText("");

    try {
      const res = await fetch("/api/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) throw new Error("Failed to get response");
      if (!res.body) throw new Error("No response body");

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
    } catch {
      setMessages([...history, { role: "assistant", content: "I'm sorry, something went wrong. Please try again." }]);
      setStreamingText("");
    } finally {
      setStreaming(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }

  function clearHistory() {
    if (!confirm("Clear your conversation history? This cannot be undone.")) return;
    setMessages([]);
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
      {/* Header */}
      <div className="border-b border-border bg-white px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full gradient-c4u-soft flex items-center justify-center shadow-sm">
            <Heart className="h-5 w-5 text-white fill-white" />
          </div>
          <div>
            <p className="font-bold">Your C4U Companion</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" /> Private · Remembers your story
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearHistory} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="h-3.5 w-3.5" /> Clear history
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {displayMessages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full gradient-c4u-soft flex items-center justify-center shrink-0 mr-2 mt-1 shadow-sm">
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

            {/* Streaming message */}
            {streaming && (
              <motion.div key="streaming" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="h-8 w-8 rounded-full gradient-c4u-soft flex items-center justify-center shrink-0 mr-2 mt-1 shadow-sm">
                  <Heart className="h-4 w-4 text-white fill-white" />
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed bg-white border border-border shadow-sm whitespace-pre-wrap">
                  {streamingText || <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-white px-4 py-4 shrink-0">
        <div className="max-w-2xl mx-auto flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Share what's on your mind…"
            rows={1}
            className="flex-1 input-base resize-none overflow-hidden leading-relaxed"
          />
          <Button variant="gradient" size="sm" onClick={send} disabled={!input.trim() || streaming} className="shrink-0 h-10 w-10 p-0">
            {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-2">Shift+Enter for new line · History saved on this device</p>
      </div>
    </div>
  );
}
