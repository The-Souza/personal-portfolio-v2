"use client";

import { ACT_IDS } from "@/content/acts";
import { useActiveSection } from "@/features/hud/use-active-section";
import { pad2 } from "@/lib/format";
import { useTranslations } from "next-intl";

/** Side rail with one mark per act, from 720px up. */
export function SideHud() {
  const t = useTranslations("hud");
  const { index, progress } = useActiveSection();

  return (
    <>
      <nav
        aria-label={t("label")}
        className="fixed top-1/2 right-0 z-35 hidden -translate-y-1/2 flex-col items-end gap-1.5 pr-3.5 tablet:flex"
      >
        {ACT_IDS.map((id, i) => (
          <a
            key={id}
            href={`#${id}`}
            // Starts with the visible number (WCAG 2.5.3): voice control users say what they see.
            aria-label={t("goTo", { number: pad2(i + 1), act: t(`acts.${id}`) })}
            aria-current={i === index ? "true" : undefined}
            className="group flex items-center gap-2 py-1 font-mono text-xs leading-none tracking-widest text-muted-foreground aria-current:text-primary-accessible"
          >
            <span aria-hidden="true">{pad2(i + 1)}</span>
            <span
              aria-hidden="true"
              className="block h-px w-3.5 bg-field-border group-aria-current:w-8 group-aria-current:bg-primary"
            />
          </a>
        ))}
      </nav>
      <p
        aria-hidden="true"
        className="fixed right-0 bottom-0 z-35 hidden pr-3.5 pb-3.5 font-mono text-xs leading-none tracking-widest text-muted-foreground uppercase tabular-nums mix-blend-difference tablet:block"
      >
        {t("reading", {
          number: pad2(index + 1),
          act: t(`acts.${ACT_IDS[index]}`),
          percent: progress,
        })}
      </p>
    </>
  );
}
