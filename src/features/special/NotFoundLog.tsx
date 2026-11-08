"use client";

import { useSyncExternalStore } from "react";
import type { TerminalLine } from "@/components/Terminal";
import { fillLine } from "@/features/special/special-motion";
import { TypedTerminal } from "@/features/special/TypedTerminal";

const noop = () => () => {};

/**
 * The 404's request log, with the path the visitor actually tried. Read from the address bar,
 * not usePathname: the proxy serves this page for any unknown URL, so on the server the pathname
 * is the 404 route's own. Unknown until hydrated ("/…" in the server HTML), then the real one.
 */
export function NotFoundLog({ lines }: { lines: TerminalLine[] }) {
  const path = useSyncExternalStore(
    noop,
    () => window.location.pathname,
    () => "/…",
  );
  return <TypedTerminal lines={lines.map((line) => fillLine(line, { path }))} cursor className="mt-3.5 min-h-40" />;
}
