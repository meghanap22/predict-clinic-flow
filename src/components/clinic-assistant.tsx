"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, MessageCircle, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useClinic } from "@/lib/clinic-context";
import { fetchChatReply } from "@/lib/ai/functions";
import type { ChatMessage } from "@/lib/clinic-types";
import { cn } from "@/lib/utils";
import { AssistantMessageContent } from "@/components/assistant-message";
import { Link } from "@tanstack/react-router";

const PAGE_PROMPTS: Record<string, string[]> = {
  "/": [
    "What should I Focus on Right Now?",
    "Why is Congestion at this Level?",
  ],
  "/simulation": [
    "How can I Reduce Wait Time with these Controls?",
    "Explain my Scenario vs Baseline.",
  ],
  "/recommendations": [
    "What Staffing Change would Help Most?",
    "Which Department is Under the Most Pressure?",
  ],
  "/patient-flow": [
    "Summarize each Doctor's Session Load.",
    "Which Doctor is Under the Most Pressure?",
  ],
  "/analytics": [
    "Summarize Today's Operational Trends.",
    "What Metrics Look Concerning?",
  ],
};

const DEFAULT_PROMPTS = [
  "Summarize the clinic status.",
  "Who is on shift and how loaded are they?",
];

export function ClinicAssistant() {
  const { snapshot } = useClinic();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(
    () => PAGE_PROMPTS[pathname] ?? DEFAULT_PROMPTS,
    [pathname],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const { reply } = await fetchChatReply({
        data: {
          snapshot,
          page: pathname,
          messages: nextMessages,
        },
      });
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reach the assistant.");
      setMessages((prev) => prev.slice(0, -1));
      setInput(trimmed);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          aria-label="Open ClinicFlow assistant"
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-gradient-primary text-primary-foreground shadow-glow transition-transform hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b px-6 py-4 pr-12 text-left">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Clinic Assistant
          </SheetTitle>
          <SheetDescription className="mt-1.5">
            Ask about Live Wait Times, Congestion, Staffing, and your Current Page.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-4 px-6 py-4">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Questions are answered from your live clinic snapshot — not real patient data.
                </p>
                <Link
                  to="/patient-flow"
                  hash="doctor-schedule"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  Open Doctor Schedules
                </Link>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      disabled={loading}
                      onClick={() => send(prompt)}
                      className="rounded-full border bg-card px-3 py-1.5 text-left text-xs transition-colors hover:bg-accent disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "border bg-card text-foreground/90",
                  )}
                >
                  {m.role === "assistant" ? (
                    <AssistantMessageContent
                      content={m.content}
                      onDoctorClick={() => setOpen(false)}
                    />
                  ) : (
                    m.content
                  )}
                </div>
              ))
            )}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className="shrink-0 space-y-2 border-t bg-background px-4 py-4">
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearChat}>
              Clear chat
            </Button>
          )}
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about clinic operations…"
              rows={2}
              className="min-h-0 resize-none"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
            />
            <Button type="submit" size="icon" className="shrink-0 self-end" disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
