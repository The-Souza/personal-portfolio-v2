"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Terminal, type TerminalLine } from "@/components/Terminal";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

const CHAR_MS = 12;
const LINE_MS = 80;

const textOf = (line: TerminalLine) => (typeof line.text === "string" ? line.text : "");
const noop = () => () => {};

/**
 * A log that types its lines one character at a time, and goes on typing any line added later
 * (the error page appends as it goes). The server HTML (and the hydration render) has every line,
 * readable without JS; the typing starts once hydrated. Screen readers get the full text, not the
 * keystrokes.
 */
export function TypedTerminal({
  lines,
  cursor,
  onDone,
  className,
}: {
  lines: TerminalLine[];
  /** A blinking cursor line once everything is typed. */
  cursor?: boolean;
  /** Called each time the typing catches up with the lines. */
  onDone?: () => void;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  // false on the server and while hydrating, true after: no setState in an effect to switch.
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const [progress, setProgress] = useState({ typed: 0, chars: 0 });
  const onDoneRef = useRef(onDone);
  const doneFor = useRef(-1);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  const typing = hydrated && !reducedMotion;
  const { typed, chars } = typing ? progress : { typed: lines.length, chars: 0 };
  const current = lines[typed];

  useEffect(() => {
    if (!hydrated) return;
    if (!current) {
      if (doneFor.current !== lines.length) {
        doneFor.current = lines.length;
        onDoneRef.current?.();
      }
      return;
    }
    const full = textOf(current).length;
    const timer = window.setTimeout(
      () => setProgress(chars < full ? { typed, chars: chars + 1 } : { typed: typed + 1, chars: 0 }),
      chars < full ? CHAR_MS : LINE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [hydrated, current, typed, chars, lines.length]);

  const visible: TerminalLine[] = lines.slice(0, typed);
  if (current) visible.push({ ...current, text: textOf(current).slice(0, chars), status: undefined });
  if (cursor && !current) visible.push({ prefix: "cursor", text: "" });

  return (
    <div className={className}>
      <Terminal lines={visible} blink decorative />
      <div className="sr-only">
        {lines.map((line, i) => (
          <p key={i}>{[line.label, textOf(line), line.status].filter(Boolean).join(" ")}</p>
        ))}
      </div>
    </div>
  );
}
