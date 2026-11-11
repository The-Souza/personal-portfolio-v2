import { getLocale, getTranslations } from "next-intl/server";
import { BracketPanel } from "@/components/BracketPanel";
import { Button } from "@/components/Button";
import { Target, WarningMark } from "@/components/HudMarkers";
import type { TerminalLine } from "@/components/Terminal";
import { NotFoundLog } from "@/features/special/not-found/NotFoundLog";
import { NotFoundStage } from "@/features/special/not-found/NotFoundStage";
import { SpecialShell } from "@/features/special/shared/SpecialShell";

// Set as HTML, not as React children: the scramble writes into these spans directly.
const digit = (value: string) => ({ __html: value });

/** The 404 (brief, section 11), rendered on the server; NotFoundStage adds the motion. */
export async function NotFoundView() {
  const locale = await getLocale();
  const t = await getTranslations("notFound");
  const special = await getTranslations("special");
  const header = await getTranslations("header");
  const home = `/${locale}`;

  return (
    <NotFoundStage aimLabel={t("aim")}>
      <SpecialShell
        band="checker"
        homeHref={home}
        foot={t("foot")}
        texts={{
          logoName: header("logoName"),
          logoSuffix: header("logoSuffix"),
          logoLabel: special("logoLabel"),
          place: special("place"),
          mark: special("mark"),
        }}
        left={
          <>
            <p data-special-item className="font-mono text-eyebrow text-primary-accessible uppercase">
              {t("eyebrow")}
            </p>
            <div data-big className="relative self-start">
              <p
                aria-hidden="true"
                className="flex font-heading text-[clamp(7.5rem,20vw,17.5rem)] leading-huge font-bold tracking-tight whitespace-nowrap"
              >
                <span data-digit className="inline-block" dangerouslySetInnerHTML={digit("4")} />
                <span data-digit data-zero className="relative z-2 inline-block will-change-transform" dangerouslySetInnerHTML={digit("0")} />
                <span data-digit className="inline-block" dangerouslySetInnerHTML={digit("4")} />
              </p>
              <i data-slot aria-hidden="true" className="pointer-events-none absolute border border-dashed border-muted-foreground opacity-0" />
            </div>
            <h1 data-special-title className="font-heading text-[clamp(2.125rem,4.4vw,3.5rem)] leading-display font-bold text-balance uppercase">
              {t("title")}
            </h1>
            <p data-special-item className="max-w-[56ch] text-lead text-muted-foreground">
              {t("lead")}
            </p>
            <div data-special-item className="mt-1.5 flex flex-wrap gap-4">
              <Button href={home} variant="solid">
                {special("home")}
              </Button>
              <Button href={`${home}#projects`}>{t("projects")}</Button>
            </div>
          </>
        }
        right={
          <>
            <div data-special-item className="flex items-start justify-between gap-4">
              <WarningMark>{t("warning")}</WarningMark>
              <Target />
            </div>
            <div data-special-item>
              <BracketPanel tone="focus" filled eyebrow={t("log")}>
                <NotFoundLog lines={t.raw("lines") as TerminalLine[]} />
              </BracketPanel>
            </div>
          </>
        }
      />
    </NotFoundStage>
  );
}
