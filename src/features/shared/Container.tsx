import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Page width and side margins shared by every act. From `tablet` up the right margin also
 * clears the fixed side HUD, so no content runs under it.
 */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-360 px-4 tablet:pr-20 rail:pl-10", className)} {...props} />;
}
