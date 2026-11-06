import { useTranslations } from "next-intl";
import { BracketPanel } from "@/components/BracketPanel";
import { Button } from "@/components/Button";
import { Rail, Target } from "@/components/HudMarkers";
import { HeroStage } from "@/features/hero/HeroStage";
import { ActionLink } from "@/features/shared/ActionLink";
import { Container } from "@/features/shared/Container";

export function HeroAct() {
  const t = useTranslations("hero");
  const panelClass = "max-lg:flex-[0_1_17.5rem] max-phone:flex-auto";

  return (
    <section id="hero" aria-label={t("aria")} className="relative z-1 overflow-x-clip bg-background">
      <HeroStage>
        {/* From `rail` up the left margin clears the Rail (~38px wide from 14px), which would
            otherwise cover the actions on short screens like 1040×742. */}
        <Container
          data-hero="content"
          className="relative flex flex-wrap content-center items-center justify-between gap-x-12 gap-y-10 pt-24 pb-14 rail:pl-16"
        >
          <div className="flex min-w-0 flex-[999_1_32.5rem] flex-col gap-6">
            <p data-hero="eyebrow" className="font-mono text-eyebrow text-primary-accessible uppercase">
              {t("eyebrow")}
            </p>
            <h1 data-hero="name" className="relative font-heading text-impact uppercase">
              <span className="sr-only">
                {t("firstName")} {t("lastName")}
              </span>
              <span data-hero="name-visual" aria-hidden="true" className="flex flex-col">
                <span data-hero="first" className="block whitespace-nowrap">
                  {t("firstName")}
                </span>
                <span data-hero="last" className="block whitespace-nowrap">
                  {t("lastName")}
                </span>
              </span>
            </h1>
            <p data-hero="bio" className="max-w-[56ch] text-lead text-muted-foreground">
              {t("bio")}
            </p>
            <div data-hero="actions" className="flex flex-wrap items-center gap-x-7 gap-y-5">
              <Button href="#projects">{t("viewProjects")}</Button>
              <ActionLink href="#contact">{t("contact")}</ActionLink>
            </div>
          </div>

          <div className="flex max-w-75 flex-[1_1_15rem] flex-col gap-6 max-lg:max-w-none max-lg:basis-full max-lg:flex-row max-lg:justify-end max-lg:gap-5 max-phone:flex-col">
            <div data-hero="panel" className={panelClass}>
              <BracketPanel
                animatedCorners
                tone="focus"
                eyebrow={t("now.eyebrow")}
                title={t("now.company")}
                details={[t("now.role"), t("now.since")]}
              />
            </div>
            <div data-hero="panel" className={panelClass}>
              <BracketPanel
                animatedCorners
                eyebrow={t("status.eyebrow")}
                title={`● ${t("status.online")}`}
                details={[t("status.line"), t("status.place")]}
              />
            </div>
          </div>
        </Container>

        <div data-hero="rail" className="absolute bottom-14 left-3.5 max-rail:hidden">
          <Rail>{t("rail")}</Rail>
        </div>
        <div data-hero="target" className="absolute top-24 right-14 max-rail:hidden">
          <Target />
        </div>
      </HeroStage>
    </section>
  );
}
