"use client";

import { ACT_IDS } from "@/content/acts";
import { useOverPoster } from "@/features/hud/over-poster";
import { useActiveSection } from "@/features/hud/use-active-section";
import { pad2 } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

/** Side rail with one mark per act, from 720px up. */
export function SideHud() {
  const t = useTranslations("hud");
  const { index, progress } = useActiveSection();
  // Over the Alert poster the HUD takes its tokens (black on yellow), like the poster's own text.
  const over = useOverPoster();

  return (
    <>
      <nav
        aria-label={t("label")}
        // On touch screens (tablets) the gap moves into the links, which grow to 44px tall.
        className={cn(
          "fixed top-1/2 right-0 z-35 hidden -translate-y-1/2 flex-col items-end gap-1.5 pr-3.5 tablet:flex pointer-coarse:gap-0",
          over.marks && "alert",
        )}
      >
        {ACT_IDS.map((id, i) => (
          <a
            key={id}
            href={`#${id}`}
            // Starts with the visible number (WCAG 2.5.3): voice control users say what they see.
            aria-label={t("goTo", { number: pad2(i + 1), act: t(`acts.${id}`) })}
            aria-current={i === index ? "true" : undefined}
            className="group flex items-center gap-2 py-1 pointer-coarse:py-4 pointer-coarse:pl-3 font-mono text-xs leading-none tracking-widest text-muted-foreground aria-current:text-primary-accessible"
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
        className={cn(
          "fixed right-0 bottom-0 z-35 hidden pr-3.5 pb-3.5 font-mono text-xs leading-none tracking-widest text-muted-foreground uppercase tabular-nums tablet:block",
          over.reading ? "alert" : "mix-blend-difference",
        )}
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
