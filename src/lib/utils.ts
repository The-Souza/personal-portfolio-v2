import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/* A escala de tipo do design system (text-label, text-body…) precisa ser
   registrada; senão o tailwind-merge acha que `text-label` e `text-foreground`
   são a mesma propriedade e descarta o tamanho. */
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
