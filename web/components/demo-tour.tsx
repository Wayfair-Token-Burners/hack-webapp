"use client";

import { useCallback, useEffect, useRef } from "react";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";

type Stage = {
  selector: string;
  title: string;
  description: string;
  side?: "top" | "bottom" | "left" | "right";
  /** How long to wait for the element to appear (ms). */
  waitMs?: number;
};

/**
 * The one real user journey, in click order. Each stage highlights exactly
 * the button the visitor must click; the click itself advances the tour.
 */
const STAGES: Stage[] = [
  {
    selector: '[data-tour="inbox"]',
    title: "1 · Open the complaint inbox",
    description:
      "Click the envelope. It holds angry customer emails about crushed pallets and short shipments — the queue the agent exists to clear.",
    side: "left",
    waitMs: 10_000,
  },
  {
    selector: '[data-tour="complaint-hero"]',
    title: "2 · Open the top complaint",
    description:
      "Click this one — a damaged-pallet case with photo, driver voicemail, and BOL evidence attached. The richest case in the queue.",
    side: "top",
    waitMs: 10_000,
  },
  {
    selector: '[data-tour="run-agent"]',
    title: "3 · Run the AI agent",
    description:
      "Click it. The agent reads the photo, listens to the voicemail, parses the BOL, decides a disposition, and drafts the outbound messages — live, step by step.",
    side: "top",
    waitMs: 10_000,
  },
  {
    selector: '[data-tour="review-drafts"]',
    title: "4 · Review what it wrote",
    description:
      "The trace is done. Click to review the drafts the agent staged — nothing is sent without a human.",
    side: "top",
    waitMs: 90_000,
  },
  {
    selector: '[data-tour="approve-send"]',
    title: "5 · Approve & send",
    description:
      "You're the human in the loop. Approve this draft — then step through and approve the rest to finish the case.",
    side: "top",
    waitMs: 15_000,
  },
];

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * driver.js draws its overlay/stage inside requestAnimationFrame callbacks.
 * Some embedded or throttled browsers never fire rAF for background tabs
 * (or at all), which leaves the tour invisible: popover at opacity 0 and no
 * overlay. Probe once; if rAF is dead, replace it with a setTimeout shim.
 */
let rafProbed = false;
function ensureWorkingRaf() {
  if (rafProbed) return;
  rafProbed = true;
  let fired = false;
  window.requestAnimationFrame(() => {
    fired = true;
  });
  setTimeout(() => {
    if (fired) return;
    window.requestAnimationFrame = ((cb: FrameRequestCallback) =>
      window.setTimeout(
        () => cb(performance.now()),
        16,
      )) as typeof window.requestAnimationFrame;
    window.cancelAnimationFrame = ((id: number) =>
      window.clearTimeout(id)) as typeof window.cancelAnimationFrame;
  }, 300);
}

async function waitForElement(
  selector: string,
  timeoutMs: number,
  isCancelled: () => boolean,
): Promise<HTMLElement | null> {
  const started = Date.now();
  while (!isCancelled() && Date.now() - started < timeoutMs) {
    const el = document.querySelector<HTMLElement>(selector);
    if (el) return el;
    await sleep(150);
  }
  return null;
}

/** Resolves true when the element is clicked, false on cancel/removal. */
function waitForClick(
  el: HTMLElement,
  isCancelled: () => boolean,
): Promise<boolean> {
  return new Promise((resolve) => {
    const onClick = () => {
      cleanup();
      resolve(true);
    };
    const poll = setInterval(() => {
      if (isCancelled() || !el.isConnected) {
        cleanup();
        resolve(false);
      }
    }, 250);
    const cleanup = () => {
      el.removeEventListener("click", onClick, true);
      clearInterval(poll);
    };
    el.addEventListener("click", onClick, { capture: true, once: true });
  });
}

