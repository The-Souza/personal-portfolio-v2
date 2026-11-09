import { cn } from "@/lib/utils";

export interface StatProps {
  /** One word: "Projetos", "Anos". */
  label: string;
  /** Real numbers only. */
  value: string | number;
  /** Small unit in `primary-accessible`, e.g. "%". */
  unit?: string;
  /** Short line of context below the label, in `muted-foreground`. */
  note?: string;
}

/** A big number with a mono label. Use it inside StatGroup. */
export function Stat({ label, value, unit, note }: StatProps) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="order-2 font-mono text-xs font-medium whitespace-nowrap uppercase tracking-wider text-muted-foreground">{label}</dt>
      {note && <dd className="order-3 text-xs text-muted-foreground">{note}</dd>}
      <dd data-stat-value className="order-1 font-heading text-4xl font-semibold leading-none tracking-tighter tabular-nums">
        {value}
        {unit && <small className="ml-0.5 text-base tracking-normal text-primary-accessible">{unit}</small>}
      </dd>
    </div>
  );
}

export interface StatGroupProps {
  /** Up to three items. */
  items: StatProps[];
  className?: string;
}

/** Up to three Stats side by side. */
export function StatGroup({ items, className }: StatGroupProps) {
  return (
    <dl className={cn("mt-6 grid grid-cols-[repeat(3,auto)] justify-start gap-x-8 gap-y-4", className)}>
      {items.map((s) => <Stat key={s.label} {...s} />)}
    </dl>
  );
}
