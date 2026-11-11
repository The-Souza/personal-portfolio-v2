import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/* The design system's type scale (text-label, text-body…) has to be registered;
   otherwise tailwind-merge takes `text-label` and `text-foreground` for the same
   property and drops the size. */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["impact", "display", "heading", "title", "lead", "body", "label", "eyebrow", "code"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
