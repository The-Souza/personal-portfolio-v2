import { useTranslations } from "next-intl";
import { PROJECTS } from "@/content/projects";
import { ClientsBlock } from "@/features/projects/ClientsBlock";
import { ProjectCard } from "@/features/projects/ProjectCard";
import { Container } from "@/features/shared/Container";
import { SectionHeading } from "@/features/shared/SectionHeading";

/** Vertical list in the server HTML; Phase 5 turns it into the horizontal track where the screen allows. */
export function ProjectsAct() {
  const t = useTranslations("projects");

  return (
    <section id="projects" aria-label={t("aria")} className="relative z-3 bg-background">
      <Container className="pt-22 pb-5">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
      </Container>
      <Container className="flex flex-col items-center gap-12 pt-6 pb-30">
        {PROJECTS.map((project) => (
          <ProjectCard key={project.key} project={project} />
        ))}
        <ClientsBlock />
      </Container>
    </section>
  );
}
