import { useTranslations } from "next-intl";
import { BracketPanel } from "@/components/BracketPanel";
import { Tag, TagGroup } from "@/components/Tag";
import { Terminal, type TerminalLine } from "@/components/Terminal";
import { STACK_CATEGORIES } from "@/content/stack";
import { Container } from "@/features/shared/Container";
import { SectionHeading } from "@/features/shared/SectionHeading";
import { pad2 } from "@/lib/format";

/** Grid in the server HTML; Phase 6 lays the cards out as the stair circuit. */
export function StackAct() {
  const t = useTranslations("stack");
  const total = pad2(STACK_CATEGORIES.length);
  const aiLines: TerminalLine[] = [...(t.raw("ai.terminal") as TerminalLine[]), { prefix: "cursor", text: "" }];

  return (
    <section id="stack" aria-label={t("aria")} className="relative z-4 bg-card">
      <Container className="pt-30">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
      </Container>
      <Container className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,21.25rem),1fr))] gap-x-8 gap-y-10 pt-10 pb-30">
        {STACK_CATEGORIES.map((category, i) => (
          <BracketPanel
            key={category.key}
            as="article"
            eyebrow={t("layer", { current: pad2(i + 1), total })}
            className="flex flex-col gap-4 bg-background p-7"
          >
            <h3 className="font-heading text-heading">{t(`categories.${category.key}`)}</h3>
            <TagGroup>
              {category.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </TagGroup>
            {category.runningHere && <p className="font-mono text-eyebrow text-muted-foreground uppercase">{t("runningHere")}</p>}
          </BracketPanel>
        ))}

        <BracketPanel as="article" tone="focus" eyebrow={t("ai.eyebrow")} className="flex flex-col gap-4 bg-background p-7">
          <h3 className="font-heading text-heading">{t("ai.title")}</h3>
          <Terminal lines={aiLines} blink />
          <p className="text-sm text-muted-foreground">{t("ai.note")}</p>
          <p className="font-mono text-xs leading-relaxed tracking-wider text-muted-foreground uppercase">{t("ai.practices")}</p>
        </BracketPanel>
      </Container>
    </section>
  );
}
