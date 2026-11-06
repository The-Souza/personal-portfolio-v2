import { useTranslations } from "next-intl";
import { Tag, TagGroup } from "@/components/Tag";
import { Terminal, type TerminalLine } from "@/components/Terminal";
import type { Project } from "@/content/projects";
import { RevealImage } from "@/features/reveal-image/RevealImage";
import { ActionLink } from "@/features/shared/ActionLink";

/** Active state (set by ProjectsStage): bright corners and a cyan glow. */
export const CARD_ACTIVE = "data-[active=true]:[--bc:var(--foreground)] data-[active=true]:glow-active";

export function ProjectCard({ project }: { project: Project }) {
  const t = useTranslations("projects");
  const item = (field: string) => `items.${project.key}.${field}`;
  const terminal = t.has(item("terminal")) ? (t.raw(item("terminal")) as TerminalLine[]) : null;

  return (
    <article data-project-card className={`brackets relative isolate w-full max-w-245 p-2.5 track:w-[84vw] track:flex-none ${CARD_ACTIVE}`}>
      {project.ghost && (
        // The v1 ghost sits behind the card and only shows after the reveal glitch.
        <div data-ghost aria-hidden="true" className="pointer-events-none absolute inset-2.5 -z-10 border border-hot p-3 opacity-0">
          <p className="font-mono text-xs tracking-widest text-hot-accessible uppercase">{t("ghost")}</p>
        </div>
      )}
      <div className="chamfer relative grid bg-card [--cut:1.25rem] tablet:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <RevealImage effect="mosaic" seed={project.seed} placeholderLabel={t("imagePlaceholder")} className="min-h-37.5 tablet:min-h-70" />

        <div className="flex min-w-0 flex-col gap-3 px-7 pt-6.5 pb-7">
          <p className="font-mono text-eyebrow text-primary-accessible uppercase">
            {project.code} · {t(item("category"))}
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
            <b className="mr-1.5 font-mono text-xs font-medium tracking-widest text-primary-accessible uppercase">{t("result")}</b>
            {t(item("result"))}
          </p>
          {terminal && (
            <div data-project-terminal>
              <Terminal lines={terminal} className="bg-background px-3 py-2.5 text-xs" />
            </div>
          )}
          <TagGroup>
            {project.live && <Tag variant="live">{t("live")}</Tag>}
            {project.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </TagGroup>
          <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2">
            {project.links.map((link) => (
              <ActionLink key={link.href} href={link.href} external>
                {t(`links.${link.label}`)}
              </ActionLink>
            ))}
            {project.privateRepo && (
              <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">{t("privateRepo")}</span>
            )}
          </div>
        </div>

        {/* Curtain that opens before the reveal; collapsed in the server HTML so nothing is hidden without JS. */}
        <span data-wipe aria-hidden="true" className="pointer-events-none absolute inset-0 z-2 origin-right scale-x-0 bg-background" />
      </div>
    </article>
  );
}
