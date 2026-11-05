import { cn } from "@/lib/utils";

export interface StatProps {
  /** Uma palavra: "Projetos", "Anos". */
  label: string;
  /** Só números reais. */
  value: string | number;
  /** Unidade pequena em `primary-accessible`, ex.: "%". */
  unit?: string;
}

/** Um número grande com label em mono. Use dentro de StatGroup. */
export function Stat({ label, value, unit }: StatProps) {
  return (
    <div className="flex flex-col-reverse gap-2">
      <dt className="font-mono text-xs font-medium whitespace-nowrap uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="font-heading text-4xl font-semibold leading-[0.8] tracking-[-0.04em] tabular-nums">
        {value}
        {unit && <small className="ml-0.5 text-[0.45em] tracking-normal text-primary-accessible">{unit}</small>}
      </dd>
    </div>
  );
}

export interface StatGroupProps {
  /** Até três itens. */
  items: StatProps[];
  className?: string;
}

/** Grupo de até três Stats lado a lado. */
export function StatGroup({ items, className }: StatGroupProps) {
  return (
    <dl className={cn("mt-6 grid grid-cols-[repeat(3,auto)] justify-start gap-x-8 gap-y-4", className)}>
      {items.map((s) => <Stat key={s.label} {...s} />)}
    </dl>
  );
}
