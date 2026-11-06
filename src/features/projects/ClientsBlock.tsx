import { useTranslations } from "next-intl";
import { CLIENTS, HAS_EXAMPLE_CLIENTS } from "@/content/clients";
import { CARD_ACTIVE } from "@/features/projects/ProjectCard";
import { RevealImage } from "@/features/reveal-image/RevealImage";

export function ClientsBlock() {
  const t = useTranslations("clients");
  const tProjects = useTranslations("projects");

  return (
    <section
      data-project-card
      aria-label={t("aria")}
      className={`brackets relative w-full max-w-270 p-2.5 track:w-[88vw] track:flex-none ${CARD_ACTIVE}`}
    >
      <div className="chamfer relative flex flex-col gap-4.5 bg-card p-6.5 [--cut:1.25rem]">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-col gap-2.5">
            <p className="font-mono text-eyebrow text-primary-accessible uppercase">{t("eyebrow")}</p>
            <h3 className="font-heading text-heading">{t("title")}</h3>
          </div>
          {HAS_EXAMPLE_CLIENTS && (
            <span className="bg-destructive px-2.5 py-1.75 font-mono text-xs leading-none tracking-widest text-background uppercase">
              {t("fake")}
            </span>
          )}
        </div>

        <div className="grid gap-3.5 tablet:grid-cols-2">
          {CLIENTS.map((client, i) => {
            const item = (field: string) => `items.${client.key}.${field}`;
            return (
              // Tablet and phone show the first two cases; all four from desktop (`lg`) up.
              <article
                key={client.key}
                className="grid gap-3.5 bg-background p-3 xs:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] max-lg:nth-[n+3]:hidden"
              >
                <RevealImage
                  effect="dither"
                  seed={71 + i * 13}
                  placeholderLabel={tProjects("imagePlaceholder")}
                  alt={t("preview", { name: t(item("name")) })}
                  className="chamfer min-h-29.5 [--cut:0.5rem]"
                />
                <div className="flex min-w-0 flex-col gap-1.5 py-1">
                  <p className="font-mono text-eyebrow text-primary-accessible uppercase">
                    {t("code", { number: i + 1 })} · {t(item("segment"))}
                  </p>
                  <h4 className="font-heading text-xl leading-tight font-semibold">{t(item("name"))}</h4>
                  <p className="text-sm text-muted-foreground">{t(item("challenge"))}</p>
                  <p className="text-sm">
                    {t.rich(item("result"), {
                      b: (chunks) => <b className="font-heading text-lg font-semibold text-primary-accessible">{chunks}</b>,
                    })}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <span data-wipe aria-hidden="true" className="pointer-events-none absolute inset-0 z-2 origin-right scale-x-0 bg-background" />
      </div>
    </section>
  );
}
