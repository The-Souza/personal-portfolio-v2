import { useTranslations } from "next-intl";
import { BracketPanel } from "@/components/BracketPanel";
import { StatGroup } from "@/components/Stat";
import { AboutPhoto } from "@/features/about/AboutPhoto";
import { AboutStage } from "@/features/about/AboutStage";
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
      <AboutStage>
        <Container className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-12 pt-35 pb-30 max-about:grid-cols-1 short:grid-cols-1">
        <div className="sticky top-30 flex min-w-0 flex-col gap-8 self-start max-about:static short:static short:flex-row short:items-start">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} className="short:flex-1" />
          <AboutPhoto className="short:w-2/5" />
        </div>

        <div data-about="column" className="relative flex flex-col gap-14 pl-12">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-px bg-border" />
          {/* Starts empty: it shows scroll progress, which only the client knows. */}
          <span data-about="thread" aria-hidden="true" className="absolute inset-y-0 left-0 w-px origin-top scale-y-0 bg-foreground" />
          <span data-about="marker" aria-hidden="true" className="absolute top-0 -left-1.25 size-2.75 bg-primary" />

          {paragraphs.map((paragraph) => (
            <p key={paragraph} data-about="paragraph" className="max-w-[42ch] text-[clamp(1.125rem,1.8vw,1.5rem)] leading-normal">
              {paragraph}
            </p>
          ))}

          <ol className="flex flex-col gap-6">
            {milestones.map((milestone) => (
              <li key={milestone.code} data-about="milestone">
                <BracketPanel className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] items-start gap-6 p-5.5 max-about:grid-cols-1">
                  <p
                    data-about="year"
                    aria-hidden="true"
                    className="font-heading text-[clamp(3.5rem,7vw,6rem)] leading-[0.9] font-bold tracking-tight opacity-40"
                  >
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

          <div data-about="stats">
            <StatGroup items={stats} className="mt-0 flex flex-wrap gap-x-10 gap-y-6" />
          </div>
        </div>
        </Container>
      </AboutStage>
    </section>
  );
}