export function DemoTour() {
  const runningRef = useRef(false);
  const driverRef = useRef<Driver | null>(null);
  const cancelRunRef = useRef<(() => void) | null>(null);

  const startTour = useCallback(async () => {
    // A second invocation cancels the in-flight run and
    // restarts from the top, so the button always works.
    if (runningRef.current) {
      cancelRunRef.current?.();
      const waitStart = Date.now();
      while (runningRef.current && Date.now() - waitStart < 3_000) {
        await sleep(50);
      }
      if (runningRef.current) return;
    }
    runningRef.current = true;

    // One driver instance for the whole run. Cancellation (Esc / ✕ /
    // overlay click) is detected by polling `isActive()` — driver.js resets
    // that state synchronously on destroy, unlike the onDestroyed hook which
    // can be skipped depending on animation timing.
    let internalDestroy = false;
    let externallyDestroyed = false;

    const d = driver({
      showProgress: false,
      allowKeyboardControl: true,
      // No fade animation: driver's fade leaves the popover at opacity 0
      // until the CSS animation completes, which can never happen in
      // throttled/background tabs. Synchronous rendering is bulletproof.
      animate: false,
      overlayOpacity: 0.6,
      stagePadding: 6,
      stageRadius: 8,
      popoverClass: "fd-tour",
      // A stray click on the dark overlay must NOT kill the tour — visitors
      // click around while waiting for the agent. Close is still available
      // via the ✕ button and Esc.
      overlayClickBehavior: () => {},
      // The highlighted element stays clickable; everything else is blocked
      // by the overlay. Clicking the glowing button is the only way forward.
      disableActiveInteraction: false,
      onDestroyed: () => {
        if (!internalDestroy) externallyDestroyed = true;
      },
    });
    driverRef.current = d;
    const isCancelled = () => externallyDestroyed || !d.isActive();
    cancelRunRef.current = () => {
      externallyDestroyed = true;
      internalDestroy = true;
      d.destroy();
      internalDestroy = false;
    };

    const finish = () => {
      if (d.isActive()) {
        internalDestroy = true;
        d.destroy();
        internalDestroy = false;
      }
      cancelRunRef.current = null;
      driverRef.current = null;
      runningRef.current = false;
    };

    try {
      // Intro card — the only stage advanced by its own button.
      let introNext = false;
      d.highlight({
        popover: {
          title: "👋 This is FreightDesk",
          description:
            "A 2-hour hackathon build: an AI agent that clears a freight-exception queue — damaged pallets, shorts, BOL mismatches — with a human approving every outbound message. There's exactly one journey. Follow the highlight and click only the glowing button.",
          showButtons: ["next", "close"],
          nextBtnText: "Show me →",
          onNextClick: () => {
            introNext = true;
          },
        },
      });
      while (!introNext && !isCancelled()) await sleep(100);
      if (isCancelled()) return;

      for (const stage of STAGES) {
        const el = await waitForElement(
          stage.selector,
          stage.waitMs ?? 10_000,
          isCancelled,
        );
        if (!el || isCancelled()) return;

        el.scrollIntoView({ block: "center", behavior: "smooth" });
        d.highlight({
          element: el,
          popover: {
            title: stage.title,
            description: stage.description,
            side: stage.side,
            showButtons: ["close"],
          },
        });

        const clicked = await waitForClick(el, isCancelled);
        if (!clicked || isCancelled()) return;
      }

      // Finale — closed by the visitor.
      d.highlight({
        popover: {
          title: "🎉 That's the whole loop",
          description:
            "Complaint in → evidence read → disposition decided → drafts staged → human approves. Approve the remaining drafts and hit Done to close the case — or poke around; everything you saw is live.",
          showButtons: ["close"],
        },
      });
      while (!isCancelled()) await sleep(200);
    } finally {
      finish();
    }
  }, []);

  // Autoplay on every page load — the tour IS the demo's front door.
  // Visitors who already know the flow can dismiss it with ✕ or Esc.
  useEffect(() => {
    // Probe rAF immediately so a dead implementation is shimmed before the
    // first highlight renders (probe resolves in 300ms, tour starts at 900ms).
    ensureWorkingRaf();
    const t = setTimeout(() => void startTour(), 900);
    return () => clearTimeout(t);
  }, [startTour]);

  // Tear down on unmount.
  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, []);

  return null;
}
