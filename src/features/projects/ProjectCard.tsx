import { useTranslations } from "next-intl";
import { Tag, TagGroup } from "@/components/Tag";
import { Terminal, type TerminalLine } from "@/components/Terminal";
import type { Project } from "@/content/projects";
import { ActionLink } from "@/features/shared/ActionLink";

export function ProjectCard({ project }: { project: Project }) {
  const t = useTranslations("projects");
  const item = (field: string) => `items.${project.key}.${field}`;
  const terminal = t.has(item("terminal")) ? (t.raw(item("terminal")) as TerminalLine[]) : null;

  return (
    <article className="brackets relative w-full max-w-245 p-2.5">
      <div className="chamfer grid bg-card [--cut:1.25rem] tablet:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        {/* Placeholder until the screenshots arrive in public/images/; Phase 5 adds RevealImage. */}
        <div aria-hidden="true" className="flex min-h-37.5 items-end bg-secondary p-4 tablet:min-h-70">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{t("imagePlaceholder")}</span>
        </div>

        <div className="flex min-w-0 flex-col gap-3 px-7 pt-6.5 pb-7">
          <p className="font-mono text-eyebrow text-primary-accessible uppercase">
            {project.code} · {t(item("category"))}
          </p>
          <h3 className="font-heading text-heading text-balance">{t(item("title"))}</h3>
          <p className="text-sm leading-normal">{t(item("description"))}</p>
          <p className="text-sm text-muted-foreground">
            <b className="mr-1.5 font-mono text-xs font-medium tracking-widest text-primary-accessible uppercase">{t("result")}</b>
            {t(item("result"))}
          </p>
          {terminal && <Terminal lines={terminal} className="bg-background px-3 py-2.5 text-xs" />}
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
      </div>
    </article>
  );
}
