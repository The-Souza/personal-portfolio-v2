import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, className }: { eyebrow: string; title: string; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3.5", className)}>
      <p className="font-mono text-eyebrow text-primary-accessible uppercase">{eyebrow}</p>
      <h2 className="font-heading text-display text-balance uppercase">{title}</h2>
    </div>
  );
}
