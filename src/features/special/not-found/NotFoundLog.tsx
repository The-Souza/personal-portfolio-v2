"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import type { TerminalLine } from "@/components/Terminal";
import { NOT_FOUND_PATH } from "@/i18n/unknown-route";
import { fillLine } from "@/features/special/shared/special-motion";
import { TypedTerminal } from "@/features/special/shared/TypedTerminal";

const noop = () => () => {};

/**
 * The 404's request log, with the path the visitor actually tried. A direct visit gets this page
 * from the proxy's fetch of the 404 route, so the router's pathname is that route's own: there
 * it's read from the address bar ("/…" in the server HTML, the real one once hydrated). A client
 * navigation to an unknown URL is a rewrite, so the router's pathname is the URL tried, while the
 * address bar may not have changed yet when this renders.
 */
export function NotFoundLog({ lines }: { lines: TerminalLine[] }) {
  const routerPath = usePathname();
  // Only through the client snapshot: hydration renders the server's "/…" first (the server's
  // router sits on the 404 route, the client's already on the URL tried), then the real path.
  const path = useSyncExternalStore(
    noop,
    () => (routerPath.split("/").pop() === NOT_FOUND_PATH ? window.location.pathname : routerPath),
    () => "/…",
  );
  return <TypedTerminal lines={lines.map((line) => fillLine(line, { path }))} cursor className="mt-3.5 min-h-40" />;
}
