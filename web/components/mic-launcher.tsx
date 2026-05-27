"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

type PlanStep = { kind: string; label: string; detail: string };

export type DraftMessages = {
  carrier_message?: string;
  customer_message?: string;
  ar_note?: string;
};

type WorkerStep = {
  step: number;
  tool: string;
  sponsor: string;
  label: string;
  detail: string;
};

type WorkerDecision = {
  disposition_code: string;
  confidence: number;
  reasoning: string;
};

type WorkerResult = {
  disposition_code: string;
  confidence: number;
  dollar_impact: number;
  completed_at: string;
};

type UserMsg = { id: string; role: "user"; content: string };
type PlanMsg = {
  id: string;
  role: "plan";
  question: string;
  intent: string;
  steps: PlanStep[];
  status: "planning" | "ready" | "approved" | "rejected" | "superseded";
  refining?: boolean;
  exceptionId?: string;
};
type ExecutionMsg = {
  id: string;
  role: "execution";
  exceptionId?: string;
  trace: string;
  steps: WorkerStep[];
  decision?: WorkerDecision;
  drafts?: DraftMessages;
  result?: WorkerResult;
  done: boolean;
  error?: string;
};
type NoteMsg = { id: string; role: "note"; content: string };
type Message = UserMsg | PlanMsg | ExecutionMsg | NoteMsg;

type Status = "idle" | "listening" | "planning" | "awaiting" | "executing";
type MicContext = {
  label: string;
  suggestions: string[];
  exceptionId?: string;
  autoRun?: boolean;
};

export type OpenMicDetail = {
  label: string;
  suggestions: string[];
  exceptionId?: string;
  autoRun?: boolean;
};

export const OPEN_MIC_EVENT = "wayfair:open-mic";

const AUTO_SEND_DELAY_MS = 1200;

type SpeechRecognitionLike = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};

declare global {
  interface Window {
    SpeechRecognition?: { new (): SpeechRecognitionLike };
    webkitSpeechRecognition?: { new (): SpeechRecognitionLike };
  }
}

let msgIdCounter = 0;
const nextId = () => `m${++msgIdCounter}`;

