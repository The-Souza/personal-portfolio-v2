import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

export interface TerminalLine {
  /** ">" or ">>" (prompt) · "//" (comment) · "cursor" (active line). */
  prefix?: ">" | ">>" | "//" | "cursor";
  /** Colored label before the text, e.g. "erro_404:". */
  label?: string;
  text: ReactNode;
  /** Colored status after the text, e.g. "ok". */
  status?: string;
  /** Label/status color: ok = `primary-accessible`, err = `hot-accessible`. */
  tone?: "ok" | "err";
}

export interface TerminalProps {
  /** 4 to 10 lines. */
  lines: TerminalLine[];
  /** Blinks the cursor a few times, then leaves it lit (animate-blink-cursor; still with reduced motion). */
  blink?: boolean;
  /** true when it's only texture: hides it from screen readers. */
  decorative?: boolean;
  className?: string;
}

/** Mono log block with prompts and comments. */
export function Terminal({
  lines,
  blink,
  decorative,
  className,
}: TerminalProps) {
  return (
    <div
      className={cn(
        "font-mono text-code uppercase tracking-wide text-foreground",
        className,
      )}
      aria-hidden={decorative || undefined}
    >
      {lines.map((l, i) => {
        const tone =
          l.tone === "err" ? "text-hot-accessible" : "text-primary-accessible";
        return (
          <p key={i}>
            {l.prefix === "cursor" ? (
              <span
                className={cn(
                  "mr-[0.4em] inline-block h-[1em] w-[0.6em] bg-foreground align-[-0.15em]",
                  blink && "animate-blink-cursor",
                )}
              />
            ) : (
              l.prefix && (
                <span className="text-muted-foreground">{l.prefix} </span>
              )
            )}
            {l.label && <span className={tone}>{l.label} </span>}
            {l.text}
            {l.status && (
              <>
                {" "}
                <span className={tone}>{l.status}</span>
              </>
            )}
          </p>
        );
      })}
    </div>
  );
}

export interface ProgressBarProps {
  /** 0 to 100. */
  value: number;
  label: string;
  className?: string;
}

/** Segmented progress bar. */
export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-4.5 w-50 border border-field-border p-0.75", className)}
      role="progressbar"
      aria-label={label}
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span
        className="segments block h-full text-foreground"
        style={{ width: `${v}%` } as CSSProperties}
      />
    </div>
  );
}
