import { useTranslations } from "next-intl";
import { Tag, TagGroup } from "@/components/Tag";
import type { Project } from "@/content/projects";
import { RevealImage } from "@/features/reveal-image/RevealImage";

/**
 * The card's media column, a "monitor": a window bar, the screenshot whole in its own shape (never
 * cropped, no empty bands) and the stack panel, which takes whatever height the card has left. So
 * it fits any card height, a tall one (with a terminal) included.
 */
export function ProjectMedia({ project }: { project: Project }) {
  const t = useTranslations("projects");

  return (
    <figure className="flex min-w-0 flex-col border-b border-border bg-background rail:border-r rail:border-b-0">
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

      <figcaption className="dot-grid flex flex-1 flex-col gap-2.5 border-t border-border px-4 pt-3.5 pb-5">
        <p className="font-mono text-eyebrow text-primary-accessible uppercase">{t("stackLabel")}</p>
        <TagGroup>
          {project.live && <Tag variant="live">{t("live")}</Tag>}
          {project.tags.map((tag) => (
            <Tag key={tag} variant="plain">
              {tag}
            </Tag>
          ))}
        </TagGroup>
      </figcaption>
    </figure>
  );
}
