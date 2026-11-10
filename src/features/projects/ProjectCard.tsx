import { Terminal, type TerminalLine } from "@/components/Terminal";
import type { Project } from "@/content/projects";
import { ProjectMedia, ProjectStack } from "@/features/projects/ProjectMedia";
import { ActionLink } from "@/features/shared/ActionLink";
import { NewTabHint } from "@/features/shared/NewTabHint";
import { useTranslations } from "next-intl";

/** Active state (set by ProjectsStage): bright corners and a cyan glow. */
export const CARD_ACTIVE =
  "data-[active=true]:[--bc:var(--foreground)] data-[active=true]:glow-active";

/** `number` is the card's place on the track ("01"); its system id is translated per locale. */
export function ProjectCard({ project, number }: { project: Project; number: string }) {
  const t = useTranslations("projects");
  const item = (field: string) => `items.${project.key}.${field}`;
  const terminal = t.has(item("terminal"))
    ? (t.raw(item("terminal")) as TerminalLine[])
    : null;

  // On the track a centered card leaves 6.5rem on each side, where the side HUD and its fade sit
  // (see `hud-fade`): at 84vw a tablet's card ran under the marks.
  return (
    <article
      data-project-card
      className={`brackets recede relative isolate w-full max-w-245 p-2.5 track:w-[min(84vw,100vw-13rem)] track:flex-none ${CARD_ACTIVE}`}
    >
      {project.ghost && (
        // The v1 ghost sits behind the card and only shows after the reveal glitch.
        <div
          data-ghost
          aria-hidden="true"
          className="pointer-events-none absolute inset-2.5 -z-10 border border-hot p-3 opacity-0"
        >
          <p className="font-mono text-xs tracking-widest text-hot-accessible uppercase">
            {t("ghost")}
          </p>
        </div>
      )}
      {/* One column: screenshot, text, stack. From `rail` up: screenshot over stack on the left,
          the text spanning both rows on the right. */}
      <div className="chamfer relative grid bg-card [--cut:1.25rem] rail:grid-cols-2 rail:grid-rows-[auto_1fr]">
        <ProjectMedia project={project} />

        <div className="flex min-w-0 flex-col gap-3 px-7 pt-6.5 pb-7 rail:col-start-2 rail:row-span-2 rail:row-start-1">
          <p className="font-mono text-eyebrow text-primary-accessible uppercase">
            {t("code", { number })} · {t(item("category"))}
          </p>
          <h3 className="font-heading text-heading text-balance">
            <span className="sr-only">{t(item("title"))}</span>
            {/* The reveal scrambles this copy, so the heading's accessible name stays readable. */}
            <span data-project-title aria-hidden="true">
              {t(item("title"))}
            </span>
          </h3>
          <p className="text-sm leading-normal">{t(item("description"))}</p>
          <p className="text-sm text-muted-foreground">
            <b className="mr-1.5 font-mono text-xs font-medium tracking-widest text-primary-accessible uppercase">
              {t(project.outcome ?? "result")}
            </b>
            {t(item("result"))}
          </p>
          {terminal && (
            <div data-project-terminal>
              <Terminal
                lines={terminal}
                className="bg-background px-3 py-2.5 text-xs"
              />
            </div>
          )}
          {/* Rows open up on touch screens, so the links' 44px tap areas don't overlap. */}
          <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 pointer-coarse:gap-y-7.5">
            {project.links.map((link) => (
              <ActionLink key={link.href} href={link.href} external>
                {t(`links.${link.label}`)}
                <NewTabHint />
              </ActionLink>
            ))}
            {project.privateRepo && (
              <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                {t("privateRepo")}
              </span>
            )}
          </div>
        </div>

        <ProjectStack project={project} />

        {/* Curtain that opens before the reveal; collapsed in the server HTML so nothing is hidden without JS. */}
        <span
          data-wipe
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-2 origin-right scale-x-0 bg-background"
        />
      </div>
    </article>
  );
}
