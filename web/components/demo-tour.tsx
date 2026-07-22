"use client";

import { useCallback, useEffect, useRef } from "react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

const SEEN_KEY_OUT = "fd_tour_seen_signed_out";
const SEEN_KEY_IN = "fd_tour_seen_signed_in";

function buildSteps(signedIn: boolean): DriveStep[] {
  const steps: DriveStep[] = [
    {
      popover: {
        title: "👋 Welcome to FreightDesk",
        description:
          "A 2-hour hackathon build (Boston Tech Week · Subconscious × Wayfair × Baseten × Cloudflare). It's a mock wholesale portal with an AI agent that clears the freight-exception queue — damaged pallets, shorts, BOL mismatches — while ops sleeps in. This quick tour shows you where to click.",
      },
    },
    {
      element: '[data-tour="search"]',
      popover: {
        title: "A believable B2B storefront",
        description:
          "The catalog, pricing, and procurement notices are all seeded mock data — furniture components sold to plant managers. It exists so the agent has a real-feeling world to operate in.",
        side: "bottom",
      },
    },
  ];

  if (!signedIn) {
    steps.push({
      element: '[data-tour="signin"]',
      popover: {
        title: "Sign in to meet the agent",
        description:
          "Auth is mocked — type anything, or leave both fields blank to sign in as Maria Chen, the Tier-2 exception ops analyst. Once you're in, the AI inbox and agent appear. That's where the fun is.",
        side: "bottom",
      },
    });
  } else {
    steps.push(
      {
        element: '[data-tour="inbox"]',
        popover: {
          title: "📬 Customer complaint inbox",
          description:
            "Angry emails about crushed pallets and short shipments. Open one and hit “Run agent” — the AI reads the photo, listens to the driver's voicemail, parses the BOL, and proposes a resolution.",
          side: "left",
        },
      },
      {
        element: '[data-tour="mic"]',
        popover: {
          title: "🎤 Ask Wayfair AI",
          description:
            "A plan-mode agent: ask it anything about an exception, review the plan it proposes, approve it, then watch the live tool-by-tool execution trace with a final disposition and draft messages.",
          side: "left",
        },
      },
      {
        popover: {
          title: "Try this",
          description:
            "Open the inbox → pick a Critical complaint → click “Run agent”. Then approve the plan and watch the trace stream in. That's the whole demo in ~60 seconds.",
        },
      },
    );
  }

  return steps;
}

export function DemoTour({ signedIn }: { signedIn: boolean }) {
  const activeRef = useRef(false);

  const startTour = useCallback(() => {
    if (activeRef.current) return;
    const steps = buildSteps(signedIn).filter(
      (s) => !s.element || document.querySelector(s.element as string),
    );
    if (steps.length === 0) return;

    activeRef.current = true;
    const d = driver({
      showProgress: true,
      progressText: "{{current}} of {{total}}",
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: signedIn ? "Let me try" : "Got it",
      overlayOpacity: 0.55,
      stagePadding: 6,
      stageRadius: 6,
      popoverClass: "fd-tour",
      steps,
      onDestroyed: () => {
        activeRef.current = false;
      },
    });
    d.drive();
  }, [signedIn]);

  // Auto-start once per visitor (separately for signed-out and signed-in views)
  useEffect(() => {
    const key = signedIn ? SEEN_KEY_IN : SEEN_KEY_OUT;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      return;
    }
    const t = setTimeout(startTour, 900);
    return () => clearTimeout(t);
  }, [signedIn, startTour]);

  return (
    <button
      type="button"
      onClick={startTour}
      aria-label="Replay the guided tour"
      title="What is this? Take the tour"
      className="fixed bottom-5 left-5 z-40 flex h-10 items-center gap-2 rounded-full border-2 border-black bg-white px-3.5 text-[12px] font-semibold shadow-lg transition hover:bg-mc-yellow"
    >
      <span className="grid h-5 w-5 place-items-center rounded-full bg-black font-mono text-[11px] font-bold text-mc-yellow">
        ?
      </span>
      Tour
    </button>
  );
}
