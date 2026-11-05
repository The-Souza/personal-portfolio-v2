import { useTranslations } from "next-intl";
import { BracketPanel } from "@/components/BracketPanel";
import { StatGroup } from "@/components/Stat";
import { Container } from "@/features/shared/Container";
import { SectionHeading } from "@/features/shared/SectionHeading";

interface Milestone {
  year: string;
  code: string;
  title: string;
  description: string;
}

interface AboutStat {
  value: string;
  label: string;
  note: string;
}

export function AboutAct() {
  const t = useTranslations("about");
  const paragraphs = t.raw("paragraphs") as string[];
  const milestones = t.raw("milestones") as Milestone[];
  const stats = t.raw("stats") as AboutStat[];

  return (
    <section id="about" aria-label={t("aria")} className="relative z-2 bg-card">
      <Container className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-12 pt-35 pb-30 max-about:grid-cols-1 short:grid-cols-1">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} className="sticky top-30 self-start max-about:static short:static" />

        <div className="relative flex flex-col gap-14 pl-12">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-px bg-border" />

          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="max-w-[42ch] text-[clamp(1.125rem,1.8vw,1.5rem)] leading-normal">
              {paragraph}
            </p>
          ))}

          <ol className="flex flex-col gap-6">
            {milestones.map((milestone) => (
              <li key={milestone.code}>
                <BracketPanel className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] items-start gap-6 p-5.5 max-about:grid-cols-1">
                  <p aria-hidden="true" className="font-heading text-[clamp(3.5rem,7vw,6rem)] leading-[0.9] font-bold tracking-tight opacity-40">
                    {milestone.year}
                  </p>
                  <div className="flex flex-col gap-2">
                    <p className="font-mono text-eyebrow text-primary-accessible uppercase">{milestone.code}</p>
                    <h3 className="font-heading text-heading">{milestone.title}</h3>
                    <p>{milestone.description}</p>
                  </div>
                </BracketPanel>
              </li>
            ))}
          </ol>

          <StatGroup items={stats} className="mt-0 flex flex-wrap gap-x-10 gap-y-6" />
        </div>
      </Container>
    </section>
  );
}
