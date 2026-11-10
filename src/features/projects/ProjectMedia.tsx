import { useTranslations } from "next-intl";
import { Tag, TagGroup } from "@/components/Tag";
import type { Project } from "@/content/projects";
import { RevealImage } from "@/features/reveal-image/RevealImage";

/**
 * The card's "monitor": a window bar and the screenshot whole in its own shape (never cropped,
 * no empty bands). From `rail` up it heads the media column, above the stack panel.
 */
export function ProjectMedia({ project }: { project: Project }) {
  const t = useTranslations("projects");

  return (
    <figure className="flex min-w-0 flex-col border-b border-border bg-background rail:col-start-1 rail:row-start-1 rail:border-r rail:border-b-0">
      <div
        aria-hidden="true"
        className="flex h-8.5 shrink-0 items-center gap-2.5 border-b border-border px-4 font-mono text-xs leading-none tracking-wide text-muted-foreground"
      >
        <span className="size-2 shrink-0 bg-primary" />
        <span className="size-2 shrink-0 bg-field-border" />
        <span className="size-2 shrink-0 bg-field-border" />
        <span className="truncate">{project.address}</span>
      </div>

      <RevealImage
        effect="mosaic"
        seed={project.seed}
        placeholderLabel={t("imagePlaceholder")}
        image={project.image}
        // Half of the track's card (84vw, at most 61.25rem) from `rail` up; the full width in the list.
        sizes="(min-width: 56.25rem) min(42vw, 30rem), 92vw"
        alt={t("imageAlt", { name: t(`items.${project.key}.title`) })}
      />
    </figure>
  );
}

/**
 * The stack panel. In one column (phones, narrow tablets) it closes the card, after the text: six
 * tags between the screenshot and the title pushed the project's name below the fold. From `rail`
 * up it sits under the screenshot and takes whatever height the card has left, so it fits any
 * card height, a tall one (with a terminal) included.
 */
export function ProjectStack({ project }: { project: Project }) {
  const t = useTranslations("projects");

  return (
    <div className="dot-grid flex min-w-0 flex-col gap-2.5 border-t border-border bg-background px-4 pt-3.5 pb-5 rail:col-start-1 rail:row-start-2 rail:border-r">
      <p className="font-mono text-eyebrow text-primary-accessible uppercase">{t("stackLabel")}</p>
      <TagGroup>
        {project.live && <Tag variant="live">{t("live")}</Tag>}
        {project.tags.map((tag) => (
          <Tag key={tag} variant="plain">
            {tag}
          </Tag>
        ))}
      </TagGroup>
    </div>
  );
}
