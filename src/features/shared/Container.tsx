import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Page width and side margins shared by every act. */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-360 px-4 rail:px-10", className)}>{children}</div>;
}
