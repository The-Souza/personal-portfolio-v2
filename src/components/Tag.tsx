import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface TagProps {
  children: ReactNode;
  /** live: `live` dot (online / in production) · accent · hot (at most one per screen) · plain: no dot. */
  variant?: "default" | "live" | "accent" | "hot" | "plain";
  className?: string;
}

const box = {
  default: "border-field-border text-foreground",
  live: "border-field-border text-foreground",
  accent: "border-primary text-primary-accessible",
  hot: "border-hot text-hot-accessible",
  plain: "border-field-border text-foreground",
};
const dot = {
  default: "bg-field-border",
  live: "bg-live",
  accent: "bg-primary",
  hot: "bg-hot",
  plain: "",
};

/** Mono tag with a square dot. */
export function Tag({ children, variant = "default", className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-1.25 font-mono text-xs font-medium leading-none whitespace-nowrap uppercase tracking-wider",
        box[variant],
        className,
      )}
    >
      {variant !== "plain" && (
        <span
          aria-hidden="true"
          className={cn("size-1.5 rounded-xs", dot[variant])}
        />
      )}
      {children}
    </span>
  );
}

/** Groups Tags, wrapping onto new lines. */
export function TagGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>{children}</div>
  );
}
