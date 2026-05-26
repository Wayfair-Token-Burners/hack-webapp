"use client";

import { useCallback, useEffect, useState } from "react";
import {
  COMPLAINTS,
  formatReceivedAt,
  severityColor,
  type Complaint,
} from "@/lib/complaints";
import { OPEN_MIC_EVENT, type OpenMicDetail } from "./mic-launcher";

export function InboxLauncher() {
  const [inboxOpen, setInboxOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = activeId
    ? (COMPLAINTS.find((c) => c.id === activeId) ?? null)
    : null;

  const closeAll = useCallback(() => {
    setActiveId(null);
    setInboxOpen(false);
  }, []);

  // Esc closes the topmost layer first
  useEffect(() => {
    if (!inboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (activeId) setActiveId(null);
      else setInboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inboxOpen, activeId]);

  const unread = COMPLAINTS.length;
  const critical = COMPLAINTS.filter((c) => c.severity === "Critical").length;

  return (
    <>
      {/* Floating launcher — sits above the mic */}
      <button
        type="button"
        onClick={() => setInboxOpen(true)}
        aria-label={`Open customer complaint inbox · ${unread} unread`}
        className="fixed bottom-24 right-5 z-40 grid h-14 w-14 place-items-center rounded-full border-2 border-black bg-white shadow-lg transition hover:bg-mc-bg"
      >
        <EnvelopeIcon />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border border-black bg-mc-red px-1 text-[11px] font-bold text-white">
            {unread}
          </span>
        ) : null}
        {critical > 0 ? (
          <span className="absolute -left-1 -top-1 h-3 w-3 animate-pulse rounded-full border border-black bg-mc-red" />
        ) : null}
      </button>

      {inboxOpen ? (
        <InboxModal
          onClose={closeAll}
          onPick={(id) => setActiveId(id)}
          active={active}
          onCloseDetail={() => setActiveId(null)}
          onCloseAll={closeAll}
        />
      ) : null}
    </>
  );
}