export function MicLauncher() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [context, setContext] = useState<MicContext | null>(null);
  const [autoSendIn, setAutoSendIn] = useState<number | null>(null);
  const [draftsModalId, setDraftsModalId] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const autoSendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSendTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seenDraftsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const Ctor =
      typeof window === "undefined"
        ? null
        : window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setVoiceSupported(!!Ctor);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<OpenMicDetail>;
      if (!ce.detail) return;
      setContext({
        label: ce.detail.label,
        suggestions: ce.detail.suggestions,
        exceptionId: ce.detail.exceptionId,
        autoRun: ce.detail.autoRun,
      });
      setMessages([]);
      setDraft("");
      setTranscript("");
      setOpen(true);
    };
    window.addEventListener(OPEN_MIC_EVENT, handler);
    return () => window.removeEventListener(OPEN_MIC_EVENT, handler);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status, transcript, autoSendIn]);

  const cancelAutoSend = useCallback(() => {
    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }
    if (autoSendTickRef.current) {
      clearInterval(autoSendTickRef.current);
      autoSendTickRef.current = null;
    }
    setAutoSendIn(null);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setStatus((s) => (s === "listening" ? "idle" : s));
  }, []);

  const startListening = useCallback(() => {
    cancelAutoSend();
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setVoiceSupported(false);
      return;
    }
    const r = new Ctor();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";
    r.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        const chunk = res[0]?.transcript ?? "";
        if (res.isFinal) finalText += chunk;
        else interimText += chunk;
      }
      const combined = (finalText + " " + interimText).trim();
      setTranscript(combined);
      setDraft(combined);
    };
    r.onerror = () => stopListening();
    r.onend = () => {
      recognitionRef.current = null;
      setStatus((s) => (s === "listening" ? "idle" : s));
    };
    r.start();
    recognitionRef.current = r;
    setStatus("listening");
  }, [cancelAutoSend, stopListening]);

  // Drive plan request — replaces the latest "planning" placeholder with the real plan
  const planFor = useCallback(
    async (question: string, planMsgId: string, extraContext: string[]) => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ question, context: extraContext }),
          signal: ctrl.signal,
        });
        if (!res.body) throw new Error("no body");
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            let evt: { type: string; [k: string]: unknown };
            try {
              evt = JSON.parse(trimmed);
            } catch {
              continue;
            }
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== planMsgId || m.role !== "plan") return m;
                if (evt.type === "intent") {
                  return { ...m, intent: String(evt.text ?? "") };
                }
                if (evt.type === "step") {
                  const step: PlanStep = {
                    kind: String(evt.kind ?? ""),
                    label: String(evt.label ?? ""),
                    detail: String(evt.detail ?? ""),
                  };
                  return { ...m, steps: [...m.steps, step] };
                }
                if (evt.type === "done") {
                  return { ...m, status: "ready" };
                }
                return m;
              }),
            );
          }
        }
        setStatus("awaiting");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setMessages((m) => [
          ...m,
          { id: nextId(), role: "note", content: "⚠ Plan request failed." },
        ]);
        setStatus("idle");
      } finally {
        abortRef.current = null;
      }
    },
    [],
  );

  const ask = useCallback(
    (text: string, opts?: { supersedePlanId?: string; extraContext?: string[] }) => {
      const question = text.trim();
      if (!question) return;
      cancelAutoSend();
      stopListening();
      setTranscript("");
      setDraft("");

      const planId = nextId();
      const userMsg: UserMsg = {
        id: nextId(),
        role: "user",
        content: question,
      };
      const planMsg: PlanMsg = {
        id: planId,
        role: "plan",
        question,
        intent: "",
        steps: [],
        status: "planning",
        exceptionId: context?.exceptionId,
      };

      setMessages((prev) => {
        const next = opts?.supersedePlanId
          ? prev.map((m) =>
              m.id === opts.supersedePlanId && m.role === "plan"
                ? { ...m, status: "superseded" as const }
                : m,
            )
          : prev;
        return [...next, userMsg, planMsg];
      });
      setStatus("planning");
      void planFor(question, planId, opts?.extraContext ?? []);
    },
    [cancelAutoSend, context?.exceptionId, planFor, stopListening],
  );

  const streamRun = useCallback(
    async (execId: string, payload: Record<string, unknown>) => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch("/api/run", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
          signal: ctrl.signal,
        });
        if (!res.body) throw new Error("no body");
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const raw of lines) {
            const line = raw.trim();
            if (!line) continue;
            let evt: { type: string; [k: string]: unknown };
            try {
              evt = JSON.parse(line);
            } catch {
              continue;
            }
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== execId || m.role !== "execution") return m;
                if (evt.type === "text") {
                  return { ...m, trace: m.trace + String(evt.text ?? "") };
                }
                if (evt.type === "info") {
                  return {
                    ...m,
                    trace: m.trace + `· ${evt.text ?? ""}\n`,
                  };
                }
                if (evt.type === "step") {
                  const step: WorkerStep = {
                    step: Number(evt.step ?? m.steps.length + 1),
                    tool: String(evt.tool ?? ""),
                    sponsor: String(evt.sponsor ?? ""),
                    label: String(evt.label ?? evt.tool ?? ""),
                    detail: String(evt.detail ?? ""),
                  };
                  return { ...m, steps: [...m.steps, step] };
                }
                if (evt.type === "decision") {
                  return {
                    ...m,
                    decision: {
                      disposition_code: String(evt.disposition_code ?? ""),
                      confidence: Number(evt.confidence ?? 0),
                      reasoning: String(evt.reasoning ?? ""),
                    },
                  };
                }
                if (evt.type === "drafts") {
                  if (!seenDraftsRef.current.has(execId)) {
                    seenDraftsRef.current.add(execId);
                    queueMicrotask(() => setDraftsModalId(execId));
                  }
                  return {
                    ...m,
                    drafts: (evt.drafts ?? {}) as DraftMessages,
                  };
                }
                if (evt.type === "result") {
                  return {
                    ...m,
                    result: {
                      disposition_code: String(evt.disposition_code ?? ""),
                      confidence: Number(evt.confidence ?? 0),
                      dollar_impact: Number(evt.dollar_impact ?? 0),
                      completed_at: String(
                        evt.completed_at ?? new Date().toISOString(),
                      ),
                    },
                  };
                }
                if (evt.type === "error") {
                  return {
                    ...m,
                    error: String(evt.message ?? "agent error"),
                  };
                }
                if (evt.type === "done") {
                  return { ...m, done: true };
                }
                return m;
              }),
            );
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === execId && m.role === "execution"
                ? { ...m, error: "Agent call failed.", done: true }
                : m,
            ),
          );
        }
      } finally {
        setStatus("idle");
        abortRef.current = null;
      }
    },
    [],
  );

  const approvePlan = useCallback(
    async (planId: string) => {
      const target = messages.find(
        (m) => m.id === planId && m.role === "plan",
      ) as PlanMsg | undefined;
      if (!target) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === planId && m.role === "plan"
            ? { ...m, status: "approved" as const }
            : m,
        ),
      );
      const execId = nextId();
      const execMsg: ExecutionMsg = {
        id: execId,
        role: "execution",
        exceptionId: target.exceptionId,
        trace: "",
        steps: [],
        done: false,
      };
      setMessages((prev) => [...prev, execMsg]);
      setStatus("executing");
      await streamRun(execId, {
        question: target.question,
        plan: { intent: target.intent, steps: target.steps },
        exceptionId: target.exceptionId,
      });
    },
    [messages, streamRun],
  );

  const executeForException = useCallback(
    async (exceptionId: string, label: string) => {
      cancelAutoSend();
      stopListening();
      setTranscript("");
      setDraft("");

      const userMsg: UserMsg = {
        id: nextId(),
        role: "user",
        content: `Run agent for ${exceptionId} · ${label}`,
      };
      const execId = nextId();
      const execMsg: ExecutionMsg = {
        id: execId,
        role: "execution",
        exceptionId,
        trace: "",
        steps: [],
        done: false,
      };
      setMessages((prev) => [...prev, userMsg, execMsg]);
      setStatus("executing");

      await streamRun(execId, {
        exceptionId,
        question: label,
      });
    },
    [cancelAutoSend, stopListening, streamRun],
  );

  // Auto-run agent when opened with autoRun + exceptionId (from inbox Draft reply).
  useEffect(() => {
    if (!context?.autoRun || !context.exceptionId) return;
    const exId = context.exceptionId;
    const label = context.label;
    setContext((c) => (c ? { ...c, autoRun: false } : c));
    void executeForException(exId, label);
  }, [context, executeForException]);

  const rejectPlan = useCallback((planId: string) => {
    setMessages((prev) => {
      const next = prev.map((m) =>
        m.id === planId && m.role === "plan"
          ? { ...m, status: "rejected" as const }
          : m,
      );
      return [
        ...next,
        {
          id: nextId(),
          role: "note" as const,
          content: "Cancelled. No agent action taken.",
        },
      ];
    });
    setStatus("idle");
  }, []);

  const toggleRefine = useCallback((planId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === planId && m.role === "plan"
          ? { ...m, refining: !m.refining }
          : m,
      ),
    );
  }, []);

  const submitRefine = useCallback(
    (planId: string, extra: string) => {
      const trimmed = extra.trim();
      if (!trimmed) return;
      const target = messages.find(
        (m) => m.id === planId && m.role === "plan",
      ) as PlanMsg | undefined;
      if (!target) return;
      ask(`${target.question}\n\nAdditional context: ${trimmed}`, {
        supersedePlanId: planId,
        extraContext: [trimmed],
      });
    },
    [ask, messages],
  );

  // Stop-and-send: clicking the stop button schedules an auto-send the user can cancel.
  const stopAndSchedule = useCallback(() => {
    stopListening();
    const text = (transcript || draft).trim();
    if (!text) return;
    cancelAutoSend();
    setAutoSendIn(Math.ceil(AUTO_SEND_DELAY_MS / 1000));
    autoSendTimerRef.current = setTimeout(() => {
      autoSendTimerRef.current = null;
      autoSendTickRef.current && clearInterval(autoSendTickRef.current);
      autoSendTickRef.current = null;
      setAutoSendIn(null);
      ask(text);
    }, AUTO_SEND_DELAY_MS);
    autoSendTickRef.current = setInterval(() => {
      setAutoSendIn((n) => (n && n > 1 ? n - 1 : n));
    }, 1000);
  }, [ask, cancelAutoSend, draft, stopListening, transcript]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(draft || transcript);
  };

  const onPickSuggestion = (s: string) => {
    setDraft(s);
    ask(s);
  };

  const composerDisabled = status === "planning" || status === "executing";

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close Wayfair AI" : "Ask Wayfair AI"}
        className={`fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full border-2 border-black shadow-lg transition ${
          open ? "bg-white hover:bg-mc-bg" : "bg-mc-yellow hover:bg-mc-yellow-dark"
        }`}
      >
        {open ? <CloseIcon /> : <MicIcon />}
        {!open && (status === "planning" || status === "executing") ? (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-mc-red text-[9px] font-bold text-white">
            ·
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed bottom-24 right-5 z-50 flex h-[600px] w-[420px] flex-col overflow-hidden rounded-md border-2 border-black bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-mc-border bg-mc-yellow px-3 py-2">
            <div>
              <div className="font-serif text-[15px] font-bold leading-tight">
                Ask Wayfair AI
              </div>
              <div className="text-[11px] text-black/70">
                Plan-mode agent · approve before any action runs
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-sm border border-black bg-white px-2 py-0.5 text-[11px] font-semibold hover:bg-mc-yellow-dark"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-2 overflow-y-auto bg-mc-bg p-3 text-[12.5px]"
          >
            {context ? (
              <ContextPanel
                context={context}
                onPick={onPickSuggestion}
                onClear={() => setContext(null)}
              />
            ) : messages.length === 0 ? (
              <EmptyState onPick={onPickSuggestion} />
            ) : null}

            {messages.map((m) => {
              if (m.role === "user") return <UserBubble key={m.id} msg={m} />;
              if (m.role === "note") return <NoteRow key={m.id} msg={m} />;
              if (m.role === "execution")
                return (
                  <ExecutionBubble
                    key={m.id}
                    msg={m}
                    onOpenDrafts={setDraftsModalId}
                  />
                );
              return (
                <PlanBubble
                  key={m.id}
                  msg={m}
                  onApprove={() => approvePlan(m.id)}
                  onReject={() => rejectPlan(m.id)}
                  onRefine={() => toggleRefine(m.id)}
                  onSubmitRefine={(extra) => submitRefine(m.id, extra)}
                />
              );
            })}

            {status === "listening" && transcript ? (
              <div className="border border-dashed border-mc-red bg-white p-2 text-[12px] text-mc-ink-soft">
                <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-mc-red align-middle" />
                {transcript}
                <span className="ml-1 inline-block h-3 w-px animate-pulse bg-mc-ink align-middle" />
              </div>
            ) : null}

            {autoSendIn !== null ? (
              <div className="flex items-center justify-between border border-mc-yellow-dark bg-mc-yellow/30 px-2 py-1.5 text-[11.5px]">
                <span>
                  Auto-sending in {autoSendIn}s…{" "}
                  <span className="text-mc-ink-soft">
                    (or press Send now)
                  </span>
                </span>
                <button
                  type="button"
                  onClick={cancelAutoSend}
                  className="rounded-sm border border-black bg-white px-2 py-0.5 text-[10px] font-semibold hover:bg-mc-yellow-dark"
                >
                  Cancel
                </button>
              </div>
            ) : null}
          </div>

          {/* Composer */}
          <form
            onSubmit={onSubmit}
            className="border-t border-mc-border bg-white p-2"
          >
            <div className="flex items-end gap-1.5">
              <button
                type="button"
                onClick={
                  status === "listening" ? stopAndSchedule : startListening
                }
                disabled={!voiceSupported || composerDisabled}
                aria-label={
                  status === "listening"
                    ? "Stop and send"
                    : "Start voice input"
                }
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-sm border ${
                  status === "listening"
                    ? "animate-pulse border-mc-red bg-mc-red text-white"
                    : "border-black bg-mc-yellow hover:bg-mc-yellow-dark"
                } disabled:cursor-not-allowed disabled:opacity-40`}
                title={
                  !voiceSupported
                    ? "Voice not supported in this browser"
                    : status === "listening"
                      ? "Stop and auto-send"
                      : "Toggle voice input"
                }
              >
                {status === "listening" ? <StopIcon /> : <MicIcon small />}
              </button>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    ask(draft);
                  }
                }}
                placeholder={
                  status === "listening"
                    ? "Listening…"
                    : voiceSupported
                      ? "Type, tap the mic, or click a suggestion"
                      : "Type your question (voice unsupported)"
                }
                rows={2}
                disabled={composerDisabled}
                className="flex-1 resize-none border border-mc-border bg-white px-2 py-1.5 text-[12.5px] outline-none focus:border-black disabled:bg-mc-bg"
              />
              <button
                type="submit"
                disabled={
                  !draft.trim() ||
                  composerDisabled ||
                  autoSendIn !== null
                }
                className="h-9 rounded-sm border border-black bg-black px-3 text-[12px] font-semibold text-mc-yellow hover:bg-mc-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-mc-ink-soft">
              <span>
                {voiceSupported
                  ? "Voice → Web Speech API · stop = auto-send in 1s"
                  : "Voice unsupported · use text input"}
              </span>
              <span>Enter to send · Shift+Enter newline</span>
            </div>
          </form>
        </div>
      ) : null}

      {draftsModalId
        ? (() => {
            const target = messages.find(
              (m) => m.id === draftsModalId && m.role === "execution",
            );
            if (!target || target.role !== "execution" || !target.drafts) return null;
            return (
              <DraftReviewModal
                execution={target}
                onClose={() => setDraftsModalId(null)}
              />
            );
          })()
        : null}
    </>
  );
}

function EmptyState({ onPick }: { onPick: (s: string) => void }) {
  const suggestions = [
    "What's the lead time on undermount slides for Plant 14?",
    "Show me CARB-2 compliant MDF in stock at RNO",
    "Why is exception EX-00214 still open?",
  ];
  return (
    <div className="space-y-2 text-[12px]">
      <p className="text-mc-ink-soft">
        Ask about catalog, lead times, exceptions, or compliance. Tap the mic
        to speak — or click a suggestion to send it.
      </p>
      <div className="space-y-1">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="block w-full cursor-pointer border border-mc-border bg-white px-2 py-1.5 text-left text-[11.5px] text-mc-ink-soft hover:border-black hover:bg-white hover:text-mc-ink"
          >
            <span className="mr-1 text-mc-blue-link">›</span>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function ContextPanel({
  context,
  onPick,
  onClear,
}: {
  context: MicContext;
  onPick: (s: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="border-2 border-mc-yellow-dark bg-mc-yellow/30 p-2">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-black/70">
          Drafting reply
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-[10px] uppercase tracking-wide text-mc-ink-soft hover:text-mc-ink"
        >
          clear
        </button>
      </div>
      <div className="text-[12px] font-semibold leading-snug">
        {context.label}
      </div>
      <div className="mt-2 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wide text-mc-blue-link">
          Suggested · click to send
        </div>
        {context.suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="block w-full cursor-pointer border border-mc-border bg-white px-2 py-1.5 text-left text-[11.5px] leading-snug hover:border-black hover:bg-mc-bg"
          >
            <span className="mr-1 text-mc-blue-link">›</span>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function UserBubble({ msg }: { msg: UserMsg }) {
  return (
    <div className="ml-6 border border-black bg-mc-yellow px-2 py-1.5">
      <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide">
        You
      </div>
      <div className="whitespace-pre-wrap text-[12px]">{msg.content}</div>
    </div>
  );
}

function NoteRow({ msg }: { msg: NoteMsg }) {
  return (
    <div className="text-center text-[10px] uppercase tracking-wide text-mc-ink-soft">
      — {msg.content} —
    </div>
  );
}

function ExecutionBubble({
  msg,
  onOpenDrafts,
}: {
  msg: ExecutionMsg;
  onOpenDrafts: (execId: string) => void;
}) {
  const liveCaret = !msg.done;
  const draftsCount = msg.drafts ? countDrafts(msg.drafts) : 0;
  return (
    <div className="mr-6 space-y-1.5 border border-mc-blue bg-white px-2 py-1.5">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-mc-blue">
          Agent · {msg.exceptionId ? `running ${msg.exceptionId}` : "executing"}
        </div>
        {msg.result ? (
          <span className="rounded-sm border border-mc-blue bg-mc-blue/10 px-1 py-0.5 font-mono text-[10px] text-mc-blue">
            {msg.result.disposition_code} · {(msg.result.confidence * 100).toFixed(0)}%
            {" · $"}
            {msg.result.dollar_impact.toFixed(2)}
          </span>
        ) : msg.decision ? (
          <span className="rounded-sm border border-mc-yellow-dark bg-mc-yellow/30 px-1 py-0.5 font-mono text-[10px]">
            {msg.decision.disposition_code} ·{" "}
            {(msg.decision.confidence * 100).toFixed(0)}%
          </span>
        ) : null}
      </div>

      {msg.steps.length > 0 ? (
        <ol className="space-y-0.5 border-l-2 border-mc-blue/30 pl-2">
          {msg.steps.map((s) => (
            <li
              key={`${s.step}-${s.tool}`}
              className="text-[11px] leading-snug"
            >
              <span className="mr-1 font-mono text-mc-ink-soft">
                {String(s.step).padStart(2, "0")}
              </span>
              <span className="font-semibold">{s.label}</span>
              {s.sponsor ? (
                <span className="ml-1 rounded-sm border border-mc-border bg-mc-bg px-1 text-[9px] font-semibold uppercase tracking-wide text-mc-ink-soft">
                  {s.sponsor}
                </span>
              ) : null}
              {s.detail ? (
                <div className="ml-5 text-[10.5px] text-mc-ink-soft">
                  {s.detail}
                </div>
              ) : null}
            </li>
          ))}
          {liveCaret && !msg.drafts ? (
            <li className="text-[10.5px] text-mc-ink-soft">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-mc-blue align-middle" />{" "}
              running…
            </li>
          ) : null}
        </ol>
      ) : null}

      {msg.trace ? (
        <pre className="whitespace-pre-wrap rounded-sm bg-mc-bg p-1.5 font-mono text-[10.5px] leading-snug text-mc-ink-soft">
          {msg.trace}
        </pre>
      ) : null}

      {msg.error ? (
        <div className="border border-mc-red bg-mc-red/10 px-1.5 py-1 text-[11px] text-mc-red">
          ⚠ {msg.error}
        </div>
      ) : null}

      {msg.drafts ? (
        <button
          type="button"
          onClick={() => onOpenDrafts(msg.id)}
          className="group flex w-full items-center justify-between gap-2 rounded-sm border-2 border-black bg-mc-yellow px-3 py-2 text-left text-[12px] font-semibold transition hover:bg-mc-yellow-dark"
        >
          <span className="flex items-center gap-2">
            <span className="text-base leading-none">📨</span>
            <span>
              Review agent drafts ({draftsCount})
              <span className="ml-1 font-normal text-mc-ink-soft">
                · customer · carrier · AR
              </span>
            </span>
          </span>
          <span className="font-normal text-mc-ink-soft group-hover:text-mc-ink">
            open ↗
          </span>
        </button>
      ) : null}
    </div>
  );
}

function countDrafts(drafts: DraftMessages): number {
  let n = 0;
  if (drafts.customer_message) n++;
  if (drafts.carrier_message) n++;
  if (drafts.ar_note) n++;
  return n;
}

type DraftItem = {
  key: keyof DraftMessages;
  label: string;
  recipient: string;
  hint: string;
};

function buildDraftItems(drafts: DraftMessages): DraftItem[] {
  const items: DraftItem[] = [];
  if (drafts.customer_message) {
    items.push({
      key: "customer_message",
      label: "Customer reply",
      recipient: "→ customer",
      hint: "Goes out under your name; tone-matched to the inbound complaint.",
    });
  }
  if (drafts.carrier_message) {
    items.push({
      key: "carrier_message",
      label: "Carrier message",
      recipient: "→ carrier ops",
      hint: "Files the freight claim with the carrier's account team.",
    });
  }
  if (drafts.ar_note) {
    items.push({
      key: "ar_note",
      label: "AR note",
      recipient: "→ accounting",
      hint: "Internal one-liner for the GL / claim register.",
    });
  }
  return items;
}

function DraftReviewModal({
  execution,
  onClose,
}: {
  execution: ExecutionMsg;
  onClose: () => void;
}) {
  const items = buildDraftItems(execution.drafts ?? {});
  const [step, setStep] = useState(0);
  const [drafts, setDrafts] = useState<DraftMessages>(execution.drafts ?? {});
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editing) {
          setEditing(false);
          return;
        }
        onClose();
        return;
      }
      if (e.key === "ArrowRight" && step < items.length - 1) {
        setStep(step + 1);
      }
      if (e.key === "ArrowLeft" && step > 0) {
        setStep(step - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, items.length, onClose, step]);

  if (items.length === 0) return null;
  const current = items[step];
  const currentBody = (drafts[current.key] ?? "") as string;
  const totalChars = items.reduce(
    (n, it) => n + ((drafts[it.key] as string | undefined)?.length ?? 0),
    0,
  );
  const approvedCount = items.filter((it) => sent[it.key]).length;
  const allApproved = approvedCount === items.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Agent draft review"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close draft review"
        className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-md [animation:fd-fade-in_180ms_ease-out]"
      />

      <article className="relative flex h-[82vh] max-h-[820px] w-full max-w-[880px] flex-col overflow-hidden rounded-md border-2 border-black bg-white shadow-2xl [animation:fd-pop-in_240ms_cubic-bezier(0.2,0.8,0.2,1)]">
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-mc-border bg-mc-yellow px-5 py-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide">
              <span>Agent draft review</span>
              {execution.exceptionId ? (
                <span className="rounded-sm border border-black bg-white px-1.5 py-0.5 font-mono">
                  {execution.exceptionId}
                </span>
              ) : null}
              {execution.result ? (
                <span className="rounded-sm border border-black bg-white px-1.5 py-0.5 font-mono">
                  {execution.result.disposition_code} ·{" "}
                  {(execution.result.confidence * 100).toFixed(0)}% · $
                  {execution.result.dollar_impact.toFixed(2)}
                </span>
              ) : null}
            </div>
            <h2 className="mt-1 font-serif text-xl font-bold leading-tight">
              Three drafts ready for review
            </h2>
            {execution.decision?.reasoning ? (
              <p className="mt-0.5 text-[11.5px] text-black/70">
                Agent reasoning: <i>{execution.decision.reasoning}</i>
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-sm border border-black bg-white text-base font-bold hover:bg-mc-yellow-dark"
          >
            ✕
          </button>
        </header>

        {/* Stepper */}
        <nav className="flex items-stretch gap-0 border-b border-mc-border bg-mc-bg">
          {items.map((it, i) => {
            const isActive = i === step;
            const isSent = !!sent[it.key];
            return (
              <button
                key={it.key}
                type="button"
                onClick={() => {
                  setEditing(false);
                  setStep(i);
                }}
                className={`flex flex-1 items-center gap-2 border-r border-mc-border px-3 py-2 text-left text-[12px] last:border-r-0 ${
                  isActive
                    ? "bg-white font-semibold"
                    : "bg-mc-bg text-mc-ink-soft hover:bg-white hover:text-mc-ink"
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[10px] ${
                    isSent
                      ? "border-mc-blue bg-mc-blue text-white"
                      : isActive
                        ? "border-black bg-mc-yellow"
                        : "border-mc-border bg-white"
                  }`}
                >
                  {isSent ? "✓" : i + 1}
                </span>
                <span className="flex flex-col leading-tight">
                  <span>{it.label}</span>
                  <span className="text-[10px] font-normal text-mc-ink-soft">
                    {it.recipient}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Body */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-baseline justify-between border-b border-mc-border bg-white px-5 py-2 text-[11px] text-mc-ink-soft">
            <span>{current.hint}</span>
            <span>
              {currentBody.length} chars · step {step + 1} of {items.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto bg-white px-5 py-4">
            {editing ? (
              <textarea
                key={current.key}
                value={currentBody}
                onChange={(e) =>
                  setDrafts({ ...drafts, [current.key]: e.target.value })
                }
                autoFocus
                className="block h-full min-h-[280px] w-full resize-none border border-mc-border bg-white p-3 font-mono text-[13px] leading-relaxed outline-none focus:border-black"
              />
            ) : (
              <pre className="whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed">
                {currentBody}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex flex-wrap items-center gap-2 border-t border-mc-border bg-mc-bg px-5 py-2.5">
          {sent[current.key] ? (
            <span className="rounded-sm border border-mc-blue bg-mc-blue/10 px-2 py-1 text-[11.5px] font-semibold text-mc-blue">
              ✓ Queued for send · audit row written
            </span>
          ) : editing ? (
            <>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-sm border border-black bg-mc-yellow px-3 py-1.5 text-[12px] font-semibold hover:bg-mc-yellow-dark"
              >
                Save edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setDrafts({
                    ...drafts,
                    [current.key]: (execution.drafts?.[current.key] ?? "") as string,
                  });
                  setEditing(false);
                }}
                className="rounded-sm border border-mc-border bg-white px-3 py-1.5 text-[12px] hover:border-black"
              >
                Revert to agent
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() =>
                  setSent({ ...sent, [current.key]: true })
                }
                className="rounded-sm border border-black bg-mc-yellow px-3 py-1.5 text-[12px] font-semibold hover:bg-mc-yellow-dark"
              >
                ✓ Approve &amp; send
              </button>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-sm border border-mc-border bg-white px-3 py-1.5 text-[12px] hover:border-black"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(currentBody)}
                className="rounded-sm border border-mc-border bg-white px-3 py-1.5 text-[12px] hover:border-black"
                title="Copy to clipboard"
              >
                Copy
              </button>
            </>
          )}

          <div className="ml-auto flex items-center gap-2 text-[11px] text-mc-ink-soft">
            <span>
              {approvedCount} / {items.length} approved
            </span>
            <button
              type="button"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="rounded-sm border border-mc-border bg-white px-2 py-1 text-[11.5px] hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Prev
            </button>
            {step < items.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="rounded-sm border border-black bg-white px-2 py-1 text-[11.5px] font-semibold hover:bg-mc-yellow"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                disabled={!allApproved}
                className="rounded-sm border border-black bg-mc-yellow px-3 py-1 text-[11.5px] font-semibold hover:bg-mc-yellow-dark disabled:cursor-not-allowed disabled:opacity-40"
                title={
                  allApproved
                    ? "Close and finish"
                    : "Approve remaining drafts to finish"
                }
              >
                Done
              </button>
            )}
          </div>
        </footer>

        {/* Sub-footer hint */}
        <div className="border-t border-mc-border bg-white px-5 py-1 text-[10px] text-mc-ink-soft">
          <kbd className="rounded border border-mc-border bg-mc-bg px-1">←</kbd>{" "}
          /{" "}
          <kbd className="rounded border border-mc-border bg-mc-bg px-1">→</kbd>{" "}
          to navigate ·{" "}
          <kbd className="rounded border border-mc-border bg-mc-bg px-1">Esc</kbd>{" "}
          to close · {totalChars} total chars · agent ran in {execution.steps.length}{" "}
          steps
        </div>
      </article>
    </div>
  );
}


function PlanBubble({
  msg,
  onApprove,
  onReject,
  onRefine,
  onSubmitRefine,
}: {
  msg: PlanMsg;
  onApprove: () => void;
  onReject: () => void;
  onRefine: () => void;
  onSubmitRefine: (extra: string) => void;
}) {
  const [extra, setExtra] = useState("");
  const dim = msg.status === "rejected" || msg.status === "superseded";
  return (
    <div
      className={`mr-6 border-2 ${
        msg.status === "approved"
          ? "border-mc-blue"
          : msg.status === "ready"
            ? "border-black"
            : "border-mc-border"
      } bg-white px-2 py-1.5 ${dim ? "opacity-50" : ""}`}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-mc-blue">
          Plan
        </span>
        <span className="text-[10px] uppercase tracking-wide text-mc-ink-soft">
          {msg.status === "planning"
            ? "drafting…"
            : msg.status === "ready"
              ? "awaiting approval"
              : msg.status === "approved"
                ? "approved · running"
                : msg.status === "rejected"
                  ? "cancelled"
                  : "superseded"}
        </span>
      </div>

      {msg.intent ? (
        <div className="mb-1.5 text-[12.5px] font-semibold">
          {msg.intent}
        </div>
      ) : (
        <div className="mb-1.5 text-[11px] italic text-mc-ink-soft">
          Thinking through approach…
        </div>
      )}

      <ol className="space-y-0.5">
        {msg.steps.map((s, i) => (
          <li key={i} className="text-[11.5px] leading-snug">
            <span className="mr-1 font-mono text-mc-ink-soft">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-semibold">{s.label}</span>
            <div className="ml-5 text-[10.5px] text-mc-ink-soft">
              <span className="mr-1 font-mono text-mc-blue-link">
                {s.kind}
              </span>
              · {s.detail}
            </div>
          </li>
        ))}
        {msg.status === "planning" ? (
          <li className="text-[11px] text-mc-ink-soft">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-mc-blue align-middle" />{" "}
            adding step…
          </li>
        ) : null}
      </ol>

      {msg.status === "ready" ? (
        <div className="mt-2 border-t border-mc-border pt-2">
          {msg.refining ? (
            <RefineForm
              onSubmit={(extra) => onSubmitRefine(extra)}
              onCancel={() => {
                setExtra("");
                onRefine();
              }}
              value={extra}
              setValue={setExtra}
            />
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={onApprove}
                className="rounded-sm border border-black bg-mc-yellow px-2.5 py-1 text-[11px] font-semibold hover:bg-mc-yellow-dark"
              >
                ✓ Yes, run this
              </button>
              <button
                type="button"
                onClick={onReject}
                className="rounded-sm border border-mc-border bg-white px-2.5 py-1 text-[11px] hover:border-black"
              >
                ✕ No, cancel
              </button>
              <button
                type="button"
                onClick={onRefine}
                className="rounded-sm border border-mc-border bg-white px-2.5 py-1 text-[11px] hover:border-black"
              >
                + Add context
              </button>
              <span className="ml-auto text-[10px] text-mc-ink-soft">
                {msg.steps.length} steps
              </span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function RefineForm({
  value,
  setValue,
  onSubmit,
  onCancel,
}: {
  value: string;
  setValue: (s: string) => void;
  onSubmit: (extra: string) => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-[10px] font-bold uppercase tracking-wide text-mc-blue-link">
        Add context — agent will re-plan
      </div>
      <textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit(value);
          }
        }}
        rows={2}
        placeholder="e.g. customer is on Net-15 terms; expedite freight at our cost"
        className="w-full resize-none border border-mc-border bg-white px-2 py-1.5 text-[12px] outline-none focus:border-black"
      />
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => onSubmit(value)}
          disabled={!value.trim()}
          className="rounded-sm border border-black bg-mc-yellow px-2.5 py-1 text-[11px] font-semibold hover:bg-mc-yellow-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          Re-plan with context
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-sm border border-mc-border bg-white px-2.5 py-1 text-[11px] hover:border-black"
        >
          Back
        </button>
      </div>
    </div>
  );
}

function MicIcon({ small }: { small?: boolean }) {
  const size = small ? 18 : 22;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
      <path d="M8 21h8" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
