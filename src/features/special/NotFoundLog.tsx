"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Terminal, type TerminalLine } from "@/components/Terminal";
import { fillLine } from "@/features/special/special-motion";
import { TypedTerminal } from "@/features/special/TypedTerminal";

const CLASS = "mt-3.5 min-h-40";

function TypedLog({ lines }: { lines: TerminalLine[] }) {
  const path = usePathname();
  return <TypedTerminal lines={lines.map((line) => fillLine(line, { path }))} cursor className={CLASS} />;
}

/**
 * The 404's request log, with the path the visitor actually tried. Reading the URL is request
 * data: outside Suspense it would turn the whole document into a client render.
 */
export function NotFoundLog({ lines }: { lines: TerminalLine[] }) {
  return (
    <Suspense fallback={<Terminal lines={lines.map((line) => fillLine(line, { path: "/…" }))} className={CLASS} />}>
      <TypedLog lines={lines} />
    </Suspense>
  );
}
