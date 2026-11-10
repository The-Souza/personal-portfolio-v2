import { useTranslations } from "next-intl";
import { BracketPanel } from "@/components/BracketPanel";
import { Tag, TagGroup } from "@/components/Tag";
import { Terminal, type TerminalLine } from "@/components/Terminal";
import { STACK_CATEGORIES } from "@/content/stack";
import { Container } from "@/features/shared/Container";
import { SectionHeading } from "@/features/shared/SectionHeading";
import { StackStage } from "@/features/stack/StackStage";
import { pad2 } from "@/lib/format";

const NODE_CLASS = "recede-content flex flex-col gap-4 bg-background p-7 in-data-compact:gap-2.5 in-data-compact:px-4.5 in-data-compact:py-4";
const TITLE_CLASS = "font-heading text-heading in-data-compact:text-2xl";

/**
 * Brief, act 04 · C. The server HTML is a grid that reads without JS (and with reduced motion);
 * StackStage turns it into the pinned stair circuit, with the trace and the dot already in here.
 */
export function StackAct() {
  const t = useTranslations("stack");
  const total = pad2(STACK_CATEGORIES.length);
  const aiLines: TerminalLine[] = [...(t.raw("ai.terminal") as TerminalLine[]), { prefix: "cursor", text: "" }];

  return (
    <section id="stack" aria-label={t("aria")} className="relative z-4 bg-card">
      <StackStage>
        {/* Hidden only until StackStage lays out the circuit, so the server grid never flashes.
            If the script fails after the inline one marked the page `js`, the grid shows after 3s. */}
        <div
          data-stack-pin
          className="js:motion-safe:not-data-ready:invisible js:motion-safe:not-data-ready:animate-[reveal-fallback_0s_3s_forwards]"
        >
          <Container data-stack-head className="pt-30">
            <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
          </Container>
          <div data-stack-stage className="tablet:hud-fade">
            <Container
              data-stack-board
              className="relative grid grid-cols-[repeat(auto-fill,minmax(min(100%,21.25rem),1fr))] gap-x-8 gap-y-10 pt-10 pb-30"
            >
              <svg data-stack-trace aria-hidden="true" className="pointer-events-none absolute top-0 left-0 hidden overflow-visible">
                <path data-stack-base className="fill-none stroke-field-border [stroke-dasharray:4_6]" strokeWidth={2} />
                <path data-stack-live className="glow-trace fill-none stroke-primary" strokeWidth={2} />
              </svg>

              {STACK_CATEGORIES.map((category, i) => (
                <div key={category.key} data-stack-node>
                  <BracketPanel as="article" eyebrow={t("layer", { current: pad2(i + 1), total })} className={NODE_CLASS}>
                    <h3 className={TITLE_CLASS}>{t(`categories.${category.key}`)}</h3>
                    <TagGroup>
                      {category.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </TagGroup>
                    {category.runningHere && <p className="font-mono text-eyebrow text-muted-foreground uppercase">{t("runningHere")}</p>}
                  </BracketPanel>
                </div>
              ))}

              <div data-stack-node data-stack-ai>
                <BracketPanel as="article" tone="focus" eyebrow={t("ai.eyebrow")} className={NODE_CLASS}>
                  <h3 className={TITLE_CLASS}>{t("ai.title")}</h3>
                  <div data-stack-terminal>
                    <Terminal lines={aiLines} blink />
                  </div>
                  <p className="text-sm text-muted-foreground">{t("ai.note")}</p>
                  {/* A list as long as a sentence, so no uppercase (DESIGN.md keeps it to labels). */}
                  <p className="font-mono text-xs leading-relaxed tracking-wide text-muted-foreground">{t("ai.practices")}</p>
                </BracketPanel>
              </div>

              {/* The dot runs behind the cards (lower z-index), which are opaque. */}
              <span data-stack-dot aria-hidden="true" className="glow-dot pointer-events-none absolute top-0 left-0 z-1 hidden size-3 bg-foreground" />
            </Container>
          </div>
        </div>
        {/* On short screens the AI card leaves the circuit and comes after it. */}
        <Container data-stack-after className="pb-30 empty:hidden" />
      </StackStage>
    </section>
  );
}
