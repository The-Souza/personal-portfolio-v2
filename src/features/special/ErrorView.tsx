"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { BracketPanel } from "@/components/BracketPanel";
import { Button } from "@/components/Button";
import { Target, WarningMark } from "@/components/HudMarkers";
import { ProgressBar, type TerminalLine } from "@/components/Terminal";
import { SITE } from "@/content/site";
import { attemptsFor, errorKey, recordAttempt } from "@/features/special/retry-attempts";
import { fillLine } from "@/features/special/special-motion";
import { playSpecialEntrance } from "@/features/special/special-entrance";
import { SpecialShell } from "@/features/special/SpecialShell";
import { TypedTerminal } from "@/features/special/TypedTerminal";
import { playGlitch } from "@/lib/motion/glitch";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

/** Where the bar locks while the error stands (brief, section 11). */
const STUCK_AT = 62;

type Stage = "report" | "waiting" | "retrying";

/**
 * The error page (brief, section 11), shared by error.tsx and global-error.tsx: the FAULT glitch,
 * the typed report, the bar that locks at 62% and blinks, "Try again" (retry()), and the digest to
 * copy when it fails again.
 */
export function ErrorView({ error, retry, locale, path }: { error: unknown; retry: () => void; locale: string; path: string }) {
  const t = useTranslations("error");
  const special = useTranslations("special");
  const header = useTranslations("header");
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const key = errorKey(error);
  const digest = (error as { digest?: string } | null)?.digest ?? t("noDigest");
  const values = { path, digest };
  const line = (raw: unknown) => fillLine(raw as TerminalLine, values);
  // A retry that failed renders this page again: read once, at mount.
  const [failedAgain] = useState(() => attemptsFor(key) > 0);
  const [lines, setLines] = useState<TerminalLine[]>(() => {
    const report = (t.raw("lines") as TerminalLine[]).map((raw) => line(raw));
    return failedAgain ? [...report, line(t.raw("again"))] : report;
  });
  const [bar, setBar] = useState(0);
  const [copied, setCopied] = useState(false);
  const stage = useRef<Stage>("report");

  useEffect(() => {
    console.error(error);
  }, [error]);

  useGSAP(
    () => {
      const root = rootRef.current;
      const base = root?.querySelector<HTMLElement>("[data-glitch-base]");
      const host = root?.querySelector<HTMLElement>("[data-big]");
      if (!root || !base || !host || reducedMotion) return;
      const undoEntrance = playSpecialEntrance(root);
      gsap.delayedCall(0.3, () => playGlitch(base, host, 1.2));
      return undoEntrance;
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  const runBar = (to: number, duration: number) => {
    const state = { value: 0 };
    return gsap.to(state, {
      value: to,
      duration: reducedMotion ? 0 : duration,
      ease: "power2.out",
      onUpdate: () => setBar(state.value),
    });
  };

  const onTyped = () => {
    if (stage.current !== "report") return;
    stage.current = "waiting";
    runBar(STUCK_AT, 0.9).then(() => {
      if (!reducedMotion && barRef.current) {
        gsap.fromTo(barRef.current, { opacity: 1 }, { opacity: 0.2, duration: 0.08, repeat: 3, yoyo: true });
      }
      if (!failedAgain) setLines((current) => [...current, line(t.raw("wait"))]);
    });
  };

  const onRetry = () => {
    if (stage.current === "retrying") return;
    stage.current = "retrying";
    recordAttempt(key);
    setLines((current) => [...current, line(t.raw("retrying"))]);
    setBar(0);
    runBar(STUCK_AT, 0.8).then(() => retry());
  };

  const copyDigest = () => {
    navigator.clipboard?.writeText(digest).then(() => setCopied(true), () => {});
  };

  return (
    <div ref={rootRef}>
      <SpecialShell
        band="tape"
        homeHref={`/${locale}`}
        foot={t("foot", { digest })}
        texts={{
          logoName: header("logoName"),
          logoSuffix: header("logoSuffix"),
          logoLabel: special("logoLabel"),
          place: special("place"),
          mark: special("mark"),
        }}
        left={
          <>
            <p data-special-item className="font-mono text-eyebrow text-primary-accessible uppercase">
              {t("eyebrow")}
            </p>
            <div data-big className="relative self-start">
              <p
                data-glitch-base
                aria-hidden="true"
                className="font-heading text-[clamp(4rem,18vw,17.5rem)] leading-huge font-bold tracking-tight whitespace-nowrap uppercase"
              >
                {t("big")}
              </p>
            </div>
            <h1 data-special-title className="font-heading text-[clamp(2.125rem,4.4vw,3.5rem)] leading-display font-bold text-balance uppercase">
              {t("title")}
            </h1>
            <p data-special-item className="max-w-[56ch] text-lead text-muted-foreground">
              {t("lead", { email: SITE.email })}
            </p>
            <div data-special-item className="mt-1.5 flex flex-wrap gap-4">
              <Button variant="solid" onClick={onRetry}>
                {t("retry")}
              </Button>
              <Button href={`/${locale}`}>{special("home")}</Button>
            </div>
          </>
        }
        right={
          <>
            <div data-special-item className="flex items-start justify-between gap-4">
              <WarningMark>{t("warning")}</WarningMark>
              <Target />
            </div>
            <div data-special-item>
              <BracketPanel tone="focus" filled eyebrow={t("report")}>
                <TypedTerminal lines={lines} onDone={onTyped} className="mt-3.5 min-h-40" />
                {failedAgain && (
                  <button
                    type="button"
                    onClick={copyDigest}
                    className="mt-2 border-b border-current font-mono text-xs leading-none tracking-wider uppercase"
                  >
                    <span aria-hidden="true">[ </span>
                    {copied ? t("copiedDigest") : t("copyDigest")}
                    <span aria-hidden="true"> ]</span>
                  </button>
                )}
                <div ref={barRef} className="mt-3.5">
                  <ProgressBar value={bar} label={t("barLabel")} />
                </div>
              </BracketPanel>
            </div>
          </>
        }
      />
    </div>
  );
}
