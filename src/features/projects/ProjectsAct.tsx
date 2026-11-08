import { PROJECTS } from "@/content/projects";
import { ProjectCard } from "@/features/projects/ProjectCard";
import { ProjectsStage } from "@/features/projects/ProjectsStage";
import { Container } from "@/features/shared/Container";
import { SectionHeading } from "@/features/shared/SectionHeading";
import { useTranslations } from "next-intl";

/**
 * Brief, act 03 · A. The `track:` variant (tablet and up, at least 600px tall, motion allowed)
 * lays the cards out as a horizontal track already in the server HTML, scrollable on its own
 * without JS; ProjectsStage pins it. Phones, short screens and reduced motion get the list.
 */
export function ProjectsAct() {
  const t = useTranslations("projects");

  return (
    <section
      id="projects"
      aria-label={t("aria")}
      className="relative z-3 bg-background"
    >
      <ProjectsStage>
        <Container className="pt-22 pb-5">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
        </Container>
        {/* Scrolls sideways only without JS; with JS the track moves by transform, so `js:` locks it
            from the first paint. overflow-x alone would turn overflow-y to auto too. */}
        <div
          data-projects-viewport
          className="track:flex track:flex-1 track:items-center track:overflow-x-auto track:overflow-y-hidden track:js:overflow-hidden"
        >
          <Container
            data-projects-track
            className="relative flex flex-col items-center gap-12 pt-6 pb-30 track:w-max track:max-w-none track:flex-row track:gap-[5vw] track:px-[8vw] track:py-0"
          >
            {PROJECTS.map((project) => (
              <ProjectCard key={project.key} project={project} />
            ))}
            {/* <ClientsBlock /> */}
          </Container>
        </div>
        <Container
          aria-hidden="true"
          className="hidden items-center gap-3 pb-6 font-mono text-xs text-foreground tabular-nums track:flex"
        >
          <div className="h-4.5 w-50 border border-field-border p-0.75">
            <span
              data-projects-bar
              className="segments block h-full w-0 text-foreground"
            />
          </div>
          <span data-projects-counter>
            01 / {String(PROJECTS.length + 1).padStart(2, "0")}
          </span>
        </Container>
      </ProjectsStage>
    </section>
  );
}
