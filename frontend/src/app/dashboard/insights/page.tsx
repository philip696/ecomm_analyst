"use client";
/**
 * AI Insights / Chatbot page.
 * Users pick analytics segments, type a question, and get an AI-generated answer.
 */
import { useEffect, useRef, useState } from "react";
import { Bot, Send, User, Loader2, RotateCcw } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { insightsApi } from "@/lib/api";
import { clsx } from "clsx";

const SEGMENTS = [
  { id: "sales", label: "Sales", color: "bg-brand-50 text-brand-600 border-brand-200" },
  { id: "engagement", label: "Engagement", color: "bg-cyan-50 text-cyan-600 border-cyan-200" },
  { id: "comments", label: "Comments", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
];

const QUICK_QUESTIONS = [
  { label: "Sales + Engagement", segments: ["sales", "engagement"], question: "How do sales and customer engagement correlate? What can I improve?" },
  { label: "Comments + Sales", segments: ["comments", "sales"], question: "What do customer comments reveal about our top-selling products?" },
  { label: "All Segments", segments: ["sales", "engagement", "comments"], question: "Give me a comprehensive store performance summary and top 3 action items." },
  { label: "Return Analysis", segments: ["sales", "comments"], question: "What products have high returns and what do reviews say about them?" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
  segments?: string[];
  timestamp: Date;
}

export default function InsightsPage() {
  const [selectedSegments, setSelectedSegments] = useState<string[]>(["sales"]);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI analytics assistant. Select one or more data segments, then ask me anything about your store performance. Use the quick-action buttons below for popular combined analyses.",
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleSegment = (id: string) => {
    setSelectedSegments((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const sendMessage = async (q: string, segs: string[]) => {
    if (!q.trim() || segs.length === 0 || loading) return;

    const userMsg: Message = { role: "user", content: q, segments: segs, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const { data } = await insightsApi.ask(segs, q);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again.", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(question, selectedSegments);
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared. Ask me anything about your store performance!",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div>
      <PageHeader title="AI Insights" description="Ask questions about your store data across any combination of segments">
        <button onClick={clearChat} className="btn-ghost flex items-center gap-2 text-slate-500">
          <RotateCcw className="w-4 h-4" />
          Clear
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Segment selector + Quick actions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Select Segments</h3>
            <div className="space-y-2">
              {SEGMENTS.map((seg) => (
                <button
                  key={seg.id}
                  onClick={() => toggleSegment(seg.id)}
                  className={clsx(
                    "w-full text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                    selectedSegments.includes(seg.id)
                      ? seg.color + " border-current"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  )}
                >
                  {selectedSegments.includes(seg.id) ? "✓ " : ""}{seg.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Analyses</h3>
            <div className="space-y-2">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedSegments(q.segments);
                    sendMessage(q.question, q.segments);
                  }}
                  disabled={loading}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-brand-50 hover:text-brand-600 text-sm font-medium text-slate-600 border border-slate-100 transition-all disabled:opacity-50"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chat window */}
        <div className="lg:col-span-3 card flex flex-col" style={{ height: "calc(100vh - 220px)" }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={clsx("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
              >
                {/* Avatar */}
                <div
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                    msg.role === "assistant" ? "bg-brand-500" : "bg-slate-200"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                {/* Bubble */}
                <div className={clsx("max-w-[80%]", msg.role === "user" ? "items-end" : "items-start", "flex flex-col gap-1")}>
                  {msg.segments && (
                    <div className="flex gap-1">
                      {msg.segments.map((s) => (
                        <span key={s} className="text-xs bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full capitalize">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <div
                    className={clsx(
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                      msg.role === "assistant"
                        ? "bg-slate-100 text-slate-800"
                        : "bg-brand-500 text-white"
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="text-xs text-slate-400">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading bubble */}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                  <span className="text-sm text-slate-500">Analyzing your data…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-3 border-t border-slate-100 pt-4">
            <input
              type="text"
              className="input flex-1"
              placeholder={
                selectedSegments.length === 0
                  ? "Select at least one segment first…"
                  : `Ask about ${selectedSegments.join(" + ")}…`
              }
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading || selectedSegments.length === 0}
            />
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={loading || !question.trim() || selectedSegments.length === 0}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
