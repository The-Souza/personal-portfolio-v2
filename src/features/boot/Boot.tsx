"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { TerminalLine } from "@/components/Terminal";
import { hasSeenBoot, markBootSeen } from "@/features/boot/boot-session";
import { completeBoot } from "@/features/boot/boot-state";
import { runBootSequence } from "@/features/boot/boot-sequence";
import { Container } from "@/features/shared/Container";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { useLenis } from "@/lib/motion/lenis-provider";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

/**
 * Full-screen CRT over the page while it gets ready. The hero renders underneath, so the
 * veil never delays its HTML; without JS a <noscript> rule in the layout hides the veil.
 */
export function Boot() {
  const t = useTranslations("boot");
  const lines = t.raw("lines") as TerminalLine[];
  const rootRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const reducedMotion = useReducedMotion();
  const lenis = useLenis();
  const loadedLabel = t("loaded");

  useEffect(() => {
    if (reducedMotion) {
      completeBoot();
      return;
    }
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    const skipIntro = hasSeenBoot();
    lenis.stop();

    const handover = () => {
      // Marked here, not at the start: StrictMode runs this effect twice in dev, and the
      // cancelled first run would make the real one look like a repeat visit.
      markBootSeen();
      lenis.start();
      completeBoot();
      ScrollTrigger.refresh();
    };

    runBootSequence(root, { skipIntro, onHandover: handover, isCancelled: () => cancelled, loadedLabel })
      .catch(() => handover())
      .finally(() => {
        if (!cancelled) setDone(true);
      });

    return () => {
      cancelled = true;
      gsap.killTweensOf(root.querySelectorAll("*"));
      gsap.killTweensOf(root);
      lenis.start();
    };
  }, [reducedMotion, lenis, loadedLabel]);

  if (reducedMotion || done) return null;

  return (
    <div
      ref={rootRef}
      id="boot"
      role="status"
      aria-label={t("loading")}
      className="dark fixed inset-0 z-60 bg-background text-foreground motion-reduce:hidden"
    >
      {/* Starts collapsed (the first frame of the turn-on) in the server HTML, so the CRT
          never shows at full size before the script takes over. */}
      <div
        data-boot-screen
        className="scanlines absolute inset-x-[5vw] inset-y-[6vh] flex scale-[0.004] items-center bg-card brightness-400"
      >
        <Container className="flex flex-col gap-6">
          <div className="min-h-44 max-w-140 font-mono text-code tracking-wide uppercase">
            {lines.map((line) => (
              <p key={line.text as string} data-boot-line>
                <span className="text-muted-foreground">{line.prefix}</span>{" "}
                <span data-boot-text data-full={line.text as string} />
                {line.status && (
                  <span data-boot-status className="text-primary-accessible opacity-0">
                    {" "}
                    {line.status}
                  </span>
                )}
              </p>
            ))}
          </div>
          <div aria-hidden="true" className="flex items-center gap-3 font-mono text-xs text-muted-foreground tabular-nums">
            <div className="h-4.5 w-50 border border-field-border p-0.75">
              <span data-boot-bar className="segments block h-full w-0 text-foreground" />
            </div>
            <span data-boot-percent>0%</span>
          </div>
        </Container>
      </div>
    </div>
  );
}