function InboxModal({
  onClose,
  onPick,
  active,
  onCloseDetail,
  onCloseAll,
}: {
  onClose: () => void;
  onPick: (id: string) => void;
  active: Complaint | null;
  onCloseDetail: () => void;
  onCloseAll: () => void;
}) {
  const critical = COMPLAINTS.filter((c) => c.severity === "Critical").length;
  const high = COMPLAINTS.filter((c) => c.severity === "High").length;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Customer Complaint Inbox"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close inbox"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/40 [animation:fd-fade-in_180ms_ease-out]"
      />

      {/* List modal card */}
      <div className="relative flex h-[80vh] max-h-[760px] w-full max-w-[640px] flex-col overflow-hidden rounded-md border-2 border-black bg-white shadow-2xl [animation:fd-pop-in_220ms_cubic-bezier(0.2,0.8,0.2,1)]">
        <header className="flex items-start justify-between border-b border-mc-border bg-mc-yellow px-4 py-3">
          <div>
            <div className="font-serif text-lg font-bold leading-tight">
              Customer Complaint Inbox
            </div>
            <div className="mt-0.5 text-[11px] text-black/70">
              {COMPLAINTS.length} unresolved · {critical} critical ·{" "}
              {high} high · auto-summarized by Wayfair AI
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close inbox"
            className="rounded-sm border border-black bg-white px-2 py-1 text-[12px] font-semibold hover:bg-mc-yellow-dark"
          >
            ✕
          </button>
        </header>

        {/* Filter strip */}
        <div className="flex items-center gap-1.5 border-b border-mc-border bg-mc-bg px-3 py-1.5 text-[11px]">
          {(["All", "Critical", "High", "Medium", "Low"] as const).map((f, i) => (
            <button
              key={f}
              type="button"
              className={`rounded-sm border px-2 py-0.5 ${
                i === 0
                  ? "border-black bg-white font-semibold"
                  : "border-mc-border bg-white text-mc-ink-soft hover:border-black"
              }`}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto text-mc-ink-soft">Sort: newest first</span>
        </div>

        <ul className="flex-1 divide-y divide-mc-border overflow-y-auto bg-white">
          {COMPLAINTS.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onPick(c.id)}
                className="block w-full cursor-pointer px-4 py-3 text-left hover:bg-mc-bg"
              >
                <div className="flex items-center gap-2 text-[12px]">
                  <span
                    className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${severityColor(c.severity)}`}
                  >
                    {c.severity}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-mc-ink-soft">
                    {c.category}
                  </span>
                  {c.poNumber ? (
                    <span className="font-mono text-[11px] text-mc-blue-link">
                      PO #{c.poNumber}
                    </span>
                  ) : null}
                  <span className="ml-auto text-[11px] text-mc-ink-soft">
                    {formatReceivedAt(c.receivedAt)}
                  </span>
                </div>
                <div className="mt-1 text-[13px] font-semibold leading-tight">
                  {c.subject}
                </div>
                <div className="mt-0.5 text-[11.5px] text-mc-ink-soft">
                  {c.from.name} · {c.from.company}
                </div>
                <div className="mt-2 border-l-2 border-mc-blue-link bg-mc-bg px-2 py-1.5 text-[12px] leading-snug">
                  <span className="mr-1 text-[10px] font-bold uppercase tracking-wide text-mc-blue-link">
                    AI Summary
                  </span>
                  {c.summary}
                </div>
              </button>
            </li>
          ))}
        </ul>

        <footer className="border-t border-mc-border bg-mc-bg px-4 py-2 text-[11px] text-mc-ink-soft">
          Synced with support@freightdesk.example · last refresh just now ·{" "}
          <a href="#">Open in full email client →</a>
        </footer>
      </div>

      {/* Detail modal stacked on top */}
      {active ? (
        <DetailModal
          complaint={active}
          onClose={onCloseDetail}
          onCloseAll={onCloseAll}
        />
      ) : null}
    </div>
  );
}

function DetailModal({
  complaint,
  onClose,
  onCloseAll,
}: {
  complaint: Complaint;
  onClose: () => void;
  onCloseAll: () => void;
}) {
  const onDraftReply = () => {
    const detail: OpenMicDetail = {
      label: `Re: ${complaint.subject} — ${complaint.from.name}, ${complaint.from.company}`,
      suggestions: complaint.draftSuggestions,
    };
    window.dispatchEvent(
      new CustomEvent<OpenMicDetail>(OPEN_MIC_EVENT, { detail }),
    );
    onCloseAll();
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Blurred backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close email"
        className="absolute inset-0 cursor-default bg-black/30 backdrop-blur-md [animation:fd-fade-in_180ms_ease-out]"
      />

      <article className="relative flex h-[80vh] max-h-[760px] w-full max-w-[760px] flex-col overflow-hidden rounded-md border-2 border-black bg-white shadow-2xl [animation:fd-pop-in_240ms_cubic-bezier(0.2,0.8,0.2,1)]">
        <header className="flex items-start gap-3 border-b border-mc-border bg-white px-5 py-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${severityColor(complaint.severity)}`}
              >
                {complaint.severity}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-mc-ink-soft">
                {complaint.category}
              </span>
              {complaint.poNumber ? (
                <span className="font-mono text-[11px] text-mc-blue-link">
                  PO #{complaint.poNumber}
                </span>
              ) : null}
            </div>
            <h2 className="mt-1 font-serif text-xl font-bold leading-tight">
              {complaint.subject}
            </h2>
            <div className="mt-1 text-[12px] text-mc-ink-soft">
              <b className="text-mc-ink">{complaint.from.name}</b> &lt;
              {complaint.from.email}&gt; · {complaint.from.company}
              <span className="ml-2">
                {new Date(complaint.receivedAt).toUTCString()}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close email"
            className="grid h-8 w-8 place-items-center rounded-sm border border-black bg-white text-base font-bold hover:bg-mc-yellow"
          >
            ✕
          </button>
        </header>

        {/* AI summary banner */}
        <div className="border-b border-mc-border bg-mc-bg px-5 py-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wide text-mc-blue-link">
            AI Summary
          </div>
          <p className="text-[12.5px] leading-snug">{complaint.summary}</p>
          <div className="mt-2 flex gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={onDraftReply}
              className="rounded-sm border border-black bg-mc-yellow px-2 py-0.5 font-semibold hover:bg-mc-yellow-dark"
            >
              Draft reply
            </button>
            <button
              type="button"
              className="rounded-sm border border-mc-border bg-white px-2 py-0.5 hover:border-black"
            >
              Open exception
            </button>
            <button
              type="button"
              className="rounded-sm border border-mc-border bg-white px-2 py-0.5 hover:border-black"
            >
              Mark resolved
            </button>
            <button
              type="button"
              className="rounded-sm border border-mc-border bg-white px-2 py-0.5 hover:border-black"
            >
              Archive
            </button>
          </div>
        </div>

        {/* Full body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 text-[13px] leading-relaxed">
          <pre className="whitespace-pre-wrap font-sans">{complaint.body}</pre>
        </div>

        <footer className="flex items-center justify-between border-t border-mc-border bg-mc-bg px-5 py-2 text-[11px] text-mc-ink-soft">
          <span>
            Press <kbd className="rounded border border-mc-border bg-white px-1">Esc</kbd>{" "}
            to close · click outside to dismiss
          </span>
          <span>Thread: 1 message</span>
        </footer>
      </article>
    </div>
  );
}

function EnvelopeIcon() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}
